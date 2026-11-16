$(function () {
  var storeKey = 'requiem.registered';
  var load = function () {
    try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (err) { return {}; }
  };
  var save = function (data) {
    try { localStorage.setItem(storeKey, JSON.stringify(data)); } catch (err) { return; }
  };
  var joined = load();

  var base = new Date();
  base.setHours(0, 0, 0, 0);
  var fromData = REQ.events.map(function (e) {
    var d = new Date(base);
    d.setDate(d.getDate() + e.day);
    d.setHours(e.hour);
    return $.extend({}, e, { date: d });
  });
  // tournaments added in admin.html are stored with an ISO date and time
  var fromAdmin = REQ.store.get('requiem.events', []).map(function (e) {
    return $.extend({}, e, { date: new Date(e.iso) });
  });
  var events = fromData.concat(fromAdmin);

  var games = ['All games'];
  events.forEach(function (e) { if (games.indexOf(e.game) === -1) games.push(e.game); });
  var activeGame = 'All games';
  var chips = $('#eventChips');
  games.forEach(function (g) {
    $('<button type="button" class="chip"></button>').text(g).attr('aria-pressed', g === activeGame).appendTo(chips);
  });

  var until = function (date) {
    var mins = Math.floor((date - new Date()) / 60000);
    if (mins <= 0) return 'Started';
    var days = Math.floor(mins / 1440);
    var hours = Math.floor((mins % 1440) / 60);
    if (days > 0) return 'in ' + days + ' d ' + hours + ' h';
    if (hours > 0) return 'in ' + hours + ' h ' + (mins % 60) + ' min';
    return 'in ' + mins + ' min';
  };

  var fillLevel = function (percent) {
    if (percent >= 100) return 'full';
    if (percent >= 80) return 'hot';
    if (percent >= 50) return 'mid';
    return 'ok';
  };

  var slotsLeft = function (e) { return e.slots - e.taken - (joined[e.id] === 'in' ? 1 : 0); };

  var draw = function () {
    var term = $('#eventSearch').val().trim().toLowerCase();
    var sort = $('#eventSort').val();
    var open = $('#onlyOpen').is(':checked');
    var found = events.filter(function (e) {
      var okGame = activeGame === 'All games' || e.game === activeGame;
      var okText = (e.name + ' ' + e.game).toLowerCase().indexOf(term) !== -1;
      var okOpen = !open || slotsLeft(e) > 0 || joined[e.id] === 'in';
      return okGame && okText && okOpen;
    });
    found.sort(function (a, b) {
      if (sort === 'prize') return b.prize - a.prize;
      if (sort === 'slots') return slotsLeft(b) - slotsLeft(a);
      return a.date - b.date;
    });

    var list = $('#eventList').empty();
    var pool = 0;
    if (!found.length) {
      list.append('<div class="empty"><i class="bi bi-trophy" aria-hidden="true"></i><strong>No tournaments match</strong>Clear the search or pick All games to see the full schedule.</div>');
    }
    found.forEach(function (e) {
      pool += e.prize;
      var left = slotsLeft(e);
      var full = left <= 0 && joined[e.id] !== 'in';
      var percent = Math.round(((e.slots - Math.max(left, 0)) / e.slots) * 100);
      var row = $('<article class="panel event lit"></article>').attr('data-id', e.id);
      row.append('<div class="date-block"><b>' + e.date.getDate() + '</b><span>' + e.date.toLocaleDateString('en-GB', { month: 'short' }) + '</span></div>');
      var info = $('<div class="event-info"></div>');
      info.append($('<h3></h3>').text(e.name));
      info.append($('<div class="meta"></div>').append($('<span class="tag hot"></span>').text(e.game)).append($('<span class="tag"></span>').text(e.format)).append($('<span class="tag"></span>').text(e.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))).append($('<span class="tag countdown"></span>').attr('data-time', e.date.getTime()).html('<i class="bi bi-clock" aria-hidden="true"></i> ' + until(e.date))));
      row.append(info);
      row.append('<div class="event-prize prize">' + REQ.money(e.prize) + '<small>prize pool</small></div>');
      row.append('<div class="event-slots"><span class="slots-text">' + (full ? 'No slots left' : left + ' of ' + e.slots + ' slots left') + '</span><div class="meter ' + fillLevel(percent) + '" role="img" aria-label="' + percent + ' percent of slots taken"><i style="width:' + percent + '%"></i></div></div>');
      var label = joined[e.id] === 'in' ? 'Registered' : full ? (joined[e.id] === 'wait' ? 'On waitlist' : 'Join waitlist') : 'Register squad';
      var btn = $('<button type="button" class="btn btn-sm join"></button>').text(label).addClass(joined[e.id] ? 'btn-ghost is-on' : full ? 'btn-ghost' : 'btn-candle').attr('aria-pressed', joined[e.id] ? 'true' : 'false');
      row.append($('<div class="event-act"></div>').append(btn));
      list.append(row);
    });

    var mine = Object.keys(joined).filter(function (k) { return joined[k] === 'in'; }).length;
    $('#eventCount').html('<b>' + found.length + '</b> of ' + events.length + ' tournaments, total prize pool <b>' + REQ.money(pool) + '</b>');
    $('#myCount').text(mine);
    REQ.reveal(list);
  };

  /* Squad registration form, opened from a tournament card */
  var squadModal = document.getElementById('squadModal');
  var modal = bootstrap.Modal.getOrCreateInstance(squadModal);
  var current = null;
  var lastButton = null;
  var sqLocked = false;
  var field = function (id) { return $('#' + id).val(); };
  var sqRules = {
    sqName: function () {
      var v = field('sqName').trim();
      if (!v) return 'Enter a squad name.';
      if (v.length < 3) return 'The squad name needs at least 3 characters.';
      if (v.length > 30) return 'Keep the squad name under 30 characters.';
      if (!/^[\p{L}\p{N}][\p{L}\p{N} .'-]*$/u.test(v)) return 'Use letters, digits, spaces, dots or dashes only.';
      return '';
    },
    sqCaptain: function () {
      var v = field('sqCaptain').trim();
      if (!v) return 'Enter the captain\'s Telegram handle.';
      if (!/^[A-Za-z0-9_]{5,32}$/.test(v)) return 'Use 5 to 32 letters, digits or underscores, without the @ sign.';
      return '';
    },
    sqPlayers: function () {
      var v = String(field('sqPlayers')).trim();
      if (!v) return 'Enter how many players are in the squad.';
      if (!/^\d+$/.test(v)) return 'Use a whole number.';
      var need = current ? parseInt(current.format, 10) : 0;
      if (Number(v) !== need) return 'This event needs a full team of ' + need + (need === 1 ? ' player.' : ' players.');
      return '';
    },
    sqEmail: function () {
      var v = field('sqEmail').trim();
      if (!v) return 'Enter an email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email like name@example.com.';
      return '';
    },
    sqPhone: function () {
      var v = field('sqPhone').trim();
      if (!v) return 'Enter a phone number.';
      if (!/^(7|8)7\d{9}$/.test(v.replace(/\D/g, ''))) return 'Use a Kazakhstan mobile number, for example +7 700 123 45 67.';
      return '';
    },
    sqRules: function () { return $('#sqRules').is(':checked') ? '' : 'Confirm that your squad knows the rules.'; }
  };
  var sqCheck = REQ.validator(sqRules);

  var openSquad = function (e, button) {
    current = e;
    lastButton = button;
    sqCheck.reset();
    $('#squadForm')[0].reset();
    var full = e.slots - e.taken <= 0;
    $('#squadTitle').text(full ? 'Join the waitlist' : 'Register your squad');
    $('#squadEvent').text(e.name + ' · ' + e.format + ' · ' + e.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + e.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    $('#squadSubmit').text(full ? 'Join the waitlist' : 'Send registration');
    $('#sqPlayersHint').text('This event needs exactly ' + parseInt(e.format, 10) + ' players.');
    modal.show();
  };

  $(squadModal).on('shown.bs.modal', function () { $('#sqName').trigger('focus'); });
  $(squadModal).on('hidden.bs.modal', function () { if (lastButton) lastButton.trigger('focus'); });

  $('#squadForm').on('submit', function (ev) {
    ev.preventDefault();
    if (sqLocked || !current) return;
    var bad = sqCheck.all();
    if (bad) {
      $('#' + bad).trigger('focus');
      notify('Check the highlighted fields.', 'warn');
      return;
    }
    sqLocked = true;
    var full = current.slots - current.taken <= 0;
    var squad = field('sqName').trim();
    joined[current.id] = full ? 'wait' : 'in';
    save(joined);
    var list = REQ.store.get('requiem.squads', []);
    list.push({ event: current.id, squad: squad, captain: field('sqCaptain').trim(), players: Number(field('sqPlayers')), email: field('sqEmail').trim(), phone: field('sqPhone').trim(), status: joined[current.id], created: new Date().toISOString() });
    REQ.store.set('requiem.squads', list);
    $('#squadForm')[0].reset();
    sqCheck.reset();
    modal.hide();
    notify(full ? squad + ' is on the waitlist for ' + current.name + '.' : 'Squad ' + squad + ' registered for ' + current.name + '.');
    draw();
    setTimeout(function () { sqLocked = false; }, 600);
  });

  var busy = false;
  $('#eventList').on('click', '.join', function () {
    if (busy) return;
    busy = true;
    setTimeout(function () { busy = false; }, 250);
    var button = $(this);
    var id = button.closest('.event').data('id');
    var e = events.filter(function (x) { return x.id === id; })[0];
    if (joined[id]) {
      delete joined[id];
      save(joined);
      REQ.store.set('requiem.squads', REQ.store.get('requiem.squads', []).filter(function (sq) { return sq.event !== id; }));
      notify('Removed from ' + e.name + '.', 'warn');
      draw();
      return;
    }
    openSquad(e, button);
  });

  chips.on('click', '.chip', function () {
    activeGame = $(this).text();
    chips.find('.chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    draw();
  });
  $('#eventSearch').on('input', draw);
  $('#eventSearch').on('keydown', function (e) { if (e.key === 'Escape') { $(this).val(''); draw(); } });
  $('#eventSort, #onlyOpen').on('change', draw);
  REQ.skeleton($('#eventList'), 4, 'row');
  REQ.later(function () { $('#eventList').removeAttr('aria-busy'); draw(); });

  setInterval(function () {
    $('#eventList .countdown').each(function () {
      $(this).html('<i class="bi bi-clock" aria-hidden="true"></i> ' + until(new Date(Number($(this).attr('data-time')))));
    });
  }, 30000);

  var boardGame = 'All';
  var boardChips = $('#boardChips');
  ['All', 'CS2', 'Dota 2', 'Valorant'].forEach(function (g) {
    $('<button type="button" class="chip"></button>').text(g).attr('aria-pressed', g === boardGame).appendTo(boardChips);
  });

  var drawBoard = function () {
    var by = $('#boardSort').val();
    var rows = REQ.teams.filter(function (t) { return boardGame === 'All' || t.game === boardGame; });
    rows.sort(function (a, b) { return b[by] - a[by]; });
    var top = rows.length ? rows[0][by] : 1;
    var box = $('#boardList').empty();
    rows.forEach(function (t, i) {
      var row = $('<article class="panel rank"></article>').toggleClass('first', i === 0);
      row.append('<div class="pos">' + (i + 1) + '</div>');
      row.append($('<div></div>').append($('<h3></h3>').text(t.name)).append($('<div class="sub"></div>').text(t.game + ', captain ' + t.captain + ', ' + t.wins + ' series wins, ' + t.winrate + '% winrate')));
      var shown = by === 'points' ? t.points : by === 'wins' ? t.wins : t.winrate + '%';
      row.append($('<div class="pts"></div>').text(shown).append('<small>' + (by === 'points' ? 'points' : by === 'wins' ? 'wins' : 'winrate') + '</small>'));
      row.append('<div class="meter"><i style="width:' + Math.round((t[by] / top) * 100) + '%"></i></div>');
      box.append(row);
    });
    var points = rows.reduce(function (s, t) { return s + t.points; }, 0);
    $('#boardCount').html('<b>' + rows.length + '</b> squads, average <b>' + (rows.length ? Math.round(points / rows.length) : 0) + '</b> points');
    REQ.reveal(box);
  };
  boardChips.on('click', '.chip', function () {
    boardGame = $(this).text();
    boardChips.find('.chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    drawBoard();
  });
  $('#boardSort').on('change', drawBoard);
  REQ.skeleton($('#boardList'), 4, 'rank');
  REQ.later(function () { $('#boardList').removeAttr('aria-busy'); drawBoard(); });
});
