$(function () {
  var grid = $('#zoneGrid');
  var drawZones = function (filter) {
    grid.empty();
    var list = REQ.zones.filter(function (z) { return filter === 'all' || z.type === filter; });
    list.forEach(function (z) {
      var col = $('<div class="col-12 col-md-6 col-xl-4"></div>').attr('id', z.id);
      var card = $('<article class="panel zone-card lit"></article>');
      card.append('<div class="arch t-' + z.id + '"><i class="bi ' + z.icon + '" aria-hidden="true"></i></div>');
      var body = $('<div class="zone-body"></div>');
      body.append('<h3>' + z.name + '</h3>');
      body.append('<span class="hz">' + z.hz + ' Hz, ' + z.stations + (z.stations === 1 ? ' station' : ' stations') + '</span>');
      body.append('<p class="muted mt-2 mb-0">' + z.blurb + '</p>');
      var specs = $('<ul class="spec-list"></ul>');
      z.specs.forEach(function (s) { specs.append('<li><i class="bi ' + s[0] + '" aria-hidden="true"></i><span>' + s[1] + '</span></li>'); });
      body.append(specs);
      if (z.id !== 'stream') body.append('<a class="btn btn-candle btn-sm" href="booking.html?zone=' + z.id + '">Book this zone</a>');
      else body.append('<a class="btn btn-ghost btn-sm" href="about.html#contact">Ask the desk</a>');
      card.append(body);
      grid.append(col.append(card));
    });
    var seatTotal = list.reduce(function (sum, z) { return sum + z.stations; }, 0);
    $('#zoneCount').html('<b>' + list.length + '</b> zones, <b>' + seatTotal + '</b> stations');
  };

  $('[data-zone-filter]').on('click', function () {
    var btn = $(this);
    $('[data-zone-filter]').attr('aria-pressed', 'false');
    btn.attr('aria-pressed', 'true');
    drawZones(btn.data('zone-filter'));
  });
  drawZones('all');

  if (location.hash && $(location.hash).length) {
    setTimeout(function () { $('html, body').animate({ scrollTop: $(location.hash).offset().top - 90 }, 400); }, 120);
  }
});
