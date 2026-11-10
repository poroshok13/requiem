$(function () {
  var seats = REQ.hallSeats();
  var floor = $('#hallFloor');
  var card = $('#stationCard');
  var now = new Date();

  var zoneOf = function (id) { return REQ.zones.filter(function (z) { return z.id === id; })[0]; };
  var shortName = { bootcamp: 'Boot Camp', stream: 'Streaming' };

  var bookingLink = function (seat) {
    var start = new Date(now);
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    var pass = seat.zone === 'bootcamp' ? 'bootcamp5h' : 'hour';
    var query = $.param({ zone: seat.zone, pass: pass, seat: seat.id, date: REQ.iso(start), time: start.getHours() });
    return 'booking.html?' + query;
  };

  var describe = function (seat) {
    var zone = zoneOf(seat.zone);
    return (shortName[seat.zone] || zone.name) + ', station ' + REQ.pad(seat.number);
  };

  var showCard = function (seat, button) {
    var zone = zoneOf(seat.zone);
    var nextHour = REQ.pad((now.getHours() + 1) % 24) + ':00';
    var box = $('<div class="sc-body"></div>');
    var head = $('<div class="sc-head"></div>');
    head.append($('<h3></h3>').text(describe(seat)));
    head.append($('<span class="sc-state"></span>').toggleClass('busy', seat.taken).text(seat.taken ? 'In use now' : 'Free now'));
    box.append(head);
    var gear = zone.specs.slice(0, 3).map(function (s) { return s[1]; });
    var list = $('<ul class="sc-specs"></ul>');
    if (seat.zone === 'stream') list.append($('<li></li>').text(zone.specs[0][1]), $('<li></li>').text(zone.specs[1][1]));
    else list.append($('<li></li>').text(zone.hz + ' Hz screen'), $('<li></li>').text(gear[0]), $('<li></li>').text(gear[2]));
    box.append(list);
    var actions = $('<div class="sc-actions"></div>');

    if (seat.zone === 'stream') {
      box.append($('<p class="muted small mb-2"></p>').text('The Streaming Suite is booked by phone so the studio can be prepared.'));
      actions.append('<a class="btn btn-candle btn-sm" href="tel:+77001234567"><i class="bi bi-telephone" aria-hidden="true"></i> Call the desk</a>');
    } else if (seat.taken) {
      var other = seats.filter(function (s) { return s.zone === seat.zone && !s.taken; })[0];
      box.append($('<p class="muted small mb-2"></p>').text('Someone is playing here right now.'));
      if (other) {
        actions.append($('<button type="button" class="btn btn-ghost btn-sm sc-next"></button>').text('Show a free seat in this zone').data('seat', other));
      }
      actions.append($('<a class="btn btn-candle btn-sm"></a>').attr('href', bookingLink(seat)).text('Book from ' + nextHour));
    } else {
      var price = seat.zone === 'bootcamp' ? REQ.money(18000) + ' for the room, 5 hours' : REQ.money(REQ.passes[0].price) + ' for 1 hour';
      box.append($('<p class="muted small mb-2"></p>').text(price + '. Booking starts at ' + nextHour + '.'));
      actions.append($('<a class="btn btn-candle btn-sm"></a>').attr('href', bookingLink(seat)).html('<i class="bi bi-calendar-check" aria-hidden="true"></i> Book this seat'));
    }
    box.append(actions);
    card.removeClass('empty-hint').empty().append(box);
    floor.find('.stn.sel').removeClass('sel').attr('aria-pressed', 'false');
    if (button) button.addClass('sel').attr('aria-pressed', 'true');
  };

  var zoneBlock = function (zone) {
    var mine = seats.filter(function (s) { return s.zone === zone.id; });
    var free = mine.filter(function (s) { return !s.taken; }).length;
    var block = $('<div class="zone-row"></div>').attr('data-group', mine[0].group);
    block.append($('<div class="zone-tag"></div>').append($('<span></span>').text(zone.name)).append($('<em></em>').text(free + ' free')));
    var room = $('<div class="bays"></div>').toggleClass('room', zone.type === 'team');
    var perBay = zone.type === 'team' ? mine.length : 8;
    for (var i = 0; i < mine.length; i += perBay) {
      var bay = $('<div class="bay"></div>').css('--cols', Math.min(perBay, mine.length - i));
      mine.slice(i, i + perBay).forEach(function (s) {
        var el = $('<button type="button" class="stn" aria-pressed="false"><b></b></button>').toggleClass('taken', s.taken).attr('data-group', s.group);
        el.attr('aria-label', describe(s) + ': ' + (s.taken ? 'in use' : 'free'));
        el.attr('title', describe(s) + ': ' + (s.taken ? 'in use' : 'free'));
        el.data('seat', s);
        bay.append(el);
      });
      room.append(bay);
    }
    return block.append(room);
  };

  var drawFloor = function () {
    floor.empty().removeAttr('aria-busy');
    ['vip', 'comfort', 'standard'].forEach(function (id) { floor.append(zoneBlock(zoneOf(id))); });
    var rooms = $('<div class="zone-row team-rooms" data-group="team"></div>');
    rooms.append('<div class="zone-tag"><span>Team rooms</span></div>');
    var roomWrap = $('<div class="room-pair"></div>').appendTo(rooms);
    ['bootcamp', 'stream'].forEach(function (id) {
      var part = zoneBlock(zoneOf(id));
      part.find('.zone-tag span').text(shortName[id]);
      roomWrap.append(part.removeClass('zone-row').addClass('room-box'));
    });
    floor.append(rooms);
    $('#hallFree').text(seats.filter(function (s) { return !s.taken; }).length);
    $('#hallTotal').text(seats.length);
  };

  REQ.skeleton(floor, 3, 'hall');
  REQ.later(drawFloor);

  var labels = { all: 'Whole hall', standard: 'Standard Zone', comfort: 'Comfort Zone', vip: 'VIP Lounge', team: 'Team rooms' };
  var summarize = function (group) {
    var set = seats.filter(function (s) { return group === 'all' || s.group === group; });
    var open = set.filter(function (s) { return !s.taken; }).length;
    $('#hallSummary').text(labels[group] + ': ' + open + ' of ' + set.length + ' stations free at ' + REQ.pad(REQ.nextSlot().getHours()) + ':00');
  };
  summarize('all');

  floor.on('click', '.stn', function () { showCard($(this).data('seat'), $(this)); });
  card.on('click', '.sc-next', function () {
    var seat = $(this).data('seat');
    var target = floor.find('.stn').filter(function () { return $(this).data('seat') === seat; });
    showCard(seat, target);
    target.trigger('focus');
  });

  $('[data-hall-zone]').on('click', function () {
    var btn = $(this);
    var group = btn.data('hall-zone');
    $('[data-hall-zone]').attr('aria-pressed', 'false');
    btn.attr('aria-pressed', 'true');
    floor.find('.stn').each(function () {
      var match = group === 'all' || $(this).attr('data-group') === group;
      $(this).toggleClass('dim', !match).prop('tabindex', match ? 0 : -1);
    });
    summarize(group);
  });

  var grid = $('#homeZones');
  REQ.skeleton(grid, 4, 'card', 'col-12 col-md-6 col-xl-3');
  REQ.later(function () {
    grid.empty().removeAttr('aria-busy');
    REQ.zones.filter(function (z) { return z.id !== 'stream'; }).forEach(function (z) {
      var col = $('<div class="col-12 col-md-6 col-xl-3"></div>');
      var tile = $('<article class="panel zone-card lit"></article>');
      tile.append('<div class="arch t-' + z.id + '"><i class="bi ' + z.icon + '" aria-hidden="true"></i></div>');
      var body = $('<div class="zone-body"></div>');
      body.append('<h3>' + z.name + '</h3>');
      body.append('<span class="hz">' + z.hz + ' Hz, ' + z.stations + (z.stations === 1 ? ' station' : ' stations') + '</span>');
      body.append('<p class="muted mt-2">' + z.blurb + '</p>');
      body.append('<a class="btn btn-ghost btn-sm" href="zones.html#' + z.id + '">See hardware</a>');
      tile.append(body);
      grid.append(col.append(tile));
    });
    REQ.reveal(grid);
  });
});
