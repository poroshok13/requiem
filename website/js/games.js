$(function () {
  var favKey = REQ.favKey();
  var favs = REQ.store.get(favKey, []);
  // a link from the profile (zones.html?game=Title) opens the library already filtered to that game
  var wanted = new URLSearchParams(window.location.search).get('game');
  if (wanted) $('#gameSearch').val(wanted);
  var zoneName = function (id) {
    if (id === 'lounge') return 'PS5 Lounge';
    return REQ.zones.filter(function (z) { return z.id === id; })[0].name;
  };

  var genres = [];
  REQ.games.forEach(function (g) { if (genres.indexOf(g.genre) === -1) genres.push(g.genre); });
  genres.sort().forEach(function (g) { $('#gameGenre').append($('<option></option>').val(g).text(g)); });

  var list = $('#gameList');
  var draw = function () {
    var term = $('#gameSearch').val().trim().toLowerCase();
    var genre = $('#gameGenre').val();
    var platform = $('#gamePlatform').val();
    var sort = $('#gameSort').val();
    var onlyFav = $('#onlyFav').is(':checked');
    var found = REQ.games.filter(function (g) {
      return (genre === 'all' || g.genre === genre) && (platform === 'all' || g.platform === platform) &&
        g.title.toLowerCase().indexOf(term) !== -1 && (!onlyFav || favs.indexOf(g.title) !== -1);
    });
    found.sort(function (a, b) {
      if (sort === 'fps') return b.fps - a.fps;
      if (sort === 'genre') return a.genre.localeCompare(b.genre) || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });

    list.empty();
    $('#favCount').text(favs.length);
    if (!found.length) {
      var msg = onlyFav && !favs.length ? ['Your list is empty', 'Tap the heart on a game to add it to your list.'] : ['No games match your search', 'Try a shorter name or reset the filters.'];
      list.append('<div class="col-12"><div class="empty"><i class="bi bi-search" aria-hidden="true"></i><strong>' + msg[0] + '</strong>' + msg[1] + '</div></div>');
      $('#gameCount').text('0 games found');
      return;
    }

    var total = 0;
    found.forEach(function (g) {
      total += g.fps;
      var on = favs.indexOf(g.title) !== -1;
      var card = $('<article class="panel game-card lit"></article>');
      var head = $('<div class="game-head"></div>').append($('<h3></h3>').text(g.title));
      head.append($('<button type="button" class="fav"></button>').attr('data-title', g.title).attr('aria-pressed', String(on)).attr('aria-label', (on ? 'Remove ' : 'Add ') + g.title + (on ? ' from' : ' to') + ' my list').html('<i class="bi ' + (on ? 'bi-heart-fill' : 'bi-heart') + '" aria-hidden="true"></i>'));
      card.append($('<img class="game-cover" alt="" width="480" height="300" loading="lazy">').attr('src', g.cover).attr('alt', 'Cover illustration for ' + g.title));
      card.append(head);
      var tags = $('<div class="tags"></div>');
      tags.append($('<span class="tag"></span>').text(g.genre));
      tags.append($('<span class="tag"></span>').text(g.mode));
      tags.append($('<span class="tag"></span>').addClass(g.platform === 'PS5' ? 'hot' : '').text(g.platform));
      card.append(tags);
      card.append($('<div class="fps"></div>').html('Runs best in ' + zoneName(g.zone) + ', about <b>' + g.fps + ' fps</b>'));
      list.append($('<div class="col-12 col-sm-6 col-lg-4"></div>').append(card));
    });
    $('#gameCount').html('<b>' + found.length + '</b> of ' + REQ.games.length + ' games, average <b>' + Math.round(total / found.length) + ' fps</b>');
  };

  list.on('click', '.fav', function () {
    var title = $(this).attr('data-title');
    var at = favs.indexOf(title);
    if (at === -1) favs.push(title); else favs.splice(at, 1);
    REQ.store.set(favKey, favs);
    draw();
    list.find('.fav[data-title="' + title.replace(/"/g, '\\"') + '"]').trigger('focus');
  });
  $('#gameSearch').on('input', draw);
  $('#gameSearch').on('keydown', function (e) { if (e.key === 'Escape') { $(this).val(''); draw(); } });
  $('#gameGenre, #gamePlatform, #gameSort, #onlyFav').on('change', draw);
  $('#gameReset').on('click', function () {
    $('#gameSearch').val('');
    $('#gameGenre, #gamePlatform').val('all');
    $('#gameSort').val('title');
    $('#onlyFav').prop('checked', false);
    draw();
  });
  draw();
});
