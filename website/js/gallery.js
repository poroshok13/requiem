$(function () {
  var grid = $('#galleryGrid');
  REQ.gallery.forEach(function (g, i) {
    var btn = $('<button type="button"></button>').attr('data-i', i).attr('aria-label', 'Open photo: ' + g.caption);
    btn.append($('<img loading="lazy" width="800" height="600">').attr('src', g.src).attr('alt', g.alt));
    btn.append($('<span></span>').text(g.caption));
    grid.append(btn);
  });

  var box = $('<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"></div>');
  box.append('<button type="button" class="lb-btn lb-close" aria-label="Close viewer"><i class="bi bi-x-lg" aria-hidden="true"></i></button>');
  box.append('<button type="button" class="lb-btn lb-prev" aria-label="Previous photo"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>');
  box.append('<button type="button" class="lb-btn lb-next" aria-label="Next photo"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>');
  box.append('<figure><img id="lbImg" src="" alt=""><figcaption id="lbCap"></figcaption></figure>');
  $('body').append(box);

  var index = 0;
  var opener = null;
  var isOpen = false;
  var fade = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250;
  var fill = function (i) {
    index = (i + REQ.gallery.length) % REQ.gallery.length;
    $('#lbImg').attr('src', REQ.gallery[index].src).attr('alt', REQ.gallery[index].alt);
    $('#lbCap').text(REQ.gallery[index].caption + ' (' + (index + 1) + ' of ' + REQ.gallery.length + ')');
  };
  var open = function (i, from) {
    if (isOpen) return;
    isOpen = true;
    opener = from;
    fill(i);
    box.stop(true).css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, fade);
    box.find('.lb-close').trigger('focus');
  };
  var close = function () {
    if (!isOpen) return;
    isOpen = false;
    box.stop(true).animate({ opacity: 0 }, fade, function () { box.css('display', 'none'); });
    if (opener) $(opener).trigger('focus');
  };
  grid.on('click', 'button', function () { open(Number($(this).attr('data-i')), this); });
  box.on('click', '.lb-close', close);
  box.on('click', '.lb-prev', function () { fill(index - 1); });
  box.on('click', '.lb-next', function () { fill(index + 1); });
  box.on('click', function (e) { if (e.target === box[0]) close(); });
  $(document).on('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') fill(index - 1);
    if (e.key === 'ArrowRight') fill(index + 1);
    if (e.key === 'Tab') {
      var items = box.find('button');
      var first = items.first()[0];
      var last = items.last()[0];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
});
