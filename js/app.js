/* ============================================================
   KANVAS — app.js
   Loader · router · smooth scroll · nav · menu · choreography
   ============================================================ */
(function () {
  'use strict';

  var S = Kanvas.split;
  var REDUCED = S.REDUCED;
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  var route = 'home';

  /* ============================================================
     1. SMOOTH SCROLL
     ============================================================ */
  function initLenis() {
    if (REDUCED || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    Kanvas.lenis = lenis;

    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  function scrollToY(y, opts) {
    opts = opts || {};
    if (lenis) lenis.scrollTo(y, { duration: opts.duration || 0.95, offset: opts.offset || 0 });
    else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
  }

  Kanvas.refreshScroll = function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (lenis) lenis.resize();
  };

  /* ============================================================
     2. LOADER
     ============================================================ */
  function runLoader(done) {
    var loader = document.getElementById('loader');
    var fill = document.getElementById('loaderFill');
    var pct = document.getElementById('loaderPct');
    var nib = document.getElementById('loaderNib');

    if (REDUCED) {
      loader.classList.add('is-done');
      document.body.removeAttribute('data-loading');
      done();
      return;
    }

    var start = performance.now();
    var DUR = 1650;
    var shown = 0;

    function frame(now) {
      var t = Math.min(1, (now - start) / DUR);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = Math.round(eased * 100);
      if (v !== shown) {
        shown = v;
        fill.style.width = v + '%';
        nib.style.left = v + '%';
        pct.textContent = v;
      }
      if (t < 1) requestAnimationFrame(frame);
      else exit();
    }

    function exit() {
      fill.style.width = '100%';
      nib.style.left = '100%';
      pct.textContent = '100';
      setTimeout(function () {
        loader.classList.add('is-exiting');
        setTimeout(function () {
          loader.classList.add('is-done');
          document.body.removeAttribute('data-loading');
          done();
        }, 640);
      }, 180);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     3. ROUTER
     ============================================================ */
  function parseRoute() {
    var h = location.hash || '';
    if (h === '#/docs') return 'docs';
    if (h === '#/board') return 'board';
    return 'home';
  }

  /* only ever query real id anchors (#features, #contact …), never routes (#/docs) */
  function qs(sel) {
    if (typeof sel !== 'string' || !/^#[A-Za-z][\w\-.:]*$/.test(sel)) return null;
    try { return document.querySelector(sel); } catch (e) { return null; }
  }

  function applyRoute(initial) {
    var next = parseRoute();
    var changed = next !== route;
    route = next;
    document.body.dataset.route = route;

    ['home', 'docs', 'board'].forEach(function (r) {
      var v = document.getElementById('view-' + r);
      if (v) v.hidden = (r !== route);
    });

    if (route === 'docs') {
      Kanvas.docs.init();
      Kanvas.showcase.init();
    }
    if (route === 'board') {
      if (window.KanvasBoard) KanvasBoard.init();
      if (lenis) lenis.stop();
    } else if (lenis) lenis.start();

    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (st) { st.refresh(); });

    if (!initial) {
      var h = location.hash;
      if (route === 'home' && h && h !== '#/docs' && h !== '#/board' && h !== '#') {
        var target = qs(h);
        if (target) {
          requestAnimationFrame(function () {
            var top = target.getBoundingClientRect().top + window.scrollY - (document.getElementById('nav').offsetHeight + 8);
            scrollToY(top, { duration: 1 });
          });
        } else if (h !== '#/') {
          if (lenis) lenis.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
        }
      } else {
        if (lenis) lenis.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      }
    } else if (route === 'docs' && location.hash === '#/docs') {
      window.scrollTo(0, 0);
    }

    if (changed && route !== 'home') closeMenu();
    requestAnimationFrame(function () { Kanvas.refreshScroll(); });
  }

  window.addEventListener('hashchange', function () { applyRoute(false); });

  /* ============================================================
     4. NAV
     ============================================================ */
  var lastY = 0;
  var navEl, progressEl, chipEl, chipText;

  function initNav() {
    navEl = document.getElementById('nav');
    progressEl = document.getElementById('navProgress');
    chipEl = document.getElementById('navChip');
    chipText = chipEl ? chipEl.textContent : '';

    var raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var y = window.scrollY;
        var doc = document.documentElement;
        var max = Math.max(1, doc.scrollHeight - window.innerHeight);
        var p = Math.min(1, y / max);

        if (progressEl) progressEl.style.width = (p * 100).toFixed(2) + '%';
        navEl.classList.toggle('is-stuck', y > 24);

        if (!document.getElementById('menu').classList.contains('is-open')) {
          var down = y > lastY && y > 220;
          if (down !== navEl.classList.contains('is-hidden')) navEl.classList.toggle('is-hidden', down);
        }
        lastY = y;
        updateRail(p);
        updateChip();
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* scroll velocity → brand squash & stretch (the "trick") */
    if (!REDUCED && hasGSAP) {
      var word = navEl.querySelector('.brand__word');
      var last = window.scrollY, vel = 0;
      gsap.ticker.add(function () {
        var y = window.scrollY;
        vel += ((y - last) - vel) * 0.16;
        last = y;
        var s = gsap.utils.clamp(-0.26, 0.5, vel * 0.02);
        if (word) word.style.transform = 'scaleY(' + (1 + Math.abs(s) * 0.55) + ') scaleX(' + (1 - Math.abs(s) * 0.16) + ')';
      });
    }
  }

  function updateChip() {
    if (!chipEl) return;
    var navH = navEl.offsetHeight + 60;
    var best = null;
    document.querySelectorAll('[data-chip]').forEach(function (sec) {
      if (sec.offsetParent === null || sec.offsetParent === undefined) return;
      var r = sec.getBoundingClientRect();
      if (r.top <= navH && r.bottom > navH) best = sec.dataset.chip;
    });
    if (!best) best = route === 'docs' ? 'Documentation' : route === 'board' ? 'Whiteboard' : 'Think. Draw. Create.';
    if (best === chipText) return;
    chipText = best;
    if (hasGSAP && !REDUCED) {
      gsap.to(chipEl, {
        yPercent: -110, opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: function () {
          chipEl.textContent = best;
          gsap.fromTo(chipEl, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.32, ease: 'back.out(2)' });
        }
      });
    } else chipEl.textContent = best;
  }

  /* ---------- scroll pen rail ---------- */
  var railPath, railNib, railLen = 0;
  function initRail() {
    railPath = document.getElementById('railPath');
    railNib = document.getElementById('railNib');
    if (!railPath) return;
    try { railLen = railPath.getTotalLength(); } catch (e) { railLen = 1200; }
    railPath.style.strokeDasharray = railLen;
    railPath.style.strokeDashoffset = railLen;
    updateRail(0);
  }
  function updateRail(p) {
    if (!railPath) return;
    railPath.style.strokeDashoffset = railLen * (1 - p);
    if (railNib && railLen) {
      try {
        var pt = railPath.getPointAtLength(railLen * p);
        railNib.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
        railNib.style.opacity = p > 0.01 && p < 0.995 ? '1' : '0';
      } catch (e) {}
    }
  }

  /* ============================================================
     5. MENU
     ============================================================ */
  var menu, menuBtn, lastFocus = null;

  function openMenu() {
    menu.hidden = false;
    void menu.offsetWidth;
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();
    var links = menu.querySelectorAll('.menu__link');
    if (hasGSAP && !REDUCED) {
      gsap.fromTo(links, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.16, ease: 'power3.out' });
      gsap.fromTo('.menu__aside > *', { x: 34, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, stagger: 0.08, delay: 0.3, ease: 'power3.out' });
    }
    lastFocus = document.activeElement;
    setTimeout(function () { var f = menu.querySelector('.menu__link'); if (f) f.focus(); }, 380);
  }

  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (lenis && route !== 'board') lenis.start();
    setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 760);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initMenu() {
    menu = document.getElementById('menu');
    menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', function () {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    document.getElementById('menuClose').addEventListener('click', closeMenu);
    menu.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-link]')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); closePrefs(); }
    });
    /* focus trap */
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.slice.call(menu.querySelectorAll('a,button')).filter(function (n) { return !n.disabled; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ============================================================
     6. ANCHOR LINKS (lenis-driven)
     ============================================================ */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.indexOf('#/') === 0) return;

      if (route !== 'home') {
        location.hash = href;
        e.preventDefault();
        return;
      }
      var target = qs(href);
      if (!target) return;
      e.preventDefault();
      if (history.pushState) history.pushState(null, '', href);
      else location.hash = href;
      var top = target.getBoundingClientRect().top + window.scrollY - (navEl.offsetHeight + 6);
      scrollToY(top);
      closeMenu();
    });
  }

  /* ============================================================
     7. MAGNETIC BUTTONS
     ============================================================ */
  function initMagnet() {
    if (REDUCED || !hasGSAP || window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.22);
        qy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  /* ============================================================
     8. CHOREOGRAPHY (GSAP scroll scenes)
     ============================================================ */
  function initScenes() {
    if (!hasGSAP || !window.ScrollTrigger || REDUCED) return;

    /* hero parallax floats */
    gsap.to('.hero__float--a', { yPercent: -26, rotate: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
    gsap.to('.hero__float--b', { yPercent: 34, rotate: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9 } });
    gsap.to('.hero__title', { yPercent: -14, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: 0.5 } });

    /* headline underline draws on load, re-draws on scroll */
    var ul = document.querySelector('.hero__underline');
    if (ul) gsap.fromTo(ul, { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.1, delay: 1.05, ease: 'power3.out' });

    var arrow = document.querySelector('.hero__arrow');
    if (arrow) gsap.fromTo(arrow, { opacity: 0, y: 34, rotate: -18 },
      { opacity: 1, y: 0, rotate: 4, duration: 0.9, delay: 1.3, ease: 'back.out(1.7)' });

    /* problem title: each line slides in with a slight rotation */
    gsap.from('.problem__title .l, .problem__title .sticker', {
      yPercent: 118, opacity: 0, rotate: 5, duration: 0.9, stagger: 0.09, ease: 'power4.out',
      scrollTrigger: { trigger: '.problem__title', start: 'top 82%' }
    });
    gsap.from('.problem__squiggle', {
      scale: 0.4, rotate: -30, opacity: 0, duration: 0.8, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.problem__head', start: 'top 78%' }
    });

    /* problem cards: cascade + subtle scrub rotation */
    gsap.from('.pcard', {
      y: 70, opacity: 0, rotate: function (i) { return i % 2 ? 3 : -3; },
      duration: 0.75, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.problem__grid', start: 'top 85%' }
    });

    /* about: marker wipe + brand scale */
    gsap.from('.about__kicker span', {
      scale: 0.3, rotate: -22, opacity: 0, duration: 0.8, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: '.about', start: 'top 74%' }
    });
    gsap.fromTo('.about__mark span', { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power3.inOut', delay: 0.35,
        scrollTrigger: { trigger: '.about', start: 'top 74%' } });
    gsap.from('.fcard', {
      y: 60, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: '.about__cards', start: 'top 88%' }
    });
    gsap.from('.about__demo', {
      y: 80, opacity: 0, rotate: -1.4, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.about__demo', start: 'top 88%' }
    });

    /* journey — pinned horizontal scrub (the brain-trick) */
    var track = document.getElementById('journeyTrack');
    var mq = window.matchMedia('(min-width: 901px)');
    if (track && mq.matches) {
      var distance = function () {
        return Math.max(0, track.scrollWidth - window.innerWidth + 64);
      };
      gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey',
          start: 'top top',
          end: function () { return '+=' + (distance() + window.innerHeight * 0.6); },
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: function (self) {
            var m = document.getElementById('journeyMeter');
            if (m) m.style.width = (self.progress * 100).toFixed(1) + '%';
          }
        }
      });
      gsap.from('.jstep', {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: '.journey', start: 'top 70%' }
      });
    }

    /* showcase cards */
    gsap.from('.showcase__title > span', {
      yPercent: 110, opacity: 0, duration: 0.85, stagger: 0.09, ease: 'power4.out',
      scrollTrigger: { trigger: '.showcase__head', start: 'top 84%' }
    });

    /* cta title */
    gsap.from('.cta__title .ch > i', {
      yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.028, ease: 'power4.out',
      scrollTrigger: { trigger: '.cta', start: 'top 80%' }
    });
    gsap.from('.cta__doodle', {
      rotate: -40, scale: 0.5, opacity: 0, duration: 0.9, ease: 'back.out(1.9)',
      scrollTrigger: { trigger: '.cta', start: 'top 78%' }
    });

    /* footer links */
    gsap.from('.foot__nav a', {
      x: -26, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: '.foot', start: 'top 88%' }
    });

    ScrollTrigger.refresh();
  }

  /* ---------- single marquee, speed reacts to scroll ---------- */
  function initMarquee() {
    var t = document.getElementById('stripTrack');
    if (!t || !hasGSAP || REDUCED) return;
    var total = t.scrollWidth / 3;
    var tween = gsap.to(t, { x: -total, duration: 18, ease: 'none', repeat: -1 });
    if (window.ScrollTrigger) {
      var vel = 0;
      gsap.ticker.add(function () { tween.timeScale(gsap.utils.clamp(0.4, 3.4, 1 + Math.abs(vel) * 0.05)); vel *= 0.9; });
      window.addEventListener('scroll', function () { vel = 4; }, { passive: true });
    }
  }

  /* ============================================================
     9. COOKIE CONSENT
     ============================================================ */
  var KEY = 'kanvas-cookie-consent';
  function closePrefs() {
    var p = document.getElementById('prefsOverlay');
    if (p) p.hidden = true;
  }
  function initCookie() {
    var bar = document.getElementById('cookieBar');
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!saved || !saved.choice) bar.hidden = false;

    function store(v) {
      try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
      bar.hidden = true;
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      var k = b.dataset.cookie;
      if (k === 'accept') store({ choice: 'accept_all', timestamp: Date.now() });
      else if (k === 'reject') store({ choice: 'reject_non_essential', timestamp: Date.now() });
      else document.getElementById('prefsOverlay').hidden = false;
    });
    var ov = document.getElementById('prefsOverlay');
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closePrefs();
      if (e.target.closest('[data-pref-cancel]')) closePrefs();
      if (e.target.closest('[data-pref-save]')) {
        store({ choice: 'manage', preferences: {
          analytics: !!ov.querySelector('[data-pref="analytics"]').checked,
          marketing: !!ov.querySelector('[data-pref="marketing"]').checked
        }, timestamp: Date.now() });
      }
    });
  }

  /* ============================================================
     10. BOOT
     ============================================================ */
  function boot() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    S.splitAll(document);
    S.measureDraw(document);
    initNav();
    initRail();
    initMenu();
    initAnchors();
    initCookie();

    Kanvas.showcase.init();
    Kanvas.mini.init();

    initLenis();
    applyRoute(true);

    runLoader(function () {
      S.stagger(document, '.problem__grid .pcard', 90);
      S.stagger(document, '.about__cards .fcard', 80);
      S.stagger(document, '.showcase__grid .gcard', 80);
      S.stagger(document, '.cta__title', 0);
      S.observeReveal(document);
      initMagnet();
      initScenes();
      initMarquee();
      updateChip();
      Kanvas.refreshScroll();
    });

    window.addEventListener('resize', function () {
      clearTimeout(window.__rz);
      window.__rz = setTimeout(function () { Kanvas.refreshScroll(); updateRail(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)); }, 180);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  Kanvas.app = { closeMenu: closeMenu, closePrefs: closePrefs, scrollToY: scrollToY };
})();
