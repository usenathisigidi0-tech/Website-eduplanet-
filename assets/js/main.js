/* EduPlanet Independent School — site behaviour
   Everything here is progressive: the site is complete and readable with JS off. */
(function () {
  'use strict';

  // Tells the head-script safety net that entrances are being driven, so it
  // leaves the .js class alone.
  window.__epReady = true;

  /* ---------------------------------------------------------- mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  /* ------------------------------------------------------- header state */
  var header = document.querySelector('.header');
  if (header) {
    var scrolled = false;
    var onScroll = function () {
      var now = window.scrollY > 12;
      if (now !== scrolled) {            // write only on change
        scrolled = now;
        header.classList.toggle('is-scrolled', now);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ reveals */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var targets = document.querySelectorAll('.reveal, .stagger');

  if (!reduceMotion.matches && 'IntersectionObserver' in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        io.unobserve(el);
        if (el.classList.contains('stagger')) {
          window.setTimeout(function () { el.classList.add('done'); }, 1200);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in', 'done'); });
  }

  /* --------------------------------------------------------- hero video
     The video plays on every screen, phones included. Only two things hold
     it back: a reduced-motion preference, or Data Saver being switched on.
     In both cases the poster carries the hero on its own. */
  var hero = document.querySelector('.hero');
  var video = hero && hero.querySelector('video[data-src-mp4]');

  var HOLD_BACK = ['(prefers-reduced-motion: reduce)']
    .map(function (q) { return window.matchMedia(q); });

  function saveData() {
    return !!(navigator.connection && navigator.connection.saveData);
  }

  var videoStarted = false;

  // Some browsers refuse muted autoplay anyway — iOS in Low Power Mode is the
  // common one. Rather than silently showing a still, offer the play.
  function offerPlayButton() {
    if (!hero || hero.querySelector('.hero__play')) return;
    var host = hero.querySelector('.hero__inner .wrap') || hero;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero__play';
    b.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.4v13.2L19 12z"/></svg>' +
      '<span>Play video</span>';
    b.addEventListener('click', function () {
      var p = video.play();
      if (p && p.then) {
        p.then(function () { hero.classList.add('video-ready'); b.remove(); })
         .catch(function () { /* leave the poster and the button in place */ });
      }
    });
    host.appendChild(b);
  }

  function loadHeroVideo() {
    if (videoStarted || !video) return;
    videoStarted = true;

    // WebM first (smaller, and the only format some Linux Chromium builds
    // ship), H.264 second for Safari and everything else.
    [['data-src-webm', 'video/webm'], ['data-src-mp4', 'video/mp4']].forEach(function (pair) {
      var url = video.getAttribute(pair[0]);
      if (!url) return;
      var source = document.createElement('source');
      source.src = url;
      source.type = pair[1];
      video.appendChild(source);
    });
    video.load();

    var play = function () {
      var p = video.play();
      if (p && p.then) {
        p.then(function () { hero.classList.add('video-ready'); })
         .catch(function () { offerPlayButton(); });
      } else {
        hero.classList.add('video-ready');
      }
    };

    if (video.readyState >= 3) { play(); }
    else { video.addEventListener('canplay', play, { once: true }); }

    // If no source can play, the poster image simply remains.
    video.addEventListener('error', function () {
      hero.classList.remove('video-ready');
    }, { once: true });
  }

  function applyHeroMode() {
    if (HOLD_BACK.some(function (m) { return m.matches; }) || saveData()) return;
    loadHeroVideo();
  }

  if (video) {
    HOLD_BACK.forEach(function (m) { m.addEventListener('change', applyHeroMode); });
    applyHeroMode();

    // Don't keep decoding off-screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!videoStarted) return;
          if (e.isIntersecting) { video.play().catch(function () {}); }
          else { video.pause(); }
        });
      }, { threshold: 0.01 }).observe(hero);
    }
  }

  /* --------------------------------------------------- pause on hidden tab */
  document.addEventListener('visibilitychange', function () {
    document.body.classList.toggle('paused', document.hidden);
    if (video && videoStarted) {
      if (document.hidden) { video.pause(); }
      else { video.play().catch(function () {}); }
    }
  });

  /* ------------------------------------------------------------- accordion */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* ------------------------------------------------------------- footer */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
