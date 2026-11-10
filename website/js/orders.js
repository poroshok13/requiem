/* Sending a tray to a station: the order must belong to a reservation that is in progress,
   and its status moves through the steps while time passes. Orders live in this browser only. */
$(function () {
  if (!$('#orderModal').length) return;
  var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('orderModal'));
  var MIN = 60000;
  var HOUR = 3600000;
  var PREP_TIME = 10; // minutes, the same promise as the FAQ
  var STEPS = ['Received', 'Preparing', 'On the way', 'Delivered'];
  var payload = null;
  var sending = false;

  var reservations = function () { return REQ.store.get('requiem.bookings', []); };
  var findRes = function (code) { return reservations().filter(function (b) { return b.code === code; })[0]; };
  var clock = function (ms) { var d = new Date(ms); return REQ.pad(d.getHours()) + ':' + REQ.pad(d.getMinutes()); };

  // 'active' = in progress, 'soon' = starts within an hour, 'later', 'ended', 'unknown' = old booking without a start time
  var stateOf = function (b) {
    if (!b.startAt) return 'unknown';
    var start = new Date(b.startAt).getTime();
    var end = start + (b.hours || 1) * HOUR;
    var now = Date.now();
    if (now >= end) return 'ended';
    if (now >= start) return 'active';
    return start - now <= HOUR ? 'soon' : 'later';
  };
  var canOrder = function (b) { var s = stateOf(b); return s === 'active' || s === 'soon' || s === 'unknown'; };

  var rules = {
    ordCode: function () {
      var v = $.trim($('#ordCode').val()).toUpperCase();
      if (!v) return 'Enter the reservation code from your ticket.';
      if (!/^RQ-[A-Z0-9]{5}$/.test(v)) return 'The code looks like RQ-XXXXX.';
      var b = findRes(v);
      if (!b) return 'No reservation with this code in this browser. Book a station first.';
      var s = stateOf(b);
      if (s === 'ended') return 'This session has already ended.';
      if (s === 'later') return 'This session starts at ' + clock(new Date(b.startAt).getTime()) + '. Orders can be sent from one hour before it starts.';
      return '';
    },
    ordNote: function () { return $.trim($('#ordNote').val()).length > 120 ? 'Keep the note under 120 characters.' : ''; },
    ordConfirm: function () { return $('#ordConfirm').is(':checked') ? '' : 'Confirm that the items go to your session bill.'; }
  };
  var check = REQ.validator(rules);

  var fillPick = function () {
    var box = $('#ordPick').empty().append('<option value="">Choose a reservation</option>');
    var usable = reservations().filter(canOrder);
    usable.forEach(function (b) {
      box.append($('<option></option>').val(b.code).text(b.code + ', ' + b.zone + ', ' + b.when));
    });
    if (!usable.length) box.append('<option value="" disabled>No reservation in progress in this browser</option>');
  };

  $(document).on('tray:send', function (e, data) {
    payload = data;
    check.reset();
    $('#orderForm')[0].reset();
    fillPick();
    var items = data.lines.map(function (l) { return l.qty + ' x ' + l.name; }).join(', ');
    $('#orderSummary').text(items + '. Total ' + REQ.money(data.total) + '.');
    modal.show();
  });

  $('#ordPick').on('change', function () {
    $('#ordCode').val($(this).val()).trigger('input');
  });

  $('#orderForm').on('submit', function (e) {
    e.preventDefault();
    if (sending || !payload) return;
    var bad = check.all();
    if (bad) {
      $('#' + (bad === 'ordCode' ? 'ordCode' : bad)).trigger('focus');
      notify('Check the highlighted fields.', 'warn');
      return;
    }
    sending = true;
    var code = $.trim($('#ordCode').val()).toUpperCase();
    var b = findRes(code);
    var order = {
      id: 'RO-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
      code: code,
      seat: (b.seatIds || []).join(', ') || 'your station',
      zone: b.zone,
      lines: payload.lines,
      total: payload.total,
      note: $.trim($('#ordNote').val()),
      created: Date.now()
    };
    REQ.store.set('requiem.orders', [order].concat(REQ.store.get('requiem.orders', [])).slice(0, 10));
    modal.hide();
    $(document).trigger('tray:sent');
    payload = null;
    render();
    notify('Order ' + order.id + ' is on its way to ' + order.seat + '. About ' + PREP_TIME + ' minutes.');
    setTimeout(function () { sending = false; }, 600);
  });

  var render = function () {
    var orders = REQ.store.get('requiem.orders', []);
    $('#orderStatus').prop('hidden', !orders.length);
    var box = $('#orderList').empty();
    orders.slice(0, 3).forEach(function (o) {
      var elapsed = (Date.now() - o.created) / MIN;
      var stage = elapsed < 2 ? 0 : elapsed < 6 ? 1 : elapsed < PREP_TIME ? 2 : 3;
      var left = Math.max(0, Math.ceil(PREP_TIME - elapsed));
      var percent = Math.min(100, Math.round((elapsed / PREP_TIME) * 100));
      var row = $('<div class="order-row"></div>');
      row.append($('<div class="d-flex justify-content-between"></div>')
        .append($('<b></b>').text(o.id + ' · ' + o.seat))
        .append($('<span class="small muted"></span>').text(REQ.money(o.total))));
      var steps = $('<ol class="order-steps"></ol>');
      STEPS.forEach(function (name, i) {
        steps.append($('<li></li>').toggleClass('done', i < stage).toggleClass('now', i === stage).text(name));
      });
      row.append(steps);
      row.append('<div class="meter ' + (stage === 3 ? 'ok' : 'mid') + '" role="img" aria-label="' + percent + ' percent done"><i style="width:' + percent + '%"></i></div>');
      row.append($('<p class="small muted mb-0"></p>').text(stage === 3 ? 'Delivered to your desk.' : STEPS[stage] + ', about ' + left + ' min left.'));
      box.append(row);
    });
  };

  render();
  setInterval(render, 15000);
});
