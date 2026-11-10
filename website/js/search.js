/* Site-wide search: games, tournaments, zones and FAQ questions, all taken from data.js */
$(function () {
  var box = $('#globalSearch');
  if (!box.length) return;
  var panel = $('#searchPanel');

  var index = [];
  REQ.games.forEach(function (g) {
    index.push({ group: 'Games', title: g.title, sub: g.genre + ', ' + g.platform + ', up to ' + g.fps + ' fps', href: 'zones.html#games', text: [g.title, g.genre, g.mode, g.platform].join(' ') });
  });
  REQ.events.forEach(function (e) {
    index.push({ group: 'Tournaments', title: e.name, sub: e.game + ', ' + e.format, href: 'tournaments.html#schedule-title', text: [e.name, e.game, e.format].join(' ') });
  });
  REQ.zones.forEach(function (z) {
    index.push({ group: 'Zones', title: z.name, sub: z.hz + ' Hz, ' + z.stations + ' stations', href: 'zones.html#rooms', text: [z.name, z.blurb].join(' ') });
  });
  REQ.faq.forEach(function (f) {
    index.push({ group: 'Questions', title: f.q, sub: 'Topic: ' + f.topic, href: 'pricing.html#faq', text: [f.q, f.a, f.topic].join(' ') });
  });
  var order = ['Games', 'Tournaments', 'Zones', 'Questions'];

  var close = function () {
    panel.attr('hidden', true).empty();
    box.attr('aria-expanded', 'false');
  };

  var search = function () {
    var q = $.trim(box.val()).toLowerCase();
    if (q.length < 2) { close(); return []; }
    var words = q.split(/\s+/);
    var hits = index.filter(function (item) {
      var text = item.text.toLowerCase();
      return words.every(function (w) { return text.indexOf(w) !== -1; });
    });
    hits.sort(function (a, b) {
      var sa = a.title.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      var sb = b.title.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      return sa - sb;
    });
    return hits;
  };

  var draw = function () {
    var q = $.trim(box.val());
    var hits = search();
    if (q.length < 2) return;
    panel.empty().removeAttr('hidden');
    box.attr('aria-expanded', 'true');
    if (!hits.length) {
      panel.append($('<p class="search-empty"></p>').text('Nothing found for "' + q + '". Try a game, a tournament or a zone name.'));
      return;
    }
    order.forEach(function (group) {
      var items = hits.filter(function (h) { return h.group === group; });
      if (!items.length) return;
      panel.append($('<h3></h3>').text(group + ' (' + items.length + ')'));
      items.forEach(function (h) {
        panel.append($('<a class="search-hit"></a>').attr('href', h.href)
          .append($('<b></b>').text(h.title))
          .append($('<small></small>').text(h.sub)));
      });
    });
  };

  box.on('input', draw);
  box.on('focus', draw);
  box.on('keydown', function (e) {
    if (e.key === 'Escape') { box.val(''); close(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      var first = panel.find('.search-hit').first();
      if (first.length) window.location.href = first.attr('href');
    }
  });
  $('.site-search').on('submit', function (e) { e.preventDefault(); });
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.site-search').length) close();
  });
});
