/* ============================================================
   KANVAS — mini-board.js
   Interactive whiteboard preview inside the About section,
   plus the shared tool / palette definitions for #/board.
   ============================================================ */
(function () {
  'use strict';

  var C = Kanvas.core;

  Kanvas.TOOLS = [
    { id: 'select', icon: 'cursor', key: 'V', label: 'Select' },
    { id: 'hand', icon: 'hand', key: 'H', label: 'Pan' },
    { id: 'rect', icon: 'square', key: 'R', label: 'Rectangle' },
    { id: 'ellipse', icon: 'circle', key: 'O', label: 'Ellipse' },
    { id: 'diamond', icon: 'diamond', key: 'D', label: 'Diamond' },
    { id: 'arrow', icon: 'arrow-up-right', key: 'A', label: 'Arrow' },
    { id: 'line', icon: 'minus', key: 'L', label: 'Line' },
    { id: 'pen', icon: 'pencil-simple', key: 'P', label: 'Pencil' },
    { id: 'text', icon: 'text-aa', key: 'T', label: 'Text' },
    { id: 'laser', icon: 'fire', key: 'K', label: 'Laser' },
    { id: 'eraser', icon: 'eraser', key: 'E', label: 'Eraser' }
  ];

  Kanvas.PALETTE = ['#0d1d1e', '#e04a4a', '#d4943a', '#eab308', '#35c46b', '#4585d1'];
  Kanvas.FILLS = ['transparent', '#a5e5fa', '#fcee6b', '#35c46b', '#ffffff'];
  Kanvas.WIDTHS = [{ v: 2, label: 'Thin' }, { v: 4, label: 'Regular' }, { v: 7, label: 'Thick' }];

  var DEMO_TOOLS = ['select', 'rect', 'ellipse', 'diamond', 'arrow', 'line', 'pen', 'eraser'];

  function init() {
    var root = document.getElementById('demoBoard');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';

    var canvas = document.getElementById('demoCanvas');
    var stage = document.getElementById('demoStage');
    var ctx = canvas.getContext('2d');
    var hint = document.getElementById('demoHint');
    var saved = document.getElementById('demoSaved');
    var toolsEl = document.getElementById('demoTools');
    var swatchesEl = document.getElementById('demoSwatches');
    var widthsEl = document.getElementById('demoWidths');

    var shapes = [];
    var tool = 'select';
    var stroke = Kanvas.PALETTE[4];
    var sw = 4;
    var selected = null;
    var drag = null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var history = [];
    var seedStart = 0;
    var seeded = false;

    /* ---------- chrome ---------- */
    toolsEl.innerHTML = DEMO_TOOLS.map(function (id) {
      var t = Kanvas.TOOLS.filter(function (x) { return x.id === id; })[0];
      return '<button class="demo__tool' + (id === 'select' ? ' is-active' : '') + '" type="button" data-tool="' + id +
        '" title="' + t.label + ' (' + t.key + ')" aria-label="' + t.label + '"><i class="ph ph-' + t.icon + '"></i></button>';
    }).join('') + '<button class="demo__tool" type="button" data-undo title="Undo" aria-label="Undo"><i class="ph ph-arrow-counter-clockwise"></i></button>';

    swatchesEl.innerHTML = Kanvas.PALETTE.map(function (c) {
      return '<button class="demo__swatch' + (c === stroke ? ' is-active' : '') + '" type="button" data-c="' + c + '" style="background:' + c + '" aria-label="Stroke ' + c + '"></button>';
    }).join('');

    widthsEl.innerHTML = Kanvas.WIDTHS.map(function (w) {
      return '<button class="demo__width' + (w.v === sw ? ' is-active' : '') + '" type="button" data-w="' + w.v + '">' +
        '<i style="height:' + w.v + 'px"></i>' + w.label + '</button>';
    }).join('');

    function flashSaved() {
      if (!saved) return;
      saved.textContent = 'Saved locally';
      saved.classList.remove('is-flash');
      void saved.offsetWidth;
      saved.classList.add('is-flash');
    }

    function pushHistory() {
      history.push(JSON.stringify(shapes.map(function (s) { var c = Object.assign({}, s); delete c.img; return c; })));
      if (history.length > 40) history.shift();
    }

    function undo() {
      if (!history.length) return;
      shapes = JSON.parse(history.pop());
      selected = null;
      draw();
      flashSaved();
    }

    /* ---------- sizing ---------- */
    function resize() {
      var r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    /* ---------- render ---------- */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      C.drawGrid(ctx, W, H, null);

      var t = performance.now();
      for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        if (s.alpha != null && s.alpha < 1) {
          var d = t - seedStart - i * 110;
          s.alpha = Math.max(0, Math.min(1, d / 520));
        }
        var a = s.opacity;
        if (s.alpha != null) s.opacity = a * s.alpha;
        C.drawShape(ctx, s);
        s.opacity = a;
      }
      if (selected) C.drawHandles(ctx, selected, 1);
    }

    var raf = 0;
    function loop() {
      draw();
      var animating = shapes.some(function (s) { return s.alpha != null && s.alpha < 1; });
      if (animating) raf = requestAnimationFrame(loop);
      else { shapes.forEach(function (s) { delete s.alpha; }); raf = 0; draw(); }
    }

    /* ---------- coordinates ---------- */
    function toWorld(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    /* ---------- interaction ---------- */
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      var p = toWorld(e);
      hint.classList.add('is-hidden');

      if (tool === 'eraser') {
        var victim = C.pick(shapes, p.x, p.y);
        if (victim) { pushHistory(); shapes = shapes.filter(function (s) { return s !== victim; }); if (selected === victim) selected = null; draw(); flashSaved(); }
        drag = { mode: 'erase' };
        return;
      }

      if (tool === 'select') {
        if (selected) {
          var h = C.handleAt(selected, p.x, p.y);
          if (h) { pushHistory(); drag = { mode: 'resize', handle: h, last: p, moved: false }; return; }
        }
        var hitS = C.pick(shapes, p.x, p.y);
        selected = hitS;
        if (hitS) { pushHistory(); drag = { mode: 'move', last: p, moved: false, shape: hitS }; }
        else drag = { mode: 'none' };
        draw();
        return;
      }

      if (tool === 'text') {
        pushHistory();
        var ts = C.defaults('text', p.x, p.y);
        ts.stroke = stroke; ts.text = 'Your idea';
        shapes.push(ts);
        selected = ts;
        draw(); flashSaved();
        return;
      }

      pushHistory();
      if (tool === 'pen') {
        var fs = C.defaults('free', p.x, p.y);
        fs.pts = [p.x, p.y];
        fs.stroke = stroke; fs.sw = sw;
        shapes.push(fs);
        drag = { mode: 'draw', shape: fs };
      } else {
        var ns = C.defaults(tool, p.x, p.y);
        ns.stroke = stroke; ns.sw = sw;
        if (tool === 'rect' || tool === 'ellipse' || tool === 'diamond') ns.fill = 'transparent';
        shapes.push(ns);
        drag = { mode: 'draw', shape: ns, origin: p };
      }
      selected = null;
      draw();
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = toWorld(e);

      if (drag.mode === 'erase') {
        var victim = C.pick(shapes, p.x, p.y);
        if (victim) { shapes = shapes.filter(function (s) { return s !== victim; }); draw(); }
        return;
      }
      if (drag.mode === 'move') {
        C.translate(drag.shape, p.x - drag.last.x, p.y - drag.last.y);
        drag.last = p; drag.moved = true; draw();
        return;
      }
      if (drag.mode === 'resize') {
        C.resize(drag.shape, drag.handle, p.x - drag.last.x, p.y - drag.last.y);
        drag.last = p; drag.moved = true; draw();
        return;
      }
      if (drag.mode === 'draw' && drag.shape) {
        if (drag.shape.type === 'free') drag.shape.pts.push(p.x, p.y);
        else { drag.shape.w = p.x - drag.origin.x; drag.shape.h = p.y - drag.origin.y; }
        draw();
      }
    });

    function endDrag() {
      if (!drag) return;
      if (drag.mode === 'draw' && drag.shape) {
        var s = drag.shape;
        if (s.type === 'free') {
          if (s.pts.length < 6) { shapes.pop(); history.pop(); }
        } else if (Math.abs(s.w) < 6 && Math.abs(s.h) < 6) {
          shapes.pop(); history.pop();
        } else { C.norm(s); selected = s; }
      }
      if (drag.mode === 'erase' || drag.mode === 'move' || drag.mode === 'resize') flashSaved();
      drag = null;
      draw();
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', function () { if (drag && drag.mode !== 'draw') endDrag(); });

    /* ---------- controls ---------- */
    toolsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tool],[data-undo]');
      if (!b) return;
      if (b.hasAttribute('data-undo')) { undo(); return; }
      tool = b.dataset.tool;
      toolsEl.querySelectorAll('[data-tool]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      stage.dataset.tool = tool;
      if (tool !== 'select') selected = null;
      draw();
    });

    swatchesEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]');
      if (!b) return;
      stroke = b.dataset.c;
      swatchesEl.querySelectorAll('.demo__swatch').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      if (selected) { pushHistory(); selected.stroke = stroke; draw(); flashSaved(); }
    });

    widthsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-w]');
      if (!b) return;
      sw = Number(b.dataset.w);
      widthsEl.querySelectorAll('.demo__width').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      if (selected) { pushHistory(); selected.sw = sw; draw(); flashSaved(); }
    });

    stage.dataset.tool = 'select';

    /* ---------- seed ---------- */
    function seed() {
      if (seeded) return;
      seeded = true;
      pushHistory();
      shapes = C.starter();
      seedStart = performance.now();
      shapes.forEach(function (s) { s.alpha = 0; });
      if (Kanvas.split.REDUCED) { shapes.forEach(function (s) { delete s.alpha; }); draw(); }
      else raf = requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { seed(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(root);
    } else seed();

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    window.addEventListener('resize', resize);
    resize();

    Kanvas.miniBoard = { resize: resize, seed: seed };
  }

  Kanvas.mini = { init: init };
})();
