/* =============================================================================
   UAA Agency — site behaviour
   1. The gate      : visitor picks a track before the site resolves
   2. Track state   : accent tokens + section visibility follow the choice
   3. Atmosphere    : reveals, header, marquee-safe motion
   4. Video         : hover-to-play cases, click-to-play reels, sound toggle
   5. Call demo     : the AI receptionist transcript, replayed on view
   6. Quote flow    : multi-step form, prefilled from the chosen track
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE = 'uaa.track';
  var TRACKS = ['web', 'ai', 'both'];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var holdHeaderUntil = 0;   // timestamp until which the header must stay put

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ===========================================================================
     FORM DELIVERY — paste your Formspree (or Netlify / n8n / Make) endpoint
     between the quotes below and both forms start posting to it. Leave it
     empty and they fall back to opening the visitor's own mail client.
     A data-endpoint attribute on an individual form overrides this.
     =========================================================================== */
  var FORM_ENDPOINT = '';

  /* Posts a brief to the endpoint, falling back to mail if anything goes wrong.
     fetch only rejects on network failure, so a 4xx/5xx has to be caught by
     hand — otherwise a rejected submission would still show "thank you". */
  function sendBrief(o) {
    var endpoint = o.form.dataset.endpoint || FORM_ENDPOINT;
    var btn = $('button[type=submit]', o.form);

    // a bot filled the hidden field: look successful, send nothing
    if (o.data.get('_gotcha')) { o.finish(); return; }

    var viaMail = function () { window.location.href = o.mail; o.finish(); };

    if (!endpoint) { viaMail(); return; }

    if (btn) { btn.disabled = true; btn.style.opacity = '.65'; }
    fetch(endpoint, {
      method: 'POST',
      body: o.data,
      headers: { 'Accept': 'application/json' }   // keeps Formspree on JSON, not a redirect
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        o.finish();
      })
      .catch(viaMail)
      .then(function () { if (btn) { btn.disabled = false; btn.style.opacity = ''; } });
  }

  /* ---------------------------------------------------------------- 1. gate */
  var gate = $('#gate');

  function readTrack() {
    var q = new URLSearchParams(location.search).get('track');
    if (TRACKS.indexOf(q) > -1) return q;
    try {
      var s = localStorage.getItem(STORE);
      if (TRACKS.indexOf(s) > -1) return s;
    } catch (e) {}
    return null;
  }

  function setTrack(track, opts) {
    if (TRACKS.indexOf(track) < 0) return;
    opts = opts || {};
    root.setAttribute('data-track', track);
    try { localStorage.setItem(STORE, track); } catch (e) {}

    $$('.switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.track === track));
    });

    // keep the quote form honest about what the visitor actually wants
    var need = $('#q-need');
    if (need) need.value = track;
    $$('[data-need-pill] input').forEach(function (i) { i.checked = i.value === track; });

    // pause any hero video that is now hidden, play the one that is showing
    $$('video[data-track-video]').forEach(function (v) {
      var visible = v.closest('[data-show]') === null ||
        v.closest('[data-show]').offsetParent !== null;
      if (visible) { safePlay(v); } else { v.pause(); }
    });

    if (opts.scroll) {
      var target = $('#' + (track === 'ai' ? 'receptionist' : 'websites'));
      if (target) {
        // The switcher lives in the header, so don't let the scroll it triggers
        // auto-hide the header out from under the visitor's cursor.
        holdHeaderUntil = Date.now() + 1600;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    }
    // reveal anything that just became visible
    setTimeout(sweepReveals, 60);
  }

  var gateTimer = null;

  function openGate() {
    if (!gate) return;
    window.clearTimeout(gateTimer);
    gate.hidden = false;
    // let the browser register the un-hidden element before transitioning in
    window.requestAnimationFrame(function () { root.classList.add('is-gated'); });
    var v = $('video', gate);
    if (v) safePlay(v);
    var inner = $('.gate__inner', gate);   // focus the panel, not the first card,
    if (inner) inner.focus();              // so no card wears a stray focus ring
  }

  function closeGate() {
    if (!gate) return;
    root.classList.remove('is-gated');
    gateTimer = window.setTimeout(function () {
      gate.hidden = true;
      var v = $('video', gate);
      if (v) v.pause();
    }, 700);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && gate && !gate.hidden && root.classList.contains('is-gated')) {
      if (!readTrack()) setTrack('both');
      closeGate();
    }
  });

  $$('.choice').forEach(function (card) {
    card.addEventListener('click', function () {
      setTrack(card.dataset.choice);
      closeGate();
    });
  });

  var skip = $('#gate-skip');
  if (skip) skip.addEventListener('click', function () { setTrack('both'); closeGate(); });

  $$('.switch button').forEach(function (b) {
    b.addEventListener('click', function () { setTrack(b.dataset.track, { scroll: true }); });
  });

  $$('[data-reopen-gate]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openGate(); });
  });

  var saved = readTrack();
  if (saved) {
    setTrack(saved);
    if (gate) gate.hidden = true;
  } else {
    root.setAttribute('data-track', 'both'); // sane tokens behind the overlay
    openGate();
  }

  /* ----------------------------------------------------------- 2. header */
  var hdr = $('.hdr');
  var nav = $('#nav');
  var burger = $('#burger');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle('is-stuck', y > 24);
      hdr.classList.toggle('is-hidden',
        y > 420 && y > lastY &&
        Date.now() > holdHeaderUntil &&
        !(nav && nav.classList.contains('on')));
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('on');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('on');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------- 3. reveals */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  function sweepReveals() {
    $$('.rv:not(.in)').forEach(function (el) {
      if (!io) { el.classList.add('in'); return; }
      if (el.offsetParent === null) return;            // hidden by the track filter
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { el.classList.add('in'); }
      else { io.observe(el); }
    });
  }
  sweepReveals();

  /* ------------------------------------------------------------ 4. video */
  function safePlay(v) {
    if (!v) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stands in */ });
  }

  // ambient background videos
  $$('video[data-ambient]').forEach(function (v) { safePlay(v); });

  // hover / focus to play, with the poster underneath
  $$('[data-hoverplay]').forEach(function (card) {
    var v = $('video', card);
    if (!v) return;
    var start = function () { card.classList.add('is-playing'); safePlay(v); };
    var stop = function () { card.classList.remove('is-playing'); v.pause(); v.currentTime = 0; };
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focusin', start);
    card.addEventListener('focusout', stop);
    // touch: tap plays, tap again stops
    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-sound]')) return;
      if (window.matchMedia('(hover: hover)').matches) return;
      card.classList.contains('is-playing') ? stop() : start();
    });
  });

  // sound toggle on the reels
  $$('[data-sound]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = btn.closest('.reel');
      var v = $('video', card);
      if (!v) return;
      var on = v.muted;                       // about to turn sound ON
      if (on) {
        $$('.reel video').forEach(function (o) { if (o !== v) { o.muted = true; } });
        $$('[data-sound]').forEach(function (o) { if (o !== btn) o.setAttribute('aria-pressed', 'false'); });
        card.classList.add('is-playing');
        safePlay(v);
      }
      v.muted = !on;
      btn.setAttribute('aria-pressed', String(on));
      $('.ic-on', btn).hidden = !on;
      $('.ic-off', btn).hidden = on;
    });
  });

  /* -------------------------------------------------- 5. AI call demo */
  var callBody = $('#call-body');
  var SCRIPT = [
    ['them', 'Caller', 'Hi, do you guys still do same-day callouts in Summerstrand?'],
    ['ai', 'UAA Receptionist', 'We do — Summerstrand is inside our same-day zone. I can hold a slot for you now. Is this for a repair or a new install?'],
    ['them', 'Caller', 'Repair. The geyser is leaking.'],
    ['ai', 'UAA Receptionist', 'Got it. I have 14:30 or 16:00 today. Which suits you?'],
    ['them', 'Caller', 'Half two works.'],
    ['ai', 'UAA Receptionist', "Booked for 14:30. I've sent the confirmation by SMS, added it to the team calendar, and flagged it as urgent. Anything else?"],
    ['them', 'Caller', "No, that's great. Thanks."]
  ];

  function typeLine(i) {
    if (!callBody || i >= SCRIPT.length) {
      if (callBody) window.setTimeout(function () { callBody.dataset.done = '1'; }, 400);
      return;
    }
    var row = SCRIPT[i];
    var el = document.createElement('div');
    el.className = 'msg msg--' + (row[0] === 'ai' ? 'ai' : 'them');
    el.innerHTML = '<span class="msg__who"></span>';
    $('.msg__who', el).textContent = row[1];
    el.appendChild(document.createTextNode(row[2]));
    callBody.appendChild(el);
    callBody.scrollTop = callBody.scrollHeight;
    window.setTimeout(function () { typeLine(i + 1); }, reduced ? 220 : 1150 + row[2].length * 9);
  }

  if (callBody) {
    if (reduced || !('IntersectionObserver' in window)) {
      SCRIPT.forEach(function (row) {
        var el = document.createElement('div');
        el.className = 'msg msg--' + (row[0] === 'ai' ? 'ai' : 'them');
        el.style.animation = 'none';
        el.style.opacity = 1;
        el.innerHTML = '<span class="msg__who"></span>';
        $('.msg__who', el).textContent = row[1];
        el.appendChild(document.createTextNode(row[2]));
        callBody.appendChild(el);
      });
    } else {
      var callIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !callBody.dataset.started) {
          callBody.dataset.started = '1';
          typeLine(0);
          callIO.disconnect();
        }
      }, { threshold: 0.3 });
      callIO.observe(callBody);
    }
    // running call timer
    var t0 = Date.now();
    var timer = $('#call-timer');
    if (timer) window.setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000) % 600;
      timer.textContent = '0' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }, 1000);
  }

  /* --------------------------------------------------------- 6. quote flow */
  var form = $('#quote-form');
  if (form) {
    var steps = $$('.stepq', form);
    var bars = $$('.prog i', form);
    var done = $('#quote-done');
    var at = 0;

    function paint() {
      steps.forEach(function (s, i) { s.classList.toggle('on', i === at); });
      bars.forEach(function (b, i) { b.classList.toggle('on', i <= at); });
      var first = steps[at] ? $('input,select,textarea', steps[at]) : null;
      if (first && at > 0) first.focus({ preventScroll: true });
    }

    function valid(i) {
      var ok = true;
      $$('[required]', steps[i]).forEach(function (f) {
        if (!f.checkValidity()) { f.reportValidity(); ok = false; }
      });
      return ok;
    }

    $$('[data-next]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!valid(at)) return;
        at = Math.min(at + 1, steps.length - 1);
        paint();
      });
    });
    $$('[data-back]', form).forEach(function (b) {
      b.addEventListener('click', function () { at = Math.max(at - 1, 0); paint(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(at)) return;

      var d = new FormData(form);
      var need = d.get('need') || root.getAttribute('data-track') || 'both';
      var label = { web: 'Website build', ai: 'AI receptionist', both: 'Website + AI receptionist' }[need] || need;

      var body = [
        'New quote request — UAA Agency', '',
        'Looking for: ' + label,
        'Plan clicked: ' + (d.get('plan') || '—'),
        'Business: ' + (d.get('business') || '—'),
        'Industry: ' + (d.get('industry') || '—'),
        'Current site: ' + (d.get('site') || '—'),
        'Budget: ' + (d.get('budget') || '—'),
        'Timeline: ' + (d.get('timeline') || '—'), '',
        'Name: ' + (d.get('name') || '—'),
        'Email: ' + (d.get('_replyto') || '—'),
        'Phone: ' + (d.get('phone') || '—'), '',
        'Brief:', (d.get('brief') || '—')
      ].join('\n');

      var subject = 'Website enquiry — ' + (d.get('business') || 'New enquiry');
      d.set('_subject', subject);

      sendBrief({
        form: form,
        data: d,
        mail: mailto(body, subject),
        finish: function () {
          steps.forEach(function (s) { s.classList.remove('on'); });
          bars.forEach(function (b) { b.classList.add('on'); });
          if (done) done.classList.add('on');
        }
      });
    });

    function mailto(body, subject) {
      return 'mailto:' + (form.dataset.mailto || 'usenathisigidi0@gmail.com') +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    // jumping to the form from a pricing tier pre-selects the right need
    $$('[data-quote-need]').forEach(function (a) {
      a.addEventListener('click', function () {
        var n = a.dataset.quoteNeed;
        var need = $('#q-need');
        if (need) need.value = n;
        $$('[data-need-pill] input').forEach(function (i) { i.checked = i.value === n; });
        var plan = $('#q-plan');
        if (plan) plan.value = a.dataset.planName || '';
        at = 1; paint();
      });
    });

    paint();
  }

  /* ------------------------------- 7. monthly plan comparison toggle */
  var planToggle = $('#plantoggle');
  var planWrap = $('#planwrap');
  if (planToggle && planWrap) {
    $$('button', planToggle).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', planToggle).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        planWrap.setAttribute('data-emph', b.dataset.emph);
      });
    });
  }

  /* --------------------------------------------- 8. the quote dialog */
  var qm = $('#quote-modal');
  if (qm) {
    var qmForm = $('#qm-form');
    var qmWrap = $('#qm-form-wrap');
    var qmDone = $('#qm-done');
    var qmPanel = $('#qm-panel');
    var qmProject = $('#qm-project');
    var lastFocus = null;
    var qmTimer = null;

    function openQuote(project) {
      window.clearTimeout(qmTimer);
      lastFocus = document.activeElement;
      qm.hidden = false;
      if (qmProject && project) {
        // the option list is fixed, so only set a value that exists
        var match = $$('option', qmProject).filter(function (o) { return o.value === project || o.textContent === project; })[0];
        if (match) qmProject.value = match.value || match.textContent;
      }
      window.requestAnimationFrame(function () {
        qm.classList.add('on');
        root.classList.add('is-locked');      // scroll lock, distinct from the gate's
        if (qmPanel) qmPanel.focus();
      });
    }

    function closeQuote() {
      qm.classList.remove('on');
      root.classList.remove('is-locked');
      qmTimer = window.setTimeout(function () { qm.hidden = true; }, 420);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('[data-open-quote]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        openQuote(b.dataset.openQuote);
      });
    });

    $('#qm-close').addEventListener('click', closeQuote);
    var doneClose = $('#qm-done-close');
    if (doneClose) doneClose.addEventListener('click', closeQuote);

    // click the backdrop, not the panel, to dismiss
    qm.addEventListener('mousedown', function (e) { if (e.target === qm) closeQuote(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && qm.classList.contains('on')) closeQuote();
    });

    qmForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('[required]', qmForm).filter(function (f) { return !f.checkValidity(); })[0];
      if (bad) { bad.reportValidity(); return; }

      var d = new FormData(qmForm);
      var body = [
        'Quote request — UAA Agency', '',
        'Project type: ' + (d.get('project') || '—'),
        'Budget: ' + (d.get('budget') || '—'),
        'Timeline: ' + (d.get('timeline') || '—'), '',
        'Name: ' + (d.get('name') || '—'),
        'Business: ' + (d.get('business') || '—'),
        'Email: ' + (d.get('_replyto') || '—'),
        'Phone / WhatsApp: ' + (d.get('phone') || '—'), '',
        'About the project:', (d.get('brief') || '—')
      ].join('\n');

      var subject = 'Quote request — ' + (d.get('project') || 'Project') +
        ' — ' + (d.get('business') || 'New enquiry');
      d.set('_subject', subject);

      sendBrief({
        form: qmForm,
        data: d,
        mail: 'mailto:' + (qmForm.dataset.mailto || 'usenathisigidi0@gmail.com') +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body),
        finish: function () {
          if (qmWrap) qmWrap.hidden = true;
          if (qmDone) qmDone.classList.add('on');
        }
      });
    });
  }

  /* year in footer */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
