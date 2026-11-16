$(function () {
  var cats = ['All'];
  REQ.menu.forEach(function (m) { if (cats.indexOf(m.category) === -1) cats.push(m.category); });
  var active = 'All';
  var cart = {};
  var chips = $('#menuChips');
  cats.forEach(function (c) { $('<button type="button" class="chip"></button>').text(c).attr('aria-pressed', c === active).appendTo(chips); });

  var find = function (id) { return REQ.menu.filter(function (m) { return m.id === id; })[0]; };

  var drawMenu = function () {
    var term = $('#menuSearch').val().trim().toLowerCase();
    var found = REQ.menu.filter(function (m) {
      return (active === 'All' || m.category === active) && (m.name + ' ' + m.desc).toLowerCase().indexOf(term) !== -1;
    });
    var box = $('#menuGrid').empty();
    if (!found.length) {
      box.append('<div class="col-12"><div class="empty"><i class="bi bi-cup-hot" aria-hidden="true"></i><strong>Nothing on the menu matches</strong>Try another word or choose All.</div></div>');
      return;
    }
    found.forEach(function (m) {
      var col = $('<div class="col-12 col-sm-6"></div>');
      var card = $('<article class="panel menu-card lit"></article>');
      card.append($('<img class="menu-pic" width="480" height="300" loading="lazy">').attr('src', 'images/menu/' + m.id + '.jpg').attr('alt', 'Photo of ' + m.name));
      card.append($('<h3></h3>').text(m.name)).append($('<p></p>').text(m.desc));
      var bottom = $('<div class="bottom"></div>').append('<span class="price">' + REQ.money(m.price) + '</span>');
      bottom.append($('<button type="button" class="btn btn-ghost btn-sm add"></button>').attr('data-id', m.id).attr('aria-label', 'Add ' + m.name + ' to tray').html('<i class="bi bi-plus-lg" aria-hidden="true"></i> Add'));
      card.append(bottom);
      box.append(col.append(card));
    });
  };

  var drawTray = function () {
    var box = $('#trayLines').empty();
    var ids = Object.keys(cart);
    var total = 0;
    var count = 0;
    if (!ids.length) box.append('<p class="muted mb-3">Your tray is empty. Add something from the menu.</p>');
    ids.forEach(function (id) {
      var item = find(id);
      var qty = cart[id];
      total += item.price * qty;
      count += qty;
      var line = $('<div class="tray-line"></div>').attr('data-id', id);
      line.append($('<span class="name"></span>').text(item.name));
      line.append('<span class="sum">' + REQ.money(item.price * qty) + '</span>');
      line.append('<span class="qty"><button type="button" class="minus" aria-label="Remove one ' + item.name + '">&minus;</button><span aria-live="polite">' + qty + '</span><button type="button" class="plus" aria-label="Add one ' + item.name + '">+</button></span>');
      box.append(line);
    });
    $('#trayTotal').text(REQ.money(total));
    $('#trayCount').text(count);
    $('#traySend, #trayClear').prop('disabled', !count);
  };

  chips.on('click', '.chip', function () {
    active = $(this).text();
    chips.find('.chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    drawMenu();
  });
  $('#menuSearch').on('input', drawMenu);
  $('#menuGrid').on('click', '.add', function () {
    var id = $(this).attr('data-id');
    cart[id] = (cart[id] || 0) + 1;
    drawTray();
  });
  $('#trayLines').on('click', '.plus', function () {
    var id = $(this).closest('.tray-line').attr('data-id');
    cart[id] += 1;
    drawTray();
  });
  $('#trayLines').on('click', '.minus', function () {
    var id = $(this).closest('.tray-line').attr('data-id');
    cart[id] -= 1;
    if (cart[id] <= 0) delete cart[id];
    drawTray();
  });
  $('#trayClear').on('click', function () { cart = {}; drawTray(); });
  $('#traySend').on('click', function () {
    var ids = Object.keys(cart);
    if (!ids.length) return;
    var lines = ids.map(function (id) { var m = find(id); return { name: m.name, qty: cart[id], sum: m.price * cart[id] }; });
    var total = lines.reduce(function (t, l) { return t + l.sum; }, 0);
    $(document).trigger('tray:send', [{ lines: lines, total: total }]);
  });
  $(document).on('tray:sent', function () { cart = {}; drawTray(); });
  drawMenu();
  drawTray();
});
