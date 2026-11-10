$(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var filter = 'all';
  var selected = null;
  var tint = { standard: 't-standard', comfort: 't-comfort', vip: 't-vip', bootcamp: 't-bootcamp', stream: 't-stream' };
  var zoneOf = function (id) { return REQ.zones.filter(function (z) { return z.id === id; })[0]; };

  var svg = $(document.createElementNS(NS, 'svg')).attr({ viewBox: '0 0 800 500', class: 'plan', role: 'group', 'aria-label': 'Floor plan of the Requiem hall' });
  REQ.rooms.forEach(function (r) {
    var g = $(document.createElementNS(NS, 'g')).attr({ class: 'room ' + (tint[r.zone] || ''), tabindex: 0, role: 'button', 'data-id': r.id, 'aria-label': r.name + '. Press Enter for details.', 'aria-pressed': 'false' });
    g.append($(document.createElementNS(NS, 'rect')).attr({ x: r.x, y: r.y, width: r.w, height: r.h, rx: 6 }));
    var label = $(document.createElementNS(NS, 'text')).attr({ x: r.x + 14, y: r.y + 28 }).text(r.name);
    g.append(label);
    if (r.zone) g.append($(document.createElementNS(NS, 'text')).attr({ x: r.x + 14, y: r.y + 50, class: 'sub' }).text(zoneOf(r.zone).stations + ' stations'));
    svg.append(g);
  });
  $('#plan').append(svg);

  var find = function (id) { return REQ.rooms.filter(function (r) { return r.id === id; })[0]; };

  var info = function () {
    var box = $('#roomInfo').empty();
    if (!selected) {
      box.append('<p class="muted mb-0">Select a room on the plan to see what is inside. You can also use Tab and Enter.</p>');
      return;
    }
    var r = find(selected);
    box.append($('<h3></h3>').text(r.name)).append($('<p class="muted"></p>').text(r.desc));
    if (r.zone) {
      var z = zoneOf(r.zone);
      box.append('<p class="hz mb-3">' + z.hz + ' Hz, ' + z.stations + (z.stations === 1 ? ' station' : ' stations') + '</p>');
      box.append(r.zone === 'stream' ? '<a class="btn btn-ghost btn-sm" href="about.html#contact">Ask the desk</a>' : '<a class="btn btn-candle btn-sm" href="booking.html?zone=' + r.zone + '">Book this zone</a>');
    }
  };

  var apply = function () {
    var visible = 0;
    var stations = 0;
    svg.find('.room').each(function () {
      var r = find($(this).attr('data-id'));
      var match = filter === 'all' || r.type === filter;
      $(this).toggleClass('dim', !match).toggleClass('on', r.id === selected).attr('aria-pressed', String(r.id === selected));
      if (match) {
        visible++;
        if (r.zone) stations += zoneOf(r.zone).stations;
      }
    });
    $('#planCount').html('<b>' + visible + '</b> of ' + REQ.rooms.length + ' rooms shown, <b>' + stations + '</b> stations');
    info();
  };

  var pick = function (el) {
    var id = $(el).attr('data-id');
    selected = selected === id ? null : id;
    apply();
  };
  svg.on('click', '.room', function () { pick(this); });
  svg.on('keydown', '.room', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(this); }
  });

  $('#planChips .chip').on('click', function () {
    filter = $(this).attr('data-filter');
    $('#planChips .chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    apply();
  });
  apply();
});
