/* "My reservations": bookings saved in this browser, with reprint and a two-step cancel */
$(function () {
  var list = $('#mbList');
  if (!list.length) return;
  var pending = null;
  var timer = null;
  var HOUR = 3600000;

  var fillTicket = function (b) {
    $('#tkCode').text(b.code);
    $('#tkName').text(b.name);
    $('#tkZone').text(b.zone);
    $('#tkWhen').text(b.when);
    $('#tkPack').text(b.pack);
    $('#tkSeats').text(b.seats);
    $('#tkDrinks').text(b.drinks);
    $('#tkAddons').text(b.addons || 'None');
    $('#tkTotal').text(REQ.money(b.total) + ', pay on arrival');
    $('#tkMail').text(b.email || '');
  };

  var closed = function (b) {
    return !!b.startAt && new Date(b.startAt).getTime() - Date.now() < HOUR;
  };

  var render = function () {
    var all = REQ.store.get('requiem.bookings', []).slice().reverse();
    $('#mbCount').text(all.length
      ? all.length + (all.length === 1 ? ' reservation' : ' reservations') + ' saved in this browser. Free cancellation up to 1 hour before the session.'
      : 'Saved in this browser only.');
    list.empty();
    if (!all.length) {
      list.append('<div class="empty"><i class="bi bi-ticket-perforated" aria-hidden="true"></i><strong>No reservations yet</strong>Book your stations above and they will appear here.</div>');
      return;
    }
    all.forEach(function (b) {
      var row = $('<article class="booking-row"></article>').attr('data-code', b.code);
      var info = $('<div class="booking-info"></div>');
      info.append($('<div class="booking-code"></div>').text(b.code));
      info.append($('<h3></h3>').text(b.zone + ', ' + b.pack));
      info.append($('<p class="muted small mb-0"></p>').text(b.when + ' · stations ' + b.seats + ' · ' + REQ.money(b.total)));
      row.append(info);

      var act = $('<div class="booking-act"></div>');
      act.append($('<button type="button" class="btn btn-ghost btn-sm"><i class="bi bi-printer" aria-hidden="true"></i> Print ticket</button>').attr('data-print', b.code));
      if (closed(b)) {
        act.append('<span class="note">Cancellation is closed. Call the desk.</span>');
      } else if (pending === b.code) {
        act.append($('<button type="button" class="btn btn-candle btn-sm"></button>').text('Confirm cancel').attr('data-confirm', b.code));
        act.append($('<button type="button" class="btn btn-ghost btn-sm"></button>').text('Keep it').attr('data-keep', b.code));
      } else {
        act.append($('<button type="button" class="btn btn-ghost btn-sm"></button>').text('Cancel').attr('data-cancel', b.code));
      }
      row.append(act);
      list.append(row);
    });
  };

  list.on('click', '[data-print]', function () {
    var code = $(this).attr('data-print');
    var b = REQ.store.get('requiem.bookings', []).filter(function (x) { return x.code === code; })[0];
    if (!b) return;
    fillTicket(b);
    $('#ticket').stop(true, true).show();
    $('html, body').animate({ scrollTop: $('#ticket').offset().top - 100 }, 300);
    setTimeout(function () { window.print(); }, 350);
  });

  list.on('click', '[data-cancel]', function () {
    pending = $(this).attr('data-cancel');
    clearTimeout(timer);
    timer = setTimeout(function () { pending = null; render(); }, 6000);
    render();
    list.find('[data-confirm]').trigger('focus');
  });

  list.on('click', '[data-keep]', function () {
    pending = null;
    clearTimeout(timer);
    render();
  });

  list.on('click', '[data-confirm]', function () {
    var code = $(this).attr('data-confirm');
    var left = REQ.store.get('requiem.bookings', []).filter(function (x) { return x.code !== code; });
    REQ.store.set('requiem.bookings', left);
    pending = null;
    clearTimeout(timer);
    render();
    $(document).trigger('bookings:changed');
    notify('Reservation ' + code + ' cancelled.', 'warn');
  });

  $('#ticketPrint').on('click', function () { window.print(); });
  $(document).on('bookings:changed', render);
  render();
});
