/* ============================================================
   KANVAS — split.js
   Word/char splitting, viewport reveals, stroke-draw measuring.
   No dependencies. Safe to run before GSAP.
   ============================================================ */
(function (global) {
  'use strict';

  var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- text split ---------- */
  function splitEl(el) {
    if (!el || el.dataset.splitDone) return;
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    var words = text.split(' ');
    var frag = document.createDocumentFragment();
    var i, w, wordEl, j, ch, chEl, n = 0;

    for (i = 0; i < words.length; i++) {
      wordEl = document.createElement('span');
      wordEl.className = 'word';
      for (j = 0; j < words[i].length; j++) {
        ch = words[i][j];
        chEl = document.createElement('span');
        chEl.className = 'ch';
        var inner = document.createElement('i');
        inner.textContent = ch;
        chEl.appendChild(inner);
        chEl.style.setProperty('--d', (n * 0.03).toFixed(3) + 's');
        inner.style.setProperty('--d', (n * 0.03).toFixed(3) + 's');
        wordEl.appendChild(chEl);
        n++;
      }
      frag.appendChild(wordEl);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    }
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.splitDone = '1';
  }

  function splitAll(root) {
    (root || document).querySelectorAll('[data-split]').forEach(splitEl);
  }

  /* ---------- stroke measuring ---------- */
  function measureDraw(root) {
    (root || document).querySelectorAll('.draw').forEach(function (p) {
      if (p.dataset.measured) return;
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) { len = 0; }
      if (!len || !isFinite(len)) len = 900;
      len = Math.ceil(len) + 4;
      p.style.setProperty('--len', len);
      p.dataset.measured = '1';
    });
  }

  /* ---------- observers ---------- */
  function observeReveal(root, onEnter) {
    var els = (root || document).querySelectorAll('[data-reveal], [data-split]');
    var draws = (root || document).querySelectorAll('.draw');

    if (REDUCED || !('IntersectionObserver' in global)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      draws.forEach(function (el) { el.classList.add('is-in'); });
      if (onEnter) els.forEach(onEnter);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (onEnter) onEnter(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    els.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io2.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.1 });
    draws.forEach(function (el) { io2.observe(el); });

    return io;
  }

  /* ---------- stagger helper: sets --d on sibling reveals ---------- */
  function stagger(root, sel, step) {
    var list = (root || document).querySelectorAll(sel);
    list.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * (step || 70), 560) + 'ms');
    });
  }

  global.Kanvas = global.Kanvas || {};
  global.Kanvas.split = { splitEl: splitEl, splitAll: splitAll, measureDraw: measureDraw, observeReveal: observeReveal, stagger: stagger, REDUCED: REDUCED };
})(window);
