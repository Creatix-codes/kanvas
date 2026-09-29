/* ============================================================
   KANVAS — docs.js  (renders #/docs)
   ============================================================ */
(function () {
  'use strict';
  var D = window.DOCS, DG = Kanvas.diagram, S = Kanvas.split;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------------- block renderers ---------------- */
  function listHtml(list) {
    return '<ul class="doc-editorial-list">' + list.map(function (it) {
      return '<li><strong>' + esc(it[0]) + '</strong>' + esc(it[1]) + '</li>';
    }).join('') + '</ul>';
  }

  function renderEditorial(b) {
    return '<div class="doc-editorial' + (b.reversed ? ' doc-editorial--reversed' : '') + '" data-reveal>' +
      '<div class="doc-editorial-visual">' + DG.illust(b.visual) + '</div>' +
      '<div class="doc-editorial-text">' +
        '<span class="doc-editorial-label">' + esc(b.label) + '</span>' +
        '<h3 class="doc-editorial-heading">' + esc(b.heading) + '</h3>' +
        listHtml(b.list) +
      '</div></div>';
  }

  function renderAction(b) {
    return '<div class="doc-action-demo" data-reveal>' +
      '<div class="doc-action-demo-step"><span class="doc-action-demo-badge">' + esc(b.action.badge) + '</span>' +
        '<div class="doc-action-demo-canvas">' + DG.art(b.action.art) + '</div>' +
        '<p class="doc-action-demo-caption">' + esc(b.action.caption) + '</p></div>' +
      '<div class="doc-action-demo-arrow"><i class="ph ph-arrow-right"></i></div>' +
      '<div class="doc-action-demo-step"><span class="doc-action-demo-badge">' + esc(b.result.badge) + '</span>' +
        '<div class="doc-action-demo-canvas">' + DG.art(b.result.art) + '</div>' +
        '<p class="doc-action-demo-caption">' + esc(b.result.caption) + '</p></div>' +
    '</div>';
  }

  function renderSteps(b) {
    return '<ol class="doc-steps" data-reveal>' + b.items.map(function (it) {
      return '<li><span><b>' + esc(it[0]) + '</b>' + esc(it[1]) + '</span></li>';
    }).join('') + '</ol>';
  }

  function renderWorkflow(b) {
    return '<div class="doc-workflow-board">' + b.items.map(function (s) {
      return '<div class="doc-workflow-step" style="--wf-color:' + s.color + '" data-reveal>' +
        '<span class="doc-workflow-num">' + s.num + '</span>' +
        '<h3 class="doc-workflow-heading">' + esc(s.title) + '</h3>' +
        '<p class="doc-workflow-desc">' + esc(s.desc) + '</p></div>';
    }).join('') + '</div>';
  }

  function renderTools(b) {
    return '<div class="doc-tool-strip" data-reveal>' + b.items.map(function (t) {
      return '<span class="doc-tool-chip" title="' + esc(t.desc) + '"><i class="ph ph-' + t.icon + '"></i>' +
        esc(t.name) + '<kbd>' + t.key + '</kbd></span>';
    }).join('') + '</div>';
  }

  function renderStats(b) {
    return '<div class="doc-stats" data-reveal>' + b.items.map(function (s) {
      return '<span class="doc-stat"><i class="ph ph-' + s.icon + '"></i>' + esc(s.label) + '</span>';
    }).join('') + '</div>';
  }

  function renderCards(b) {
    return '<div class="doc-cards">' + b.items.map(function (c) {
      return '<article class="doc-card" data-reveal><span class="doc-card__ic"><i class="ph ph-' + c.icon + '"></i></span>' +
        '<h4>' + esc(c.title) + '</h4><p>' + esc(c.desc) + '</p></article>';
    }).join('') + '</div>';
  }

  function renderShortcuts(b) {
    return '<div class="doc-shortcut-grid" data-reveal>' + b.items.map(function (g) {
      return '<div class="doc-shortcut-section"><h3 class="doc-shortcut-heading">' + esc(g.title) + '</h3>' +
        g.rows.map(function (r) {
          return '<div class="doc-shortcut-row"><span class="doc-shortcut-keys">' +
            r.keys.map(function (k, i) {
              var mod = (k === 'Ctrl' || k === 'Shift' || k === 'Alt' || k === 'Cmd');
              return (i ? '<span class="doc-shortcut-sep">+</span>' : '') +
                '<kbd class="doc-shortcut-kbd' + (mod ? ' is-modifier' : '') + '">' + esc(k) + '</kbd>';
            }).join('') + '</span><span class="doc-shortcut-action">' + esc(r.action) + '</span></div>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }

  function renderTips(b) {
    return '<div class="doc-tips">' + b.items.map(function (t) {
      return '<article class="doc-tip" data-reveal><h4><i class="ph ph-' + t.icon + '"></i>' + esc(t.title) + '</h4>' +
        '<p>' + esc(t.desc) + '</p></article>';
    }).join('') + '</div>';
  }

  function renderGallery(b) {
    return '<div class="doc-gallery">' + b.items.map(function (g) {
      return '<article class="doc-gallery-item" data-reveal>' +
        '<div class="doc-gallery-art">' + DG.gallery(g.kind) + '</div>' +
        '<div class="doc-gallery-cap"><span>' + esc(g.tag) + '</span><h3>' + esc(g.title) + '</h3>' +
        '<p>' + esc(g.desc) + '</p></div></article>';
    }).join('') + '</div>';
  }

  function renderFaq(b) {
    return '<div class="doc-faq-list" data-reveal>' + b.items.map(function (f, i) {
      var n = String(i + 1).padStart(2, '0');
      return '<div class="doc-faq-item">' +
        '<button class="doc-faq-question" type="button" aria-expanded="false">' +
          '<span class="doc-faq-num">' + n + '</span><span class="doc-faq-dot"></span>' +
          '<span class="doc-faq-qtext">' + esc(f.q) + '</span>' +
          '<span class="doc-faq-chevron"><i class="ph ph-caret-down"></i></span>' +
        '</button>' +
        '<div class="doc-faq-answer-wrap"><div class="doc-faq-answer"><p>' + esc(f.a) + '</p></div></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderEnd() {
    return '<div class="docs__end" data-reveal>' +
      '<h2>Ready to create?</h2>' +
      '<p>Open Kanvas and start turning your ideas into something visual.</p>' +
      '<a class="btn btn--ink" href="#/board">START DRAWING <i class="ph ph-arrow-right"></i></a></div>';
  }

  function renderToolCanvas() {
    return '<div class="doc-tool-showcase" data-reveal>' +
      '<div class="doc-tool-showcase-toolbar">' +
        ['cursor', 'hand', 'square', 'circle', 'diamond', 'arrow-up-right', 'pencil-simple', 'text-aa', 'eraser', 'fire']
          .map(function (ic, i) {
            return '<span class="tool' + (i === 2 ? ' is-active' : '') + '"><i class="ph ph-' + ic + '"></i></span>';
          }).join('') +
      '</div>' +
      '<div class="doc-tool-showcase-canvas">' + DG.art('toolCanvas') + '</div></div>';
  }

  function renderHistory() {
    return '<div class="doc-action-demo" data-reveal>' +
      '<div class="doc-action-demo-step"><span class="doc-action-demo-badge">Before</span>' +
        '<div class="doc-action-demo-canvas">' + DG.art('historyBefore') + '</div>' +
        '<p class="doc-action-demo-caption">Moved, deleted and added — nothing is permanent.</p></div>' +
      '<div class="doc-action-demo-arrow"><i class="ph ph-arrow-right"></i></div>' +
      '<div class="doc-action-demo-step"><span class="doc-action-demo-badge">After</span>' +
        '<div class="doc-action-demo-canvas">' + DG.art('historyAfter') + '</div>' +
        '<p class="doc-action-demo-caption">Restored and redone with a single keystroke.</p></div></div>';
  }

  function renderShapeTry() {
    var colors = ['#a5e5fa', '#fcee6b', '#35c46b', '#f0a8c0', '#c9b8ff', '#0d1d1e'];
    var fills = ['none', '#a5e5fa', '#fcee6b', '#35c46b', '#ffffff'];
    return '<div class="doc-demo" data-reveal>' +
      '<div class="doc-demo-label">Try it yourself</div>' +
      '<div class="shape-try" style="display:grid;grid-template-columns:1fr auto;gap:0;min-height:260px">' +
        '<div class="shape-try__canvas" style="position:relative;background:#fff;background-image:radial-gradient(rgba(13,29,30,.2) 1.1px,transparent 1.2px);background-size:22px 22px">' +
          '<svg viewBox="0 0 520 300" style="position:absolute;inset:0;width:100%;height:100%" data-shape-try>' +
            '<rect data-shape x="60" y="60" width="150" height="100" rx="12" fill="#a5e5fa" stroke="#0d1d1e" stroke-width="4" style="cursor:pointer"/>' +
            '<text x="135" y="118" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="19" fill="#0d1d1e" pointer-events:none>Rectangle</text>' +
            '<circle data-shape cx="330" cy="110" r="62" fill="#fcee6b" stroke="#0d1d1e" stroke-width="4" style="cursor:pointer"/>' +
            '<text x="330" y="118" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="18" fill="#0d1d1e" pointer-events:none>Ellipse</text>' +
            '<path data-shape d="M170 240l60-46 60 46-60 46z" fill="#35c46b" stroke="#0d1d1e" stroke-width="4" style="cursor:pointer"/>' +
            '<text x="230" y="244" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="17" fill="#0d1d1e" pointer-events:none>Diamond</text>' +
            '<rect x="368" y="196" width="118" height="70" rx="10" fill="none" stroke="#0d1d1e" stroke-width="3" stroke-dasharray="7 7" opacity=".35"/>' +
          '</svg>' +
        '</div>' +
        '<div style="width:clamp(132px,15vw,190px);border-left:3px solid #0d1d1e;background:var(--paper);padding:16px;display:flex;flex-direction:column;gap:12px">' +
          '<span class="demo__label">SELECTED</span>' +
          '<div data-shape-name style="font-family:Fredoka,sans-serif;font-weight:600;font-size:15px">Nothing selected</div>' +
          '<span class="demo__label">STROKE</span>' +
          '<div class="demo__swatches" data-shape-strokes>' +
            colors.map(function (c, i) { return '<button class="demo__swatch' + (i === 0 ? ' is-active' : '') + '" data-c="' + c + '" style="background:' + c + '"></button>'; }).join('') +
          '</div>' +
          '<span class="demo__label">FILL</span>' +
          '<div class="demo__swatches" data-shape-fills>' +
            fills.map(function (c, i) { return '<button class="demo__swatch' + (i === 0 ? ' is-active' : '') + '" data-c="' + c + '" style="background:' + (c === 'none' ? '#fffdf8' : c) + '"></button>'; }).join('') +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  function renderThemeDemo() {
    return '<div class="doc-demo doc-theme-demo" data-reveal>' +
      '<div class="doc-demo-label">Interactive Demo — Toggle Theme</div>' +
      '<div class="doc-theme-demo-canvas light" data-theme-demo>' +
        '<div class="doc-theme-demo-grid"></div>' +
        '<div class="doc-theme-demo-shapes">' +
          '<div class="doc-theme-demo-rect"></div><div class="doc-theme-demo-circle"></div>' +
          '<div class="doc-theme-demo-note">sticky note</div>' +
        '</div>' +
        '<div class="doc-theme-demo-toolbar">' +
          '<span class="doc-theme-demo-tool doc-theme-demo-tool--active"></span>' +
          '<span class="doc-theme-demo-tool"></span><span class="doc-theme-demo-tool"></span>' +
          '<span class="doc-theme-demo-tool"></span>' +
        '</div>' +
        '<button class="doc-theme-demo-toggle" type="button"><i class="ph ph-moon"></i><span>Dark</span></button>' +
      '</div></div>';
  }

  function renderZoomDemo() {
    return '<div class="doc-demo" data-reveal>' +
      '<div class="doc-demo-label">Interactive Demo — Zoom &amp; Pan</div>' +
      '<div class="doc-zoom-demo" data-zoom-demo tabindex="0" role="application" aria-label="Zoom demo. Click and drag to pan.">' +
        '<div class="doc-zoom-demo__world" data-zoom-world>' +
          '<div class="doc-zoom-demo__node" style="left:40px;top:40px;width:150px;height:80px">Research</div>' +
          '<div class="doc-zoom-demo__node n2" style="left:230px;top:60px;width:140px;height:80px">Wireframes</div>' +
          '<div class="doc-zoom-demo__node n3" style="left:80px;top:190px;width:160px;height:80px">Prototype</div>' +
          '<div class="doc-zoom-demo__node n4" style="left:300px;top:200px;width:150px;height:80px">Ship it</div>' +
        '</div>' +
        '<div class="doc-zoom-demo__hud">' +
          '<button type="button" data-z="-1" aria-label="Zoom out"><i class="ph ph-minus"></i></button>' +
          '<output data-zoom-label>100%</output>' +
          '<button type="button" data-z="1" aria-label="Zoom in"><i class="ph ph-plus"></i></button>' +
        '</div>' +
      '</div></div>';
  }

  function renderExportDemo() {
    var opts = [
      ['image', 'Download PNG', 'PNG'], ['file-pdf', 'Download PDF', 'PDF'],
      ['file-code', 'Export SVG', 'SVG'], ['file-json', 'Export JSON', 'JSON'],
      ['clipboard', 'Copy Image', 'COPY'], ['printer', 'Print Board', 'PRINT']
    ];
    return '<div class="doc-demo" data-reveal>' +
      '<div class="doc-demo-label">Interactive Demo — Export</div>' +
      '<div class="doc-export-demo">' +
        '<div class="doc-export-demo__board" style="position:relative">' +
          '<div class="doc-export-demo__mini" style="left:30px;top:40px;width:120px;height:74px"></div>' +
          '<div class="doc-export-demo__mini" style="left:180px;top:70px;width:100px;height:100px;border-radius:50%;border-color:#22a356;background:rgba(53,196,107,.14)"></div>' +
          '<div class="doc-export-demo__mini" style="left:60px;top:140px;width:96px;height:60px;border-color:#eab308;background:rgba(252,238,107,.35)"></div>' +
          '<div class="doc-export-demo__toast" data-export-toast>Saved · board.png</div>' +
        '</div>' +
        '<div class="doc-export-demo__menu">' + opts.map(function (o) {
          return '<button class="doc-export-demo__opt" type="button" data-fmt="' + o[2] + '">' +
            '<i class="ph ph-' + o[0] + '"></i>' + o[1] + '<b>' + o[2] + '</b></button>';
        }).join('') + '</div>' +
      '</div></div>';
  }

  var BLOCKS = {
    editorial: renderEditorial, action: renderAction, steps: renderSteps, workflow: renderWorkflow,
    tools: renderTools, stats: renderStats, cards: renderCards, shortcuts: renderShortcuts,
    tips: renderTips, gallery: renderGallery, faq: renderFaq, end: renderEnd,
    toolCanvas: renderToolCanvas, historyDemo: renderHistory, shapeTry: renderShapeTry,
    themeDemo: renderThemeDemo, zoomDemo: renderZoomDemo, exportDemo: renderExportDemo
  };

  /* ---------------- sections ---------------- */
  function renderSections() {
    var html = D.sections.map(function (s) {
      var blocks = (s.blocks || []).map(function (b) {
        var fn = BLOCKS[b.type];
        return fn ? fn(b) : '';
      }).join('');
      return '<section class="doc-section" id="' + s.id + '" data-reveal>' +
        '<h2 class="doc-section-title"><i class="ph ph-' + s.icon + '"></i>' +
          '<span>' + esc(s.title) + '</span>' +
          '<small style="margin-left:auto;font-family:Fredoka,sans-serif;font-weight:600;font-size:.36em;letter-spacing:.16em;opacity:.4">' + s.num + '</small>' +
        '</h2>' +
        (s.desc ? '<p class="doc-section-intro">' + esc(s.desc) + '</p>' : '') +
        blocks + '</section>';
    }).join('');
    document.getElementById('docsContent').innerHTML = html;
  }

  function renderSidebar() {
    var html = D.nav.map(function (g) {
      return '<div class="docs__group" data-cat="' + g.id + '">' +
        '<button class="docs__cat" type="button" aria-expanded="true">' +
          '<span>' + esc(g.label) + '</span><i class="ph ph-caret-down"></i></button>' +
        '<div class="docs__items">' + g.items.map(function (it) {
          return '<button class="docs__item" type="button" data-goto="' + it.id + '">' +
            '<span class="docs__item-indicator"></span>' + esc(it.label) + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    html += '<p class="docs__empty" hidden>No section matches that search.</p>';
    document.getElementById('docsSidebar').innerHTML = html;
  }

  function renderToc() {
    var html = '<h4>On this page</h4><nav class="docs__toc-list">' + D.toc.map(function (t) {
      return '<a href="#' + t.id + '" data-toc="' + t.id + '">' + esc(t.label) + '</a>';
    }).join('') + '</nav>';
    document.getElementById('docsToc').innerHTML = html;
  }

  /* ---------------- behaviour ---------------- */
  function wireFaq(root) {
    root.querySelectorAll('.doc-faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.doc-faq-item');
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function wireTheme(root) {
    var wrap = root.querySelector('[data-theme-demo]');
    if (!wrap) return;
    var btn = wrap.querySelector('.doc-theme-demo-toggle');
    btn.addEventListener('click', function () {
      var dark = wrap.classList.toggle('dark');
      wrap.classList.toggle('light', !dark);
      btn.querySelector('i').className = 'ph ph-' + (dark ? 'sun' : 'moon');
      btn.querySelector('span').textContent = dark ? 'Light' : 'Dark';
    });
  }

  function wireZoom(root) {
    var demo = root.querySelector('[data-zoom-demo]');
    if (!demo) return;
    var world = demo.querySelector('[data-zoom-world]');
    var out = demo.querySelector('[data-zoom-label]');
    var z = 1, tx = 0, ty = 0, drag = null;

    function apply() {
      world.style.transform = 'translate(-50%,-50%) translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
      out.textContent = Math.round(z * 100) + '%';
    }
    function setZoom(v) { z = Math.max(0.4, Math.min(2.4, v)); apply(); }

    demo.querySelectorAll('[data-z]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); setZoom(z + 0.2 * Number(b.dataset.z)); });
    });
    demo.addEventListener('wheel', function (e) {
      e.preventDefault();
      setZoom(z * (e.deltaY > 0 ? 0.92 : 1.08));
    }, { passive: false });
    demo.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      demo.setPointerCapture(e.pointerId);
    });
    demo.addEventListener('pointermove', function (e) {
      if (!drag) return;
      tx = drag.tx + (e.clientX - drag.x);
      ty = drag.ty + (e.clientY - drag.y);
      apply();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      demo.addEventListener(ev, function () { drag = null; });
    });
    demo.addEventListener('keydown', function (e) {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z + 0.2); }
      if (e.key === '-') { e.preventDefault(); setZoom(z - 0.2); }
    });
    apply();
  }

  function wireExport(root) {
    var demo = root.querySelector('.doc-export-demo');
    if (!demo) return;
    var toast = demo.querySelector('[data-export-toast]');
    var timer;
    demo.querySelectorAll('[data-fmt]').forEach(function (b) {
      b.addEventListener('click', function () {
        demo.querySelectorAll('[data-fmt]').forEach(function (o) { o.classList.remove('is-active'); });
        b.classList.add('is-active');
        var f = b.dataset.fmt;
        toast.textContent = f === 'COPY' ? 'Copied to clipboard' : f === 'PRINT' ? 'Print dialog opened' : 'Saved · board.' + f.toLowerCase();
        toast.classList.add('is-on');
        clearTimeout(timer);
        timer = setTimeout(function () { toast.classList.remove('is-on'); }, 1900);
      });
    });
  }

  function wireShapeTry(root) {
    var svg = root.querySelector('[data-shape-try]');
    if (!svg) return;
    var name = root.querySelector('[data-shape-name]');
    var selected = null;

    function clear() {
      root.querySelectorAll('.demo__swatch').forEach(function (s) { s.classList.remove('is-active'); });
    }
    svg.querySelectorAll('[data-shape]').forEach(function (sh) {
      sh.addEventListener('click', function () {
        selected = sh;
        name.textContent = sh.tagName === 'circle' ? 'Ellipse' : (sh.tagName === 'path' ? 'Diamond' : 'Rectangle');
        clear();
      });
    });
    root.querySelectorAll('[data-shape-strokes] .demo__swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        root.querySelectorAll('[data-shape-strokes] .demo__swatch').forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        if (!selected) { name.textContent = 'Pick a shape first'; return; }
        selected.setAttribute('stroke', sw.dataset.c);
      });
    });
    root.querySelectorAll('[data-shape-fills] .demo__swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        root.querySelectorAll('[data-shape-fills] .demo__swatch').forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        if (!selected) { name.textContent = 'Pick a shape first'; return; }
        selected.setAttribute('fill', sw.dataset.c);
      });
    });
  }

  /* ---------------- navigation ---------------- */
  var current = 'getting-started';
  var scrollingTo = false;

  function setActive(id) {
    if (current === id) return;
    current = id;
    document.querySelectorAll('.docs__item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.goto === id);
      if (b.dataset.goto === id) {
        var g = b.closest('.docs__group');
        if (g) g.classList.remove('is-closed');
      }
    });
    document.querySelectorAll('[data-toc]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.toc === id);
    });
  }

  function scrollToSection(id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    var nav = document.getElementById('nav');
    var offset = (nav ? nav.offsetHeight : 76) + 18;
    var y = sec.getBoundingClientRect().top + window.scrollY - offset;
    scrollingTo = true;
    if (Kanvas.lenis && Kanvas.lenis.scrollTo) {
      Kanvas.lenis.scrollTo(y, { duration: 0.9, onComplete: function () { scrollingTo = false; } });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(function () { scrollingTo = false; }, 900);
    }
    setActive(id);
  }

  function wireNavigation() {
    document.querySelectorAll('.docs__item').forEach(function (b) {
      b.addEventListener('click', function () { scrollToSection(b.dataset.goto); });
    });
    document.getElementById('docsToc').addEventListener('click', function (e) {
      var a = e.target.closest('[data-toc]');
      if (!a) return;
      e.preventDefault();
      scrollToSection(a.dataset.toc);
    });
    document.querySelectorAll('.docs__group .docs__cat').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.closest('.docs__group');
        var closed = g.classList.toggle('is-closed');
        b.setAttribute('aria-expanded', closed ? 'false' : 'true');
      });
    });
  }

  function wireScrollSpy() {
    var secs = D.sections.map(function (s) { return document.getElementById(s.id); }).filter(Boolean);
    var raf = 0;
    function tick() {
      raf = 0;
      if (scrollingTo) return;
      var probe = window.scrollY + (document.getElementById('nav').offsetHeight + 90);
      var best = null;
      secs.forEach(function (s) { if (s.offsetTop <= probe) best = s.id; });
      if (best) setActive(best);
    }
    window.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    tick();
  }

  function wireSearch() {
    var input = document.getElementById('docsSearch');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var any = false;
      document.querySelectorAll('.docs__group').forEach(function (g) {
        var shown = 0;
        g.querySelectorAll('.docs__item').forEach(function (it) {
          var hit = !q || it.textContent.toLowerCase().indexOf(q) > -1;
          it.classList.toggle('is-hidden', !hit);
          it.classList.toggle('is-match', !!q && hit);
          if (hit) shown++;
        });
        g.classList.toggle('is-filtered-out', !!q && !shown);
        if (q) g.classList.remove('is-closed');
        any = any || shown > 0;
      });
      var empty = document.querySelector('.docs__empty');
      if (empty) empty.hidden = any;

      document.querySelectorAll('.doc-section').forEach(function (sec) {
        var hit = !q || sec.textContent.toLowerCase().indexOf(q) > -1;
        sec.classList.toggle('is-filtered-out', !hit);
      });
      if (Kanvas.refreshScroll) Kanvas.refreshScroll();
    });
  }

  /* ---------------- init ---------------- */
  var ready = false;
  function init() {
    if (ready) return;
    ready = true;
    renderSidebar();
    renderSections();
    renderToc();

    var content = document.getElementById('docsContent');
    wireFaq(content);
    wireTheme(content);
    wireZoom(content);
    wireExport(content);
    wireShapeTry(content);
    wireNavigation();
    wireScrollSpy();
    wireSearch();

    S.splitAll(document.getElementById('view-docs'));
    S.measureDraw(document.getElementById('view-docs'));
    S.stagger(document.getElementById('view-docs'), '.doc-section .doc-card, .doc-section .doc-tip, .doc-section .doc-gallery-item, .doc-section .doc-tool-strip > *', 55);
    S.observeReveal(document.getElementById('view-docs'));
    setActive('getting-started');
  }

  Kanvas.docs = { init: init, scrollToSection: scrollToSection };
})();
