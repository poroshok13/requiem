$(function () {
  var form = $('#bookingForm');
  var order = ['zone', 'date', 'time', 'pack', 'stations', 'seats', 'fullName', 'phone', 'email', 'telegram', 'terms'];
  var packs = { hour: { name: 'Standard Hour', price: 900, flat: false }, '3hours': { name: '3-Hour Boost', price: 2400, flat: false }, night: { name: 'Night Marathon', price: 4500, flat: false }, bootcamp5h: { name: 'Boot Camp Pass', price: 18000, flat: true } };
  var addons = { addKit: ['Peripheral test kit', 1000], addSetup: ['Game pre-load and setup', 500] };
  var stepFields = { 1: ['zone', 'pack', 'stations'], 2: ['date', 'time'], 3: ['seats'], 4: ['fullName', 'phone', 'email', 'telegram', 'terms'] };
  var stepNames = ['Zone', 'Time', 'Seat', 'Contacts'];
  var step = 1;
  var reached = 1;
  var drinks = {};
  var touched = {};
  var submitted = false;
  var locked = false;
  var picked = [];
  var seats = [];

  var pad = REQ.pad;
  var iso = REQ.iso;
  var startOfToday = function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  $('#date').attr('min', iso(new Date()));


  var val = function (id) { return $('#' + id).val(); };
  var zoneOf = function (id) { return REQ.zones.filter(function (z) { return z.id === id; })[0]; };
  var ready = function () {
    var d = val('date');
    return val('zone') && d && val('time') !== null && val('time') !== '' && new Date(d + 'T00:00:00') >= startOfToday();
  };

  var freeAt = function (zone, date, hour) {
    return REQ.buildSeats(zone, date, hour).filter(function (s) { return !s.taken; }).length;
  };

  // Rebuilds the start-time list: every hour shows how many stations are free for the chosen zone and date.
  var refreshTimes = function () {
    var sel = $('#time');
    var keep = val('time');
    var z = val('zone');
    var d = val('date');
    var live = !!z && !!d && !rules.date();
    var need = Number(val('stations')) || 1;
    var total = z ? zoneOf(z).stations : 0;
    var now = new Date();
    var today = d === iso(now);
    sel.empty().append('<option value="" disabled selected>Select a time</option>');
    $('#timeHint').text(live
      ? (z === 'bootcamp' ? 'The Boot Camp suite is booked as one room, so each hour is either free or booked.' : 'Free stations in ' + zoneOf(z).name + ' at each hour. Hours without room for your ' + need + (need === 1 ? ' station are disabled.' : ' stations are disabled.'))
      : 'Choose a zone and date to see how many stations are free at each hour.');
    for (var h = 0; h < 24; h++) {
      var opt = $('<option></option>').val(String(h));
      var label = pad(h) + ':00';
      var past = today && h <= now.getHours();
      if (past) {
        label += ' · passed';
        opt.prop('disabled', true);
      } else if (live) {
        var free = freeAt(z, d, h);
        if (z === 'bootcamp') {
          label += free ? ' · free' : ' · booked';
          if (!free) opt.prop('disabled', true);
        } else if (free < need) {
          label += free === 0 ? ' · full' : ' · only ' + free + ' free';
          opt.prop('disabled', true);
        } else {
          label += ' · ' + free + ' of ' + total + ' free';
        }
      }
      sel.append(opt.text(label));
    }
    if (keep !== null && keep !== '') sel.val(keep);
  };

  var rules = {
    zone: function () { return val('zone') ? '' : 'Choose a gaming zone.'; },
    date: function () {
      var v = val('date');
      if (!v) return 'Pick a date for your session.';
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d)) return 'Enter a valid date.';
      var t = startOfToday();
      if (d < t) return 'This date has already passed. Pick today or later.';
      if ((d - t) / 86400000 > 60) return 'Bookings open up to 60 days ahead.';
      return '';
    },
    time: function () {
      var v = $('#time')[0].value;
      if (v === null || v === '') return 'Choose a start time.';
      var d = val('date');
      if (d && d === iso(new Date()) && Number(v) <= new Date().getHours()) return 'That time has already started today. Pick a later hour.';
      if (val('pack') === 'night' && v !== '22') return 'Night Marathon passes start at 22:00. Change the start time.';
      if (val('zone') && d && !rules.date()) {
        var free = freeAt(val('zone'), d, Number(v));
        var need = Number(val('stations')) || 1;
        if (val('zone') === 'bootcamp' && !free) return 'The Boot Camp suite is booked at this hour. Pick another start time.';
        if (val('zone') !== 'bootcamp' && free < need) return free === 0 ? 'This hour is full in this zone. Pick another start time.' : 'Only ' + free + ' stations are free at this hour and you need ' + need + '. Pick another start time.';
      }
      return '';
    },
    pack: function () {
      var v = val('pack');
      if (!v) return 'Choose a duration or pass.';
      if (val('zone') === 'bootcamp' && v !== 'bootcamp5h') return 'The Boot Camp suite needs the Boot Camp Pass.';
      if (v === 'bootcamp5h' && val('zone') && val('zone') !== 'bootcamp') return 'The Boot Camp Pass is only valid in the Boot Camp suite.';
      return '';
    },
    stations: function () {
      var v = String(val('stations')).trim();
      if (!v) return 'Enter how many stations you need.';
      if (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 10) return 'Enter a whole number from 1 to 10.';
      return '';
    },
    seats: function () {
      if (!ready()) return 'Choose a zone, date and start time first, then pick your stations on the map.';
      var n = Number(val('stations')) || 0;
      if (val('zone') === 'bootcamp' && seats.some(function (s) { return s.taken; })) return 'The Boot Camp suite is already booked at this time. Pick another time.';
      if (picked.length !== n) return 'Pick exactly ' + n + (n === 1 ? ' station' : ' stations') + ' on the map. You picked ' + picked.length + '.';
      return '';
    },
    fullName: function () {
      var v = val('fullName').trim();
      if (!v) return 'Enter your full name.';
      if (!/^[\p{L}][\p{L}' -]+$/u.test(v)) return 'Use letters only. Digits and symbols are not allowed.';
      if (v.split(/\s+/).length < 2) return 'Enter your first and last name.';
      return '';
    },
    phone: function () {
      var v = val('phone').trim();
      if (!v) return 'Enter your phone number.';
      if (!/^(7|8)7\d{9}$/.test(v.replace(/\D/g, ''))) return 'Use a Kazakhstan mobile number, for example +7 700 123 45 67.';
      return '';
    },
    email: function () {
      var v = val('email').trim();
      if (!v) return 'Enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email like name@example.com.';
      return '';
    },
    telegram: function () {
      var v = val('telegram').trim();
      if (v && !/^[A-Za-z0-9_]{5,32}$/.test(v)) return 'Use 5 to 32 letters, digits or underscores, without the @ sign.';
      return '';
    },
    terms: function () { return $('#terms').is(':checked') ? '' : 'Confirm that you accept the reservation terms.'; }
  };

  var show = function (id, msg) {
    var err = $('#err-' + id);
    var field = id === 'seats' ? $('#seatBox') : $('#' + id);
    var filled = id === 'terms' || id === 'seats' ? false : String(val(id) || '').trim() !== '';
    field.toggleClass('is-invalid', !!msg).toggleClass('is-valid', !msg && filled);
    if (id !== 'seats') field.attr('aria-invalid', msg ? 'true' : 'false');
    if (msg) err.html('<i class="bi bi-exclamation-circle" aria-hidden="true"></i><span></span>').find('span').text(msg);
    else err.empty();
    err.toggleClass('show', !!msg);
  };

  var check = function (id) {
    var msg = rules[id]();
    show(id, msg);
    return !msg;
  };

  var recheck = function (ids) {
    ids.forEach(function (id) { if (touched[id] || submitted) check(id); });
  };

  var drawSeats = function () {
    var box = $('#seatMap').empty();
    $('#seatMap').toggleClass('few', val('zone') === 'bootcamp');
    if (!ready() || rules.date()) {
      seats = [];
      box.hide();
      $('#seatNote').show().text('Choose a zone, date and start time to see which stations are free.');
      $('#seatLegend').hide();
      return;
    }
    seats = REQ.buildSeats(val('zone'), val('date'), Number(val('time')));
    box.show();
    $('#seatNote').hide();
    $('#seatLegend').show();
    seats.forEach(function (s) {
      var btn = $('<button type="button" class="seat"></button>').text(pad(s.number)).attr('data-id', s.id);
      btn.attr('aria-label', 'Station ' + s.id + (s.taken ? ', taken' : ', free')).attr('aria-pressed', picked.indexOf(s.id) !== -1 ? 'true' : 'false');
      if (s.taken) btn.prop('disabled', true);
      box.append(btn);
    });
  };

  var menuItem = function (id) { return REQ.menu.filter(function (m) { return m.id === id; })[0]; };
  var drinkCount = function () { return Object.keys(drinks).reduce(function (n, id) { return n + drinks[id]; }, 0); };
  var drinkSum = function () { return Object.keys(drinks).reduce(function (t, id) { return t + menuItem(id).price * drinks[id]; }, 0); };
  var drinkText = function () {
    var ids = Object.keys(drinks);
    return ids.length ? ids.map(function (id) { return drinks[id] + ' x ' + menuItem(id).name; }).join(', ') : 'None';
  };

  var summarize = function () {
    var zone = val('zone') ? zoneOf(val('zone')).name : 'Not chosen';
    var pack = packs[val('pack')];
    var n = Math.max(1, Number(val('stations')) || 1);
    var base = pack ? (pack.flat ? pack.price : pack.price * n) : 0;
    var extra = 0;
    Object.keys(addons).forEach(function (k) { if ($('#' + k).is(':checked')) extra += addons[k][1]; });
    var drinkTotal = drinkSum();
    var time = val('time') !== null && val('time') !== '' ? pad(Number(val('time'))) + ':00' : '';
    var when = val('date') ? new Date(val('date') + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + (time ? ', ' + time : '') : 'Not chosen';
    $('#sumZone').text(zone);
    $('#sumWhen').text(when);
    $('#sumPack').text(pack ? pack.name : 'Not chosen');
    $('#sumSeats').text(picked.length ? picked.join(', ') : 'None yet');
    $('#sumBase').text(REQ.money(base));
    $('#sumExtra').text(REQ.money(extra));
    $('#sumDrinks').text(drinkCount() ? drinkCount() + ' items, ' + REQ.money(drinkTotal) : 'None');
    $('.drinks-btn span').text(drinkCount() ? 'Edit drinks & snacks (' + drinkCount() + ')' : 'Add drinks & snacks');
    $('#sumTotal').text(REQ.money(base + extra + drinkTotal));
    $('#seatSelected').text(picked.length ? 'Selected: ' + picked.join(', ') : 'No station selected yet.');
    return base + extra + drinkTotal;
  };

  var updateStepper = function () {
    $('#stepper .step-dot').each(function () {
      var n = Number($(this).attr('data-go'));
      var done = n < step || (n < reached && n !== step);
      $(this).toggleClass('done', done).prop('disabled', n > reached)
        .attr('aria-current', n === step ? 'step' : null)
        .attr('aria-label', 'Step ' + n + ' of 4: ' + stepNames[n - 1] + (done ? ', done' : ''));
      $(this).find('b').html(done ? '<i class="bi bi-check-lg" aria-hidden="true"></i>' : n);
    });
    $('#stepProgress').attr('aria-valuenow', step).attr('aria-valuetext', 'Step ' + step + ' of 4: ' + stepNames[step - 1])
      .find('i').css('width', (step / 4) * 100 + '%');
  };

  var go = function (n, quiet) {
    step = n;
    reached = Math.max(reached, n);
    $('.step-panel').not('[data-step="' + n + '"]').prop('hidden', true);
    $('.step-panel[data-step="' + n + '"]').stop(true, true).prop('hidden', false).hide().fadeIn(speed(220));
    updateStepper();
    if (quiet) return;
    $('html, body').stop(true).animate({ scrollTop: form.offset().top - 110 }, speed(300), function () { $('#st' + n).trigger('focus'); });
  };

  var stepOf = function (id) {
    return [1, 2, 3, 4].filter(function (n) { return stepFields[n].indexOf(id) !== -1; })[0];
  };

  var focusField = function (id) {
    if (id === 'seats') $('#seatMap .seat:not(:disabled)').first().trigger('focus');
    else $('#' + id).trigger('focus');
  };

  var validateStep = function (n) {
    var firstBad = null;
    stepFields[n].forEach(function (id) { touched[id] = true; if (!check(id) && !firstBad) firstBad = id; });
    if (firstBad) {
      notify('Check the highlighted fields.', 'warn');
      focusField(firstBad);
    }
    return !firstBad;
  };

  var moving = false;
  var advance = function () {
    if (moving) return;
    if (!validateStep(step)) return;
    moving = true;
    go(step + 1);
    setTimeout(function () { moving = false; }, 400);
  };

  form.on('click', '[data-next]', advance);
  form.on('click', '[data-back]', function () { if (!moving && step > 1) go(step - 1); });
  $('#stepper').on('click', '.step-dot', function () {
    var n = Number($(this).attr('data-go'));
    if (n <= reached && n !== step) go(n);
  });

  var applyZone = function () {
    var z = val('zone');
    var stations = $('#stations');
    if (z === 'bootcamp') {
      stations.val(5).prop('readOnly', true);
      if (!val('pack')) $('#pack').val('bootcamp5h');
      $('#stationsHint').text('The Boot Camp suite is booked as a whole room with 5 stations.');
    } else {
      if (stations.prop('readOnly')) stations.val(1);
      stations.prop('readOnly', false);
      $('#stationsHint').text('Between 1 and 10 stations.');
    }
  };

  var resetPicks = function () {
    picked = [];
    drawSeats();
    if (val('zone') === 'bootcamp' && seats.length && !seats.some(function (s) { return s.taken; })) {
      picked = seats.map(function (s) { return s.id; });
      drawSeats();
    }
  };

  form.on('change', '#zone', function () {
    applyZone();
    refreshTimes();
    resetPicks();
    touched.zone = true;
    recheck(['zone', 'pack', 'stations', 'time', 'seats']);
    summarize();
  });
  form.on('change', '#date, #time', function () {
    touched[this.id] = true;
    if (this.id === 'date') refreshTimes();
    resetPicks();
    recheck(['date', 'time', 'seats']);
    summarize();
  });
  form.on('change', '#pack', function () {
    touched.pack = true;
    if (val('pack') === 'night' && val('time') === '') $('#time').val('22').trigger('change');
    if (val('pack') === 'bootcamp5h' && !val('zone')) { $('#zone').val('bootcamp'); applyZone(); resetPicks(); }
    recheck(['zone', 'pack', 'time', 'seats']);
    summarize();
  });
  form.on('input change', '#stations', function () {
    var n = Number(val('stations'));
    if (/^\d+$/.test(String(val('stations'))) && picked.length > n) {
      picked = picked.slice(0, n);
      drawSeats();
    }
    refreshTimes();
    recheck(['stations', 'time', 'seats']);
    summarize();
  });
  form.on('change', '.addon', summarize);

  $('#seatMap').on('click', '.seat', function () {
    var id = $(this).attr('data-id');
    var n = Number(val('stations')) || 0;
    if (val('zone') === 'bootcamp') { notify('The Boot Camp suite is booked as one room.', 'warn'); return; }
    var at = picked.indexOf(id);
    if (at !== -1) {
      picked.splice(at, 1);
      $(this).attr('aria-pressed', 'false');
    } else {
      if (picked.length >= n) { notify('You asked for ' + n + (n === 1 ? ' station' : ' stations') + '. Remove one or raise the number above.', 'warn'); return; }
      picked.push(id);
      $(this).attr('aria-pressed', 'true');
    }
    touched.seats = true;
    recheck(['seats']);
    summarize();
  });

  ['fullName', 'phone', 'email', 'telegram'].forEach(function (id) {
    $('#' + id).on('blur', function () { touched[id] = true; check(id); });
    $('#' + id).on('input', function () { if (touched[id] || submitted) check(id); });
  });
  $('#terms').on('change', function () { touched.terms = true; check('terms'); });

  var drinkList = $('#drinkList');
  REQ.menu.forEach(function (m) {
    var item = $('<div class="drink-item"></div>');
    var line = $('<div class="tray-line"></div>').attr('data-id', m.id);
    var name = $('<span class="name"></span>').text(m.name).append($('<small class="d-block muted fw-normal"></small>').text(m.category + ', ' + REQ.money(m.price)));
    var view = $('<button type="button" class="btn btn-ghost btn-sm drink-view"></button>').attr('aria-expanded', 'false').attr('aria-label', 'View ' + m.name).text('View');
    name.append($('<span class="d-block mt-1"></span>').append(view));
    line.append(name);
    var qty = $('<span class="qty"></span>');
    qty.append($('<button type="button" class="minus"></button>').attr('aria-label', 'Remove one ' + m.name).html('&minus;'));
    qty.append('<span class="n" aria-live="polite">0</span>');
    qty.append($('<button type="button" class="plus"></button>').attr('aria-label', 'Add one ' + m.name).text('+'));
    line.append(qty);
    var detail = $('<div class="drink-detail" style="display: none"></div>')
      .append($('<img class="drink-photo" width="480" height="300" loading="lazy">').attr('src', 'images/menu/' + m.id + '.jpg').attr('alt', 'Photo of ' + m.name))
      .append($('<div class="drink-info"></div>').append($('<p class="mb-1"></p>').text(m.desc)).append($('<p class="small muted mb-0"></p>').text(m.category + ' · ' + REQ.money(m.price))));
    drinkList.append(item.append(line, detail));
  });
  // "View" shows the photo and description of one item, under that item
  drinkList.on('click', '.drink-view', function () {
    var item = $(this).closest('.drink-item');
    var open = item.find('.drink-detail').is(':visible');
    item.find('.drink-detail').stop(true, true).slideToggle(180);
    $(this).attr('aria-expanded', String(!open));
  });

  var paintDrinks = function () {
    drinkList.find('.tray-line').each(function () {
      $(this).find('.n').text(drinks[$(this).attr('data-id')] || 0);
    });
    $('#drinkTotal').text(REQ.money(drinkSum()));
    $('#drinksClear').prop('disabled', !drinkCount());
    $('#drinksHint').text(drinkCount() ? drinkText() : 'Brought to your desk when the session starts.');
    summarize();
  };
  drinkList.on('click', '.plus', function () {
    var id = $(this).closest('.tray-line').attr('data-id');
    drinks[id] = Math.min((drinks[id] || 0) + 1, 9);
    paintDrinks();
  });
  drinkList.on('click', '.minus', function () {
    var id = $(this).closest('.tray-line').attr('data-id');
    drinks[id] = (drinks[id] || 0) - 1;
    if (drinks[id] <= 0) delete drinks[id];
    paintDrinks();
  });
  $('#drinksClear').on('click', function () { drinks = {}; paintDrinks(); });

  var clearAll = function () {
    order.forEach(function (id) { show(id, ''); });
    form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    touched = {};
    submitted = false;
    picked = [];
    drinks = {};
    reached = 1;
    paintDrinks();
    form[0].reset();
    $('#stations').prop('readOnly', false).val(1);
    $('#stationsHint').text('Between 1 and 10 stations.');
    drawSeats();
    summarize();
    go(1, true);
  };

  form.on('submit', function (e) {
    e.preventDefault();
    if (locked) return;
    if (step < 4) { advance(); return; }
    submitted = true;
    var firstBad = null;
    order.forEach(function (id) { touched[id] = true; if (!check(id) && !firstBad) firstBad = id; });
    if (firstBad) {
      var wrong = stepOf(firstBad);
      if (wrong !== step) go(wrong, true);
      $('html, body').stop(true).animate({ scrollTop: ($(firstBad === 'seats' ? '#seatBox' : '#' + firstBad)).offset().top - 130 }, 350, function () { focusField(firstBad); });
      notify('Check the highlighted fields.', 'warn');
      return;
    }

    locked = true;
    var total = summarize();
    var code = 'RQ-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    var saved = REQ.store.get('requiem.bookings', []);
    var pass = REQ.passes.filter(function (p) { return p.id === val('pack'); })[0];
    var addonNames = Object.keys(addons).filter(function (k) { return $('#' + k).is(':checked'); }).map(function (k) { return addons[k][0]; });
    saved.push({ code: code, zoneId: val('zone'), hours: pass ? pass.hours : 1, seatIds: picked.slice(), startAt: val('date') + 'T' + pad(Number(val('time'))) + ':00', email: val('email').trim(), name: val('fullName').trim(), addons: addonNames.length ? addonNames.join(', ') : 'None', phone: val('phone').trim(), email: val('email').trim(), zone: zoneOf(val('zone')).name, when: $('#sumWhen').text(), pack: $('#sumPack').text(), seats: picked.join(', '), drinks: drinkText(), total: total, created: new Date().toISOString() });
    REQ.store.set('requiem.bookings', saved);
    $(document).trigger('bookings:changed');
    $('#tkCode').text(code);
    $('#tkName').text(val('fullName').trim());
    $('#tkZone').text(zoneOf(val('zone')).name);
    $('#tkWhen').text($('#sumWhen').text());
    $('#tkPack').text($('#sumPack').text());
    $('#tkSeats').text(picked.join(', '));
    $('#tkDrinks').text(drinkText());
    $('#tkAddons').text(addonNames.length ? addonNames.join(', ') : 'None');
    $('#tkTotal').text(REQ.money(total) + ', pay on arrival');
    $('#tkMail').text(val('email').trim());
    clearAll();
    $('#ticket').stop(true, true).hide().fadeIn(450);
    $('html, body').stop(true).animate({ scrollTop: $('#ticket').offset().top - 100 }, 450, function () { $('#ticket h2').attr('tabindex', '-1').trigger('focus'); });
    notify('Reservation confirmed. Your code is ' + code + '.');
    setTimeout(function () { locked = false; }, 600);
  });

  $('#ticketClose').on('click', function () { $('#ticket').stop(true, true).fadeOut(300); });

  var wantHour = null;
  var params = new URLSearchParams(location.search);
  var wantPack = params.get('pass');
  var wantZone = params.get('zone');
  var wantSeat = params.get('seat');
  var wantDate = params.get('date');
  var wantTime = params.get('time');
  if (wantPack && packs[wantPack]) {
    $('#pack').val(wantPack);
    var found = REQ.passes.filter(function (p) { return p.id === wantPack; })[0];
    if (found && !wantZone) wantZone = found.zone;
    if (wantPack === 'night') wantHour = '22';
  }
  if (wantZone && zoneOf(wantZone) && wantZone !== 'stream') $('#zone').val(wantZone);
  if (wantDate && /^\d{4}-\d{2}-\d{2}$/.test(wantDate)) $('#date').val(wantDate);
  if (wantTime && /^\d{1,2}$/.test(wantTime) && Number(wantTime) < 24) wantHour = String(Number(wantTime));
  if (rules.date()) { $('#date').val(''); }
  applyZone();
  // logged in: the contact fields start with the account's details (they can still be edited)
  var signedIn = REQ.store.get('requiem.session', null);
  var account = signedIn && REQ.store.get('requiem.users', []).filter(function (u) { return u.email === signedIn; })[0];
  if (account) {
    if (!$('#fullName').val()) $('#fullName').val(account.name);
    if (!$('#phone').val()) $('#phone').val(account.phone);
    if (!$('#email').val()) $('#email').val(account.email);
  }
  refreshTimes();
  if (wantHour !== null && $('#time option[value="' + wantHour + '"]').length) $('#time').val(wantHour);
  resetPicks();
  summarize();

  if (wantSeat && val('zone') && ready()) {
    var seat = seats.filter(function (s) { return s.id === wantSeat; })[0];
    if (val('zone') === 'bootcamp' && picked.length) {
      go(3, true);
      notify('The Boot Camp suite is free at this time. Check the details and continue.');
    } else if (seat && !seat.taken) {
      picked = [seat.id];
      drawSeats();
      summarize();
      go(3, true);
      notify('Station ' + seat.id + ' is selected from the hall map. Check the details and continue.');
    } else if (seat) {
      go(3, true);
      notify('Station ' + seat.id + ' is already taken at ' + pad(Number(val('time'))) + ':00. Pick another one.', 'warn');
    }
  } else if (val('zone') && val('pack')) {
    go(2, true);
  } else {
    updateStepper();
  }
});
