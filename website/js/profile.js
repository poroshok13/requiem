/* Profile: the logged-in account, its reservations and favourite games, with remove and clear */
$(function () {
  if (!$('#memberArea').length) return;

  var session = function () { return REQ.store.get('requiem.session', null); };
  var userOf = function (email) {
    return REQ.store.get('requiem.users', []).filter(function (u) { return u.email === email; })[0];
  };
  var reservationsOf = function (email) {
    return REQ.store.get('requiem.bookings', []).filter(function (b) {
      return (b.email || '').toLowerCase() === email;
    }).reverse();
  };
  var emptyBlock = function (icon, title, text) {
    return $('<div class="empty"></div>')
      .append($('<i aria-hidden="true"></i>').addClass('bi ' + icon))
      .append($('<strong></strong>').text(title))
      .append(document.createTextNode(text));
  };

  // "Clear all" needs a second click, like cancelling a reservation
  var armed = null;
  var timer = null;
  var arm = function (key, button) {
    if (armed === key) return true;
    armed = key;
    button.text('Confirm clear');
    clearTimeout(timer);
    timer = setTimeout(function () { armed = null; render(); }, 5000);
    return false;
  };

  var render = function () {
    var email = session();
    var me = email && userOf(email);
    $('#guest').prop('hidden', !!me);
    $('#memberArea').prop('hidden', !me);
    if (!me) return;

    $('#pName').text(me.name);
    $('#pEmail').text(me.email);
    $('#pPhone').text(me.phone);

    var res = reservationsOf(email);
    $('#resCount').text('(' + res.length + ')');
    $('#clearRes').prop('hidden', !res.length).text(armed === 'res' ? 'Confirm clear' : 'Clear all');
    var resBox = $('#resList').empty();
    if (!res.length) {
      resBox.append(emptyBlock('bi-ticket-perforated', 'No reservations yet', ' Book a station with this email and it appears here.'));
    }
    res.forEach(function (b) {
      var info = $('<div class="booking-info"></div>')
        .append($('<div class="booking-code"></div>').text(b.code))
        .append($('<h3></h3>').text(b.zone + ', ' + b.pack))
        .append($('<p class="muted small mb-0"></p>').text(b.when + ' · stations ' + b.seats + ' · ' + REQ.money(b.total)));
      var act = $('<div class="booking-act"></div>')
        .append($('<button type="button" class="btn btn-ghost btn-sm"></button>').text('Remove').attr('data-remove-res', b.code));
      resBox.append($('<div class="booking-row"></div>').append(info).append(act));
    });

    var favs = REQ.store.get(REQ.favKey(), []);
    $('#favCount').text('(' + favs.length + ')');
    $('#clearFav').prop('hidden', !favs.length).text(armed === 'fav' ? 'Confirm clear' : 'Clear all');
    var favBox = $('#favList').empty();
    if (!favs.length) {
      favBox.append(emptyBlock('bi-heart', 'No favourites yet', ' Tap the heart on a game in the Zones page.'));
    }
    favs.forEach(function (title) {
      favBox.append($('<div class="booking-row"></div>')
        .append($('<div class="booking-info"></div>').append($('<h3></h3>').append($('<a></a>').attr('href', 'zones.html?game=' + encodeURIComponent(title) + '#games').text(title))))
        .append($('<div class="booking-act"></div>').append($('<button type="button" class="btn btn-ghost btn-sm"></button>').text('Remove').attr('data-remove-fav', title))));
    });
  };

  $('#resList').on('click', '[data-remove-res]', function () {
    var code = $(this).attr('data-remove-res');
    REQ.store.set('requiem.bookings', REQ.store.get('requiem.bookings', []).filter(function (b) { return b.code !== code; }));
    $(document).trigger('bookings:changed');
    notify('Reservation ' + code + ' removed.', 'warn');
    render();
  });

  $('#favList').on('click', '[data-remove-fav]', function () {
    var title = $(this).attr('data-remove-fav');
    REQ.store.set(REQ.favKey(), REQ.store.get(REQ.favKey(), []).filter(function (t) { return t !== title; }));
    notify(title + ' removed from favourites.', 'warn');
    render();
  });

  $('#clearRes').on('click', function () {
    if (!arm('res', $(this))) return;
    var email = session();
    REQ.store.set('requiem.bookings', REQ.store.get('requiem.bookings', []).filter(function (b) {
      return (b.email || '').toLowerCase() !== email;
    }));
    armed = null;
    $(document).trigger('bookings:changed');
    notify('Your reservations are cleared.', 'warn');
    render();
  });

  $('#clearFav').on('click', function () {
    if (!arm('fav', $(this))) return;
    REQ.store.set(REQ.favKey(), []);
    armed = null;
    notify('Favourites cleared.', 'warn');
    render();
  });

  $('#logoutBtn').on('click', function () {
    REQ.store.set('requiem.session', null);
    armed = null;
    $(document).trigger('account:changed');
    notify('You are logged out.');
    render();
  });

  var messagesOf = function (email) {
    return REQ.store.get('requiem.messages', []).filter(function (m) {
      return (m.email || '').toLowerCase() === email;
    }).reverse();
  };

  var renderMessages = function (email) {
    var list = messagesOf(email);
    $('#msgCount').text('(' + list.length + ')');
    var box = $('#msgList').empty();
    if (!list.length) {
      box.append(emptyBlock('bi-envelope', 'No messages yet', ' Write to us on the About page and it appears here.'));
    }
    list.forEach(function (m) {
      var when = new Date(m.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      var info = $('<div class="booking-info"></div>')
        .append($('<div class="booking-code"></div>').text(m.ref))
        .append($('<h3></h3>').text(m.subject))
        .append($('<p class="muted small mb-0"></p>').text(m.topic + ' · ' + when + ' · reply by ' + m.reply));
      box.append($('<div class="booking-row"></div>').append(info)
        .append($('<div class="booking-act"></div>').append($('<button type="button" class="btn btn-ghost btn-sm"></button>').text('Remove').attr('data-remove-msg', m.ref))));
    });
  };

  $('#msgList').on('click', '[data-remove-msg]', function () {
    var ref = $(this).attr('data-remove-msg');
    REQ.store.set('requiem.messages', REQ.store.get('requiem.messages', []).filter(function (m) { return m.ref !== ref; }));
    notify('Message ' + ref + ' removed.', 'warn');
    render();
  });

  var renderAll = render;
  render = function () {
    renderAll();
    var email = session();
    if (email && userOf(email)) renderMessages(email);
  };

  $(document).on('bookings:changed', render);
  render();
});
