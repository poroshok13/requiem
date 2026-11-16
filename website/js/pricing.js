$(function () {
  var wrap = $('#passGrid');
  REQ.passes.forEach(function (p) {
    var col = $('<div class="col-12 col-md-6 col-xl-3"></div>');
    var card = $('<article class="panel pass lit"></article>').toggleClass('best', p.id === 'night').attr('data-pass', p.id);
    card.append($('<span class="pass-tag"></span>').text(p.tag));
    card.append($('<h3></h3>').text(p.name));
    card.append($('<p class="muted mb-0"></p>').text(p.blurb));
    card.append('<div class="price">' + REQ.money(p.price) + ' <small>/ ' + p.unit + '</small></div>');
    var ul = $('<ul></ul>');
    p.features.forEach(function (f) { ul.append($('<li></li>').text(f)); });
    card.append(ul);
    card.append('<a class="btn ' + 'btn-ghost' + '" href="booking.html?pass=' + p.id + '">Select pass</a>');
    wrap.append(col.append(card));
  });

  var price = function (id) { return REQ.passes.filter(function (p) { return p.id === id; })[0].price; };

  var calculate = function () {
    var hours = Number($('#calcHours').val());
    var who = $('#calcWho').val();
    var when = $('#calcWhen').val();
    $('#calcHoursOut').text(hours + (hours === 1 ? ' hour' : ' hours'));
    var options = [];

    if (who === 'team') {
      var blocks = Math.ceil(hours / 5);
      options.push({ name: 'Boot Camp Pass', total: blocks * price('bootcamp5h'), note: blocks + ' x 5-hour room block for 5 players' });
      options.push({ name: 'Five single hours', total: hours * price('hour') * 5, note: '5 Standard stations, ' + hours + ' h each' });
    } else {
      var hourly = hours * price('hour');
      var full = Math.floor(hours / 3);
      var rest = hours % 3;
      options.push({ name: 'Standard Hour', total: hourly, note: hours + ' x ' + REQ.money(price('hour')) });
      options.push({ name: '3-Hour Boost', total: full * price('3hours') + rest * price('hour'), note: full + ' x Boost' + (rest ? ' + ' + rest + ' single hour' + (rest > 1 ? 's' : '') : '') });
      if (rest) options.push({ name: '3-Hour Boost', total: Math.ceil(hours / 3) * price('3hours'), note: Math.ceil(hours / 3) + ' x Boost, rounded up' });
      if (when === 'night' && hours >= 10) {
        var extra = Math.max(0, hours - 10);
        options.push({ name: 'Night Marathon', total: price('night') + extra * price('hour'), note: '10 hours from 22:00' + (extra ? ' + ' + extra + ' extra hours' : '') });
      }
    }

    options.sort(function (a, b) { return a.total - b.total; });
    var best = options[0];
    var worst = options[options.length - 1];
    $('#calcName').text(best.name);
    $('#calcTotal').text(REQ.money(best.total));
    var saved = worst.total - best.total;
    $('#calcSaving').text(saved > 0 ? 'You save ' + REQ.money(saved) + ' compared with the most expensive way.' : 'This is the only fair option for this plan.');
    var list = $('#calcList').empty();
    options.forEach(function (o) { list.append($('<li></li>').text(o.name + ': ' + REQ.money(o.total) + ' (' + o.note + ')')); });

    var passId = { 'Boot Camp Pass': 'bootcamp5h', 'Standard Hour': 'hour', '3-Hour Boost': '3hours', 'Night Marathon': 'night' }[best.name];
    $('#calcBook').attr('href', passId ? 'booking.html?pass=' + passId : 'booking.html');
    $('[data-pass]').removeClass('best');
    if (passId) $('[data-pass="' + passId + '"]').addClass('best');
  };

  $('#calcHours').on('input', calculate);
  $('#calcWho').on('change', function () {
    var team = $(this).val() === 'team';
    $('#calcWhen').prop('disabled', team);
    calculate();
  });
  $('#calcWhen').on('change', calculate);
  calculate();

  var topics = [];
  REQ.faq.forEach(function (f) { if (topics.indexOf(f.topic) === -1) topics.push(f.topic); });
  topics.forEach(function (t) { $('#faqTopic').append($('<option></option>').val(t).text(t)); });

  var faqBox = $('#faqList');
  var drawFaq = function () {
    var term = $('#faqSearch').val().trim().toLowerCase();
    var topic = $('#faqTopic').val();
    var found = REQ.faq.filter(function (f) {
      return (topic === 'all' || f.topic === topic) && (f.q + ' ' + f.a).toLowerCase().indexOf(term) !== -1;
    });
    faqBox.empty();
    if (!found.length) {
      faqBox.append('<div class="empty"><i class="bi bi-question-circle" aria-hidden="true"></i><strong>No answer found</strong>Try another word, or call the desk on +7 (700) 123-45-67.</div>');
      $('#faqCount').text('0 answers');
      return;
    }
    found.forEach(function (f, i) {
      var item = $('<div class="fold"></div>');
      var btn = $('<button type="button" class="fold-btn" aria-expanded="false"></button>').attr('aria-controls', 'faq-panel-' + i);
      btn.append($('<span></span>').text(f.q)).append('<i class="bi bi-plus-lg" aria-hidden="true"></i>');
      var panel = $('<div class="fold-panel" role="region"></div>').attr('id', 'faq-panel-' + i).append($('<p></p>').text(f.a));
      faqBox.append(item.append(btn).append(panel));
    });
    $('#faqCount').text(found.length + (found.length === 1 ? ' answer' : ' answers'));
  };
  $('#faqSearch').on('input', drawFaq);
  $('#faqTopic').on('change', drawFaq);
  drawFaq();
});
