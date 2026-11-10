var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var speed = function (ms) { return calm ? 0 : ms; };

window.notify = function (message, kind) {
  var box = $('#toast');
  if (!box.length) {
    box = $('<div id="toast" class="toast-nx" role="status" aria-live="polite"></div>').appendTo('body');
  }
  var icon = kind === 'warn' ? 'bi-exclamation-circle' : 'bi-check-circle';
  box.stop(true, true).removeClass('warn').toggleClass('warn', kind === 'warn')
    .html('<i class="bi ' + icon + '" aria-hidden="true"></i>').append(document.createTextNode(message))
    .slideDown(speed(220)).delay(3200).fadeOut(speed(400));
};

$(function () {
  $('a[href*="#"]').on('click', function (e) {
    var hash = this.hash;
    var samePage = this.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '');
    if (!hash || hash.length < 2 || !samePage) return;
    var target = $(hash);
    if (!target.length) return;
    e.preventDefault();
    $('html, body').stop(true).animate({ scrollTop: target.offset().top - 84 }, speed(550), function () {
      target.attr('tabindex', '-1').trigger('focus');
    });
  });

  var toTop = $('<button type="button" class="to-top" aria-label="Back to top"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>').appendTo('body');
  var shown = false;
  $(window).on('scroll', function () {
    var past = $(window).scrollTop() > 500;
    if (past && !shown) { shown = true; toTop.stop(true, true).fadeIn(speed(250)); }
    if (!past && shown) { shown = false; toTop.stop(true, true).fadeOut(speed(250)); }
  });
  toTop.on('click', function () { $('html, body').stop(true).animate({ scrollTop: 0 }, speed(500)); });

  $(document).on('mousemove', '.lit', function (e) {
    var box = this.getBoundingClientRect();
    this.style.setProperty('--mx', e.clientX - box.left + 'px');
    this.style.setProperty('--my', e.clientY - box.top + 'px');
  });

  $('.count').each(function () {
    var el = $(this);
    var end = Number(el.data('count'));
    var suffix = el.data('suffix') || '';
    $({ n: 0 }).animate({ n: end }, {
      duration: speed(1400),
      easing: 'swing',
      step: function (v) { el.text(Math.round(v) + suffix); },
      complete: function () { el.text(end + suffix); }
    });
  });

  $(document).on('click', '.fold-btn', function () {
    var btn = $(this);
    var panel = btn.next('.fold-panel');
    var open = btn.attr('aria-expanded') === 'true';
    var group = btn.closest('[data-fold-group]');
    group.find('.fold-btn[aria-expanded="true"]').not(btn).attr('aria-expanded', 'false').next('.fold-panel').stop(true, true).slideUp(speed(260));
    btn.attr('aria-expanded', String(!open));
    panel.stop(true, true).slideToggle(speed(260));
  });
});

$(function () {
  var holders = $('.has-bg');
  if (!holders.length) return;
  var start = REQ.hash(location.pathname.split('/').pop() || 'index.html') % REQ.heroScenes.length;
  var layers = REQ.heroScenes.map(function (src) {
    return $('<div class="layer"></div>').css('background-image', 'url(' + src + ')');
  });
  holders.find('.hero-bg').first().append(layers);
  var now = start;
  layers[now].addClass('on');
  if (calm) return;
  var timer = null;
  var show = function (i) {
    var old = layers[now];
    old.removeClass('on').addClass('leaving');
    setTimeout(function () { old.removeClass('leaving'); }, 1500);
    now = i;
    layers[now].removeClass('leaving').addClass('on');
  };
  var play = function () { timer = setInterval(function () { show((now + 1) % layers.length); }, 7000); };
  var stop = function () { clearInterval(timer); timer = null; };
  var paused = REQ.store.get('requiem.bgpaused', false);
  var btn = $('<button type="button" class="btn btn-ghost btn-sm bg-toggle"></button>').appendTo(holders.first());
  var label = function () { btn.attr('aria-pressed', String(paused)).text(paused ? 'Play background' : 'Pause background'); };
  label();
  if (!paused) play();
  btn.on('click', function () {
    paused = !paused;
    REQ.store.set('requiem.bgpaused', paused);
    label();
    if (paused) stop(); else play();
  });
});

