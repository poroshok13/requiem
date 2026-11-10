$(function () {
  var stage = $('#teamStage');
  var slides = REQ.team.map(function (t, i) {
    var el = $('<figure class="slide m-0"></figure>').attr('aria-label', (i + 1) + ' of ' + REQ.team.length);
    el.append($('<img>').attr({ src: t.src, alt: t.alt, width: 800, height: 600 }));
    el.append($('<figcaption class="slide-text"></figcaption>').append($('<h3></h3>').text(t.name)).append($('<p></p>').text(t.role)));
    return el.appendTo(stage);
  });
  var bar = $('<div class="slider-bar"></div>');
  var prev = $('<button type="button" class="slider-btn" aria-label="Previous photo"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>');
  var next = $('<button type="button" class="slider-btn" aria-label="Next photo"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>');
  var dots = $('<div class="dots"></div>');
  var dotBtns = REQ.team.map(function (t, i) {
    return $('<button type="button"></button>').attr('aria-label', 'Show ' + t.name).data('i', i).appendTo(dots);
  });
  bar.append(prev, dots, next).appendTo(stage);

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var now = 0;
  var busy = false;
  var go = function (i) {
    i = (i + slides.length) % slides.length;
    if (busy || i === now) return;
    busy = true;
    var out = slides[now];
    var inn = slides[i];
    dotBtns.forEach(function (d, k) { d.attr('aria-current', k === i ? 'true' : 'false'); });
    var d = calm ? 0 : 350;
    out.stop(true, true).fadeOut(d, function () {
      out.removeClass('on').css('display', '');
      inn.addClass('on').hide().fadeIn(d, function () { busy = false; });
      if (!d) busy = false;
    });
    now = i;
  };
  slides[0].addClass('on');
  dotBtns[0].attr('aria-current', 'true');
  prev.on('click', function () { go(now - 1); });
  next.on('click', function () { go(now + 1); });
  dots.on('click', 'button', function () { go($(this).data('i')); });
  $('#teamSlider').on('keydown', function (e) {
    if (e.key === 'ArrowLeft') go(now - 1);
    if (e.key === 'ArrowRight') go(now + 1);
  });
  var x0 = null;
  stage.on('touchstart', function (e) { x0 = e.originalEvent.touches[0].clientX; });
  stage.on('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.originalEvent.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(dx < 0 ? now + 1 : now - 1);
    x0 = null;
  });
});
