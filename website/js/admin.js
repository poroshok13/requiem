$(function () {
  var PASS = 'requiem';
  var flag = 'requiem.admin';
  var views = { bookings: '#viewBookings', messages: '#viewMessages', events: '#viewEvents' };
  var view = 'bookings';

  var read = function (k) { return REQ.store.get(k, []); };
  var when = function (iso) { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  var empty = function (icon, title, text) { return '<div class="empty"><i class="bi ' + icon + '" aria-hidden="true"></i><strong>' + title + '</strong>' + text + '</div>'; };
  var line = function (label, text) { return $('<p class="meta"></p>').append($('<b></b>').text(label + ': ')).append(document.createTextNode(text)); };

  var gate = REQ.validator({
    adminPass: function () {
      var v = $('#adminPass').val();
      if (!v) return 'Enter the password.';
      if (v !== PASS) return 'Wrong password. The demo password is shown below.';
      return '';
    }
  });

  var login = function (on) {
    try { sessionStorage.setItem(flag, on ? '1' : ''); } catch (err) { return; }
  };
  var isIn = function () {
    try { return sessionStorage.getItem(flag) === '1'; } catch (err) { return false; }
  };
  var showPanel = function (on) {
    $('#gate').toggle(!on);
    $('#panel').toggle(on);
    if (on) render();
  };

  $('#gateForm').on('submit', function (e) {
    e.preventDefault();
    if (gate.all()) { $('#adminPass').trigger('focus'); return; }
    login(true);
    $('#adminPass').val('');
    gate.reset();
    showPanel(true);
    notify('Signed in to the demo panel.');
  });
  $('#logout').on('click', function () { login(false); showPanel(false); });

  var custom = function () { return read('requiem.events'); };

  var stats = function () {
    var bookings = read('requiem.bookings');
    var revenue = bookings.reduce(function (s, b) { return s + b.total; }, 0);
    var reg = REQ.store.get('requiem.registered', {});
    var mine = Object.keys(reg).filter(function (k) { return reg[k] === 'in'; }).length;
    $('#stBookings').text(bookings.length);
    $('#stRevenue').text(REQ.money(revenue));
    $('#stMessages').text(read('requiem.messages').length);
    $('#stEvents').text(REQ.events.length + custom().length);
    $('#stRegs').text(mine);
  };

  var drawBookings = function () {
    var list = read('requiem.bookings');
    var box = $('#bookingList').empty();
    if (!list.length) { box.append(empty('bi-calendar-x', 'No bookings yet', 'Make a reservation on the Booking page and it appears here.')); return; }
    list.slice().reverse().forEach(function (b) {
      var rec = $('<article class="panel record"></article>');
      var left = $('<div></div>').append($('<h3></h3>').text(b.code + ', ' + b.name));
      left.append(line('Zone', b.zone + ', ' + b.pack)).append(line('When', b.when)).append(line('Stations', b.seats)).append(line('Contact', b.phone + ', ' + b.email)).append(line('Total', REQ.money(b.total)));
      rec.append(left);
      rec.append($('<button type="button" class="btn btn-ghost btn-sm del" data-kind="requiem.bookings" data-key="code"></button>').attr('data-val', b.code).attr('aria-label', 'Delete booking ' + b.code).text('Delete'));
      box.append(rec);
    });
  };

  var drawMessages = function () {
    var list = read('requiem.messages');
    var box = $('#messageList').empty();
    if (!list.length) { box.append(empty('bi-envelope', 'No messages yet', 'Send a message on the Contact page and it appears here.')); return; }
    list.slice().reverse().forEach(function (m) {
      var rec = $('<article class="panel record"></article>');
      var left = $('<div></div>').append($('<h3></h3>').text(m.subject));
      left.append(line('From', m.name + ', ' + m.email + (m.phone ? ', ' + m.phone : ''))).append(line('Topic', m.topic + ', reply by ' + m.reply + ', ' + when(m.created))).append($('<p class="mt-2 mb-0"></p>').text(m.message));
      rec.append(left);
      rec.append($('<button type="button" class="btn btn-ghost btn-sm del" data-kind="requiem.messages" data-key="ref"></button>').attr('data-val', m.ref).attr('aria-label', 'Delete message ' + m.ref).text('Delete'));
      box.append(rec);
    });
  };

  var drawEvents = function () {
    var box = $('#eventAdmin').empty();
    REQ.events.forEach(function (e) {
      var rec = $('<article class="panel record"></article>');
      rec.append($('<div></div>').append($('<h3></h3>').text(e.name)).append(line('Game', e.game + ', ' + e.format)).append(line('Prize', REQ.money(e.prize) + ', ' + e.taken + ' of ' + e.slots + ' slots taken')));
      rec.append('<span class="tag">Built-in</span>');
      box.append(rec);
    });
    custom().forEach(function (e) {
      var rec = $('<article class="panel record"></article>');
      rec.append($('<div></div>').append($('<h3></h3>').text(e.name)).append(line('Game', e.game + ', ' + e.format + ', ' + when(e.iso))).append(line('Prize', REQ.money(e.prize) + ', ' + e.slots + ' slots')));
      rec.append($('<button type="button" class="btn btn-ghost btn-sm del" data-kind="requiem.events" data-key="id"></button>').attr('data-val', e.id).attr('aria-label', 'Delete tournament ' + e.name).text('Delete'));
      box.append(rec);
    });
  };

  var render = function () {
    stats();
    drawBookings();
    drawMessages();
    drawEvents();
    Object.keys(views).forEach(function (k) { $(views[k]).toggle(k === view); });
  };

  $('#adminChips .chip').on('click', function () {
    view = $(this).attr('data-view');
    $('#adminChips .chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    Object.keys(views).forEach(function (k) {
      var el = $(views[k]);
      if (k === view) el.stop(true, true).fadeIn(200); else el.stop(true, true).hide();
    });
  });

  $('#panel').on('click', '.del', function () {
    var btn = $(this);
    var kind = btn.attr('data-kind');
    var key = btn.attr('data-key');
    var v = btn.attr('data-val');
    var next = read(kind).filter(function (x) { return String(x[key]) !== v; });
    REQ.store.set(kind, next);
    render();
    notify('Deleted.', 'warn');
  });

  $('#clearAll').on('click', function () {
    if (!window.confirm('Delete all demo bookings, messages and added tournaments from this browser?')) return;
    ['requiem.bookings', 'requiem.messages', 'requiem.events', 'requiem.registered'].forEach(function (k) { try { localStorage.removeItem(k); } catch (err) { return; } });
    render();
    notify('Demo data cleared.', 'warn');
  });

  var today = new Date();
  $('#tDate').attr('min', today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'));
  var games = ['CS2', 'Dota 2', 'Valorant', 'EA FC 26', 'Tekken 8', 'Mortal Kombat 1'];
  games.forEach(function (g) { $('#tGame').append($('<option></option>').val(g).text(g)); });

  var rules = {
    tName: function () {
      var v = $('#tName').val().trim();
      if (!v) return 'Enter the tournament name.';
      if (v.length < 4) return 'The name needs at least 4 characters.';
      return '';
    },
    tGame: function () { return $('#tGame').val() ? '' : 'Choose a game.'; },
    tDate: function () {
      var v = $('#tDate').val();
      if (!v) return 'Pick a date.';
      var d = new Date(v + 'T00:00:00');
      var t = new Date(); t.setHours(0, 0, 0, 0);
      return d < t ? 'The date has already passed. Pick today or later.' : '';
    },
    tTime: function () { return $('#tTime').val() ? '' : 'Pick a start time.'; },
    tPrize: function () {
      var v = String($('#tPrize').val()).trim();
      if (!v) return 'Enter the prize pool in tenge.';
      if (!/^\d+$/.test(v) || Number(v) < 10000) return 'Enter a whole number, at least 10 000.';
      return '';
    },
    tSlots: function () {
      var v = String($('#tSlots').val()).trim();
      if (!v) return 'Enter the number of slots.';
      if (!/^\d+$/.test(v) || Number(v) < 2 || Number(v) > 64) return 'Enter a whole number from 2 to 64.';
      return '';
    }
  };
  var check = REQ.validator(rules);
  $('#eventForm').on('submit', function (e) {
    e.preventDefault();
    var bad = check.all();
    if (bad) { $('#' + bad).trigger('focus'); return; }
    var list = custom();
    var game = $('#tGame').val();
    list.push({ id: 'c' + Date.now(), name: $('#tName').val().trim(), game: game, format: 'Added by admin', iso: $('#tDate').val() + 'T' + $('#tTime').val(), prize: Number($('#tPrize').val()), slots: Number($('#tSlots').val()), taken: 0 });
    REQ.store.set('requiem.events', list);
    this.reset();
    check.reset();
    render();
    notify('Tournament added. It now shows on the Tournaments page.');
  });

  showPanel(isIn());
});