$(function () {
  var links = $('.subnav a');
  if (!links.length) return;
  var pin = function () { $('.subnav').css('top', $('.site-nav').outerHeight() + 'px'); };
  pin();
  $(window).on('resize', pin);
  var targets = links.map(function () { return $(this.hash)[0]; }).get();
  var mark = function () {
    var y = $(window).scrollTop() + 300;
    var current = null;
    targets.forEach(function (el) { if (el && $(el).offset().top <= y) current = el.id; });
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 4 && targets.length) current = targets[targets.length - 1].id;
    links.each(function () { $(this).toggleClass('on', this.hash === '#' + current); });
  };
  $(window).on('scroll resize', mark);
  mark();
});

/* Skeleton placeholders: shown briefly while a block of content is built */
REQ.skeleton = function (box, count, kind, wrap) {
  box.empty().attr('aria-busy', 'true');
  for (var i = 0; i < count; i++) {
    var bone = '<div class="skel skel-' + kind + '" aria-hidden="true"></div>';
    box.append(wrap ? $('<div class="' + wrap + '"></div>').append(bone) : bone);
  }
};

REQ.later = function (fn) {
  if (calm) { fn(); return; }
  setTimeout(fn, 450);
};

/* Cards fade and rise into view once, the first time they scroll on screen */
REQ.reveal = (function () {
  var selector = '.zone-card, .event, .rank, .pass, .game-card, .menu-card, .perk, .fact, .record, .stat, .fold, .team-card, .room-info';
  var seen = 'is-seen';
  var io = null;
  if (!calm && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('in');
        setTimeout(function () {
          el.classList.remove('reveal', 'in');
          el.style.transitionDelay = '';
        }, 1000);
      });
    }, { threshold: 0.08 });
  }
  return function (root) {
    if (!io) return;
    var fresh = $(root || document).find(selector).addBack(selector).not('.' + seen);
    fresh.each(function (i) {
      this.classList.add(seen, 'reveal');
      this.style.transitionDelay = (i % 6) * 70 + 'ms';
      io.observe(this);
    });
  };
}());

/* Header tools: live free-seat counter and light/dark switch */
$(function () {
  var bar = $('.site-nav > .container');
  if (!bar.length) return;
  var tools = $('<div class="nav-tools"></div>');
  var live = $('<a class="live-pill" href="index.html#hall"><span class="dot" aria-hidden="true"></span><span class="live-text"></span></a>').appendTo(tools);
  var themeBtn = $('<button type="button" class="theme-btn"></button>').appendTo(tools);
  bar.find('.navbar-toggler').before(tools);

  var refresh = function () {
    var c = REQ.liveCount();
    live.find('.live-text').html('<b>' + c.free + '</b> free');
    var at = REQ.pad(REQ.nextSlot().getHours()) + ':00';
    live.attr('aria-label', c.free + ' of ' + c.total + ' stations are free at ' + at + '. Open the live hall map.');
    live.attr('title', c.free + ' of ' + c.total + ' stations free at ' + at);
  };
  refresh();
  setInterval(refresh, 60000);
  $(document).on('bookings:changed', refresh);

  var paint = function () {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    themeBtn.attr('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme')
      .attr('title', light ? 'Dark theme' : 'Light theme')
      .html('<i class="bi ' + (light ? 'bi-moon-stars' : 'bi-sun') + '" aria-hidden="true"></i>');
  };
  paint();
  themeBtn.on('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
    REQ.store.set('requiem.theme', next);
    paint();
  });
});

$(function () { REQ.reveal(document); });

/* Jump links (…html#faq, …html#gallery): the sections below are filled in by JavaScript,
   so the browser's first jump can land too high. Re-aim at the target once the content has settled. */
$(function () {
  var hash = location.hash;
  if (!hash || hash.length < 2) return;
  var target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  var moved = false;
  $(window).one('wheel touchstart keydown mousedown', function () { moved = true; });
  var aim = function () {
    if (moved) return;
    window.scrollTo({ top: $(target).offset().top - 140, behavior: 'instant' });
  };
  aim();
  $(window).on('load', aim);
  setTimeout(aim, 300);
  setTimeout(aim, 900);
});
