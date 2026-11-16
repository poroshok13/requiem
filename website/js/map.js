$(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var filter = 'all';
  var selected = null;
  var tint = { standard: 't-standard', comfort: 't-comfort', vip: 't-vip', bootcamp: 't-bootcamp', stream: 't-stream' };
  var zoneOf = function (id) { return REQ.zones.filter(function (z) { return z.id === id; })[0]; };

  var el = function (name, attrs) { return $(document.createElementNS(NS, name)).attr(attrs); };
  var svg = el('svg', { viewBox: '0 0 800 500', class: 'plan', role: 'group', 'aria-label': 'Floor plan of the Requiem hall' });

  // hall floor: outer walls and a faint dotted grid
  svg.append(el('defs', {}).append(el('pattern', { id: 'plan-dots', width: 22, height: 22, patternUnits: 'userSpaceOnUse' }).append(el('circle', { cx: 2, cy: 2, r: 1.4, class: 'floor-dot' }))));
  svg.append(el('rect', { x: 8, y: 8, width: 784, height: 484, rx: 16, class: 'hall-floor' }));
  svg.append(el('rect', { x: 8, y: 8, width: 784, height: 484, rx: 16, class: 'hall-grid', fill: 'url(#plan-dots)' }));

  // a station is drawn as a small monitor; the stations of a zone fill a grid inside its room
  var desks = function (r, count) {
    var g = el('g', { class: 'desks' });
    var x0 = r.x + 20, y0 = r.y + 70;
    var availW = r.w - 40, availH = Math.max(24, r.h - 70 - 14);
    var cols = Math.max(1, Math.ceil(Math.sqrt(count * availW / availH)));
    if (count <= 8 && availW / count >= 16) cols = count;
    var rows = Math.ceil(count / cols);
    var cell = Math.min(availW / cols, availH / rows, 26);
    var left = x0 + (availW - cols * cell) / 2;
    var size = cell * 0.62;
    for (var i = 0; i < count; i++) {
      var col = i % cols, row = Math.floor(i / cols);
      g.append(el('rect', { x: left + col * cell + (cell - size) / 2, y: y0 + row * cell + (cell - size) / 2, width: size, height: size * 0.7, rx: 2, class: 'desk' }));
    }
    return g;
  };


  // small line icons for service rooms, drawn in the empty space on the right
  var icons = {
    'r-bar': { w: 48, h: 48, parts: [
      ['path', { d: 'M8 8h32L24 26z' }],
      ['path', { d: 'M24 26v14M15 40h18' }],
      ['path', { d: 'M14 15h20' }],
      ['path', { d: 'M30 4l-5 11' }],
      ['circle', { cx: 28, cy: 11, r: 2.2 }]
    ] },
    'r-reception': { w: 48, h: 48, parts: [
      ['path', { d: 'M7 36h34' }],
      ['path', { d: 'M12 36a12 12 0 0 1 24 0' }],
      ['path', { d: 'M24 21v-5M20 16h8' }]
    ] },
    'r-lounge': { w: 90, h: 56, parts: [
      ['path', { d: 'M30 8C22 8 16 12 12 22L4 44C2 51 6 54 11 52C16 50 19 44 23 40C25 38 27 37 30 37H60C63 37 65 38 67 40C71 44 74 50 79 52C84 54 88 51 86 44L78 22C74 12 68 8 60 8Z' }],
      ['rect', { x: 36, y: 12, width: 18, height: 8, rx: 3 }],
      ['path', { d: 'M24 14.5v11M18.5 20h11' }],
      ['circle', { cx: 37, cy: 31, r: 4 }],
      ['circle', { cx: 53, cy: 31, r: 4 }],
      ['path', { d: 'M65 11l2.3 4h-4.6z', 'stroke-width': 1.4 }],
      ['circle', { cx: 72, cy: 20, r: 2, 'stroke-width': 1.4 }],
      ['path', { d: 'M63.2 25.2l3.6 3.6M66.8 25.2l-3.6 3.6', 'stroke-width': 1.4 }],
      ['rect', { x: 56.2, y: 18.2, width: 3.6, height: 3.6, rx: 0.4, 'stroke-width': 1.4 }]
    ] }
  };
  var icon = function (r) {
    var def = icons[r.id];
    if (!def) return null;
    var scale = r.id === 'r-lounge' ? 1.3 : 1;
    var w = def.w * scale, h = def.h * scale;
    var x = r.x + r.w - w - 24, y = r.y + (r.h - h) / 2 + (r.id === 'r-lounge' ? 8 : 0);
    var g = el('g', { class: 'room-icon', transform: 'translate(' + x + ' ' + y + ') scale(' + scale + ')' });
    def.parts.forEach(function (p) { g.append(el(p[0], p[1])); });
    return g;
  };

  REQ.rooms.forEach(function (r) {
    var g = el('g', { class: 'room ' + (tint[r.zone] || 'room-service'), tabindex: 0, role: 'button', 'data-id': r.id, 'aria-label': r.name + '. Press Enter for details.', 'aria-pressed': 'false' });
    g.append(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, class: 'room-body' }));
    g.append(el('rect', { x: r.x, y: r.y + 12, width: 5, height: Math.max(0, r.h - 24), rx: 2.5, class: 'room-stripe' }));
    g.append(el('text', { x: r.x + 20, y: r.y + 30, class: 'room-name' }).text(r.name));
    if (r.zone) {
      var count = zoneOf(r.zone).stations;
      g.append(el('text', { x: r.x + 20, y: r.y + 52, class: 'room-count' }).text(count + (count === 1 ? ' station' : ' stations')));
      g.append(desks(r, count));
    } else {
      g.append(el('text', { x: r.x + 20, y: r.y + 52, class: 'room-sub' }).text('Service area'));
      var ic = icon(r);
      if (ic) g.append(ic);
    }
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
