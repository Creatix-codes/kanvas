/* ============================================================
   KANVAS — board.js
   The full #/board whiteboard: tools, pan/zoom, style panel,
   undo/redo, export, autosave, keyboard shortcuts.
   ============================================================ */
window.KanvasBoard = (function () {
  'use strict';

  var C = Kanvas.core;
  var REDUCED = Kanvas.split.REDUCED;
  var STORE = 'kanvas-board-v1';

  var ready = false;
  var root, stage, canvas, ctx, railEl, panelEl, zoomEl, toastEl, fileEl;
  var shapes = [];
  var sel = null;
  var tool = 'select';
  var view = { x: 0, y: 0, scale: 1 };
  var dpr = 1, W = 0, H = 0;

  var def = { stroke: '#0d1d1e', fill: 'transparent', sw: 4, dash: 'solid', opacity: 1, fs: 28 };
  var undoStack = [], redoStack = [];
  var drag = null;
  var laser = [];
  var theme = 'light';
  var saveTimer = 0, toastTimer = 0;

  /* ─────────────────────────── helpers ─────────────────────────── */
  function $(sel, scope) { return (scope || document).querySelector(sel); }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 1700);
  }

  function snapshot() {
    undoStack.push(JSON.stringify(shapes.map(strip)));
    if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
    syncHistoryBtns();
  }

  function strip(s) {
    var o = {}; for (var k in s) if (k !== 'img' && Object.prototype.hasOwnProperty.call(s, k)) o[k] = s[k];
    return o;
  }

  function restore(json) {
    shapes = JSON.parse(json);
    sel = null;
    draw(); scheduleSave();
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(shapes.map(strip)));
    restore(undoStack.pop());
    syncHistoryBtns(); toast('Undo');
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(shapes.map(strip)));
    restore(redoStack.pop());
    syncHistoryBtns(); toast('Redo');
  }

  function syncHistoryBtns() {
    var u = $('#bdUndo'), r = $('#bdRedo');
    if (u) u.disabled = !undoStack.length;
    if (r) r.disabled = !redoStack.length;
  }

  /* ─────────────────────────── persistence ─────────────────────────── */
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 550);
    var s = $('#bdStatus');
    if (s) { s.textContent = 'Saving…'; s.classList.remove('is-flash'); }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ shapes: shapes.map(strip), view: view, file: fileEl.value, theme: theme }));
      var st = $('#bdStatus');
      if (st) { st.textContent = 'Saved locally'; st.classList.remove('is-flash'); void st.offsetWidth; st.classList.add('is-flash'); }
    } catch (e) {
      var st2 = $('#bdStatus');
      if (st2) st2.textContent = 'Storage full';
    }
  }

  function load() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {}
    if (raw && raw.shapes) {
      shapes = raw.shapes;
      if (raw.view) view = raw.view;
      if (raw.file && fileEl) fileEl.value = raw.file;
      if (raw.theme) setTheme(raw.theme, true);
    } else {
      shapes = [];
    }
  }

  /* ─────────────────────────── view ─────────────────────────── */
  function toWorld(sx, sy) { return { x: (sx - view.x) / view.scale, y: (sy - view.y) / view.scale }; }

  function zoomAt(factor, cx, cy) {
    var ns = Math.max(0.1, Math.min(6, view.scale * factor));
    var wx = (cx - view.x) / view.scale, wy = (cy - view.y) / view.scale;
    view.scale = ns;
    view.x = cx - wx * ns;
    view.y = cy - wy * ns;
    updateZoomLabel(); draw();
  }

  function updateZoomLabel() { if (zoomEl) zoomEl.textContent = Math.round(view.scale * 100) + '%'; }

  function fitView() {
    if (!W || !H) return;
    if (!shapes.length) {
      view.scale = 1; view.x = W / 2; view.y = H / 2;
      updateZoomLabel(); draw(); return;
    }
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    shapes.forEach(function (s) {
      var b = C.bbox(s);
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    });
    var pad = 90;
    var sc = Math.min((W - pad * 2) / Math.max(1, x2 - x1), (H - pad * 2) / Math.max(1, y2 - y1));
    view.scale = Math.max(0.1, Math.min(2, sc));
    view.x = W / 2 - ((x1 + x2) / 2) * view.scale;
    view.y = H / 2 - ((y1 + y2) / 2) * view.scale;
    updateZoomLabel(); draw();
  }

  function resetZoom() {
    view.scale = 1;
    view.x = W / 2; view.y = H / 2;
    updateZoomLabel(); draw();
  }

  /* ─────────────────────────── render ─────────────────────────── */
  function resize() {
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    if (!ctx) return;
    var dark = theme === 'dark';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = dark ? '#101d1f' : '#f5f2ea';
    ctx.fillRect(0, 0, W, H);
    C.drawGrid(ctx, W, H, view, dark ? 'rgba(245,242,234,.16)' : 'rgba(13,29,30,.16)');

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
    for (var i = 0; i < shapes.length; i++) C.drawShape(ctx, shapes[i]);

    /* laser trail */
    var now = performance.now();
    laser = laser.filter(function (l) { return now - l.t < 900; });
    if (laser.length) {
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      laser.forEach(function (l) {
        var age = (now - l.t) / 900;
        ctx.globalAlpha = Math.max(0, 1 - age) * 0.9;
        ctx.strokeStyle = '#ff4d5e';
        ctx.lineWidth = 5 / view.scale;
        ctx.beginPath();
        for (var k = 0; k < l.pts.length; k += 2) {
          if (k === 0) ctx.moveTo(l.pts[0], l.pts[1]);
          else ctx.lineTo(l.pts[k], l.pts[k + 1]);
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    if (sel) C.drawHandles(ctx, sel, view.scale);
    if (drag && drag.marquee) {
      var m = drag.marquee;
      ctx.save();
      ctx.strokeStyle = '#35c46b'; ctx.fillStyle = 'rgba(53,196,107,.12)';
      ctx.lineWidth = 2 / view.scale; ctx.setLineDash([6 / view.scale, 5 / view.scale]);
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.strokeRect(m.x, m.y, m.w, m.h);
      ctx.restore();
    }
    ctx.restore();

    var empty = $('#bdEmpty');
    if (empty) empty.classList.toggle('is-hidden', shapes.length > 0);
  }

  function loopLaser() {
    if (laser.length) { draw(); requestAnimationFrame(loopLaser); }
    else draw();
  }

  /* ─────────────────────────── tools ─────────────────────────── */
  function setTool(id) {
    tool = id;
    railEl.querySelectorAll('[data-tool]').forEach(function (b) {
      var on = b.dataset.tool === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    stage.dataset.tool = id;
    if (id !== 'select') { sel = null; draw(); }
    syncPanelHeader();
  }

  function syncPanelHeader() {
    var h = $('#bdPanelTitle');
    if (!h) return;
    var t = Kanvas.TOOLS.filter(function (x) { return x.id === tool; })[0];
    h.textContent = (sel && sel.type !== 'text') ? 'SELECTED · ' + sel.type.toUpperCase() : (t ? t.label : 'Style');
  }

  /* ─────────────────────────── style panel ─────────────────────────── */
  function activeStyle() { return sel || def; }

  function syncPanel() {
    var a = activeStyle();
    panelEl.querySelectorAll('[data-stroke]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.stroke === a.stroke); });
    panelEl.querySelectorAll('[data-fill]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.fill === a.fill); });
    panelEl.querySelectorAll('[data-sw]').forEach(function (b) { b.classList.toggle('is-active', Number(b.dataset.sw) === a.sw); });
    panelEl.querySelectorAll('[data-dash]').forEach(function (b) { b.classList.toggle('is-active', b.dataset.dash === a.dash); });
    var op = $('#bdOpacity'), opv = $('#bdOpacityVal');
    if (op) { op.value = Math.round(a.opacity * 100); if (opv) opv.textContent = op.value + '%'; }
    var fs = $('#bdFont');
    if (fs) {
      fs.value = a.fs || 28;
      var fo = $('#bdFontOut');
      if (fo) fo.textContent = fs.value;
    }
    var deleteBtn = $('#bdDelete');
    if (deleteBtn) deleteBtn.disabled = !sel;
    var dupBtn = $('#bdDup');
    if (dupBtn) dupBtn.disabled = !sel;
    syncPanelHeader();
  }

  function styleSet(patch, label) {
    if (sel) { Object.assign(sel, patch); draw(); scheduleSave(); }
    else Object.assign(def, patch);
    syncPanel();
  }

  /* ─────────────────────────── interaction ─────────────────────────── */
  function pt(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e) {
    if (e.button === 1 || tool === 'hand' || spaceDown) {
      canvas.setPointerCapture(e.pointerId);
      drag = { mode: 'pan', start: pt(e), vx: view.x, vy: view.y, id: e.pointerId };
      stage.classList.add('is-panning');
      return;
    }
    if (e.button !== 0) return;
    var p = pt(e), w = toWorld(p.x, p.y);
    canvas.setPointerCapture(e.pointerId);

    if (tool === 'laser') {
      var l = { pts: [w.x, w.y], t: performance.now() };
      laser.push(l);
      drag = { mode: 'laser', stroke: l };
      requestAnimationFrame(loopLaser);
      return;
    }

    if (tool === 'eraser') {
      snapshot();
      drag = { mode: 'erase' };
      eraseAt(w);
      return;
    }

    if (tool === 'select') {
      if (sel) {
        var h = C.handleAt(sel, w.x, w.y);
        if (h) { snapshot(); drag = { mode: 'resize', handle: h, last: w }; return; }
      }
      var hitS = C.pick(shapes, w.x, w.y);
      sel = hitS;
      syncPanel();
      if (hitS) { snapshot(); drag = { mode: 'move', last: w, moved: false }; }
      else drag = { mode: 'marquee', start: w };
      draw();
      return;
    }

    if (tool === 'text') {
      openTextEditor(p, w, null);
      return;
    }

    snapshot();
    var shapeType = tool === 'pen' ? 'free' : tool;
    var ns = C.defaults(shapeType, w.x, w.y);
    ns.stroke = def.stroke; ns.sw = def.sw; ns.fill = 'transparent'; ns.opacity = def.opacity; ns.dash = def.dash;
    if (shapeType === 'free') ns.pts = [w.x, w.y];
    shapes.push(ns);
    drag = { mode: 'draw', shape: ns, origin: w };
    sel = null;
    draw();
  }

  function onMove(e) {
    if (!drag) return;
    var p = pt(e), w = toWorld(p.x, p.y);

    if (drag.mode === 'pan') {
      view.x = drag.vx + (p.x - drag.start.x);
      view.y = drag.vy + (p.y - drag.start.y);
      draw(); return;
    }
    if (drag.mode === 'laser') {
      var last = drag.stroke.pts.length;
      if (Math.abs(w.x - drag.stroke.pts[last - 2]) + Math.abs(w.y - drag.stroke.pts[last - 1]) > 3) {
        drag.stroke.pts.push(w.x, w.y);
        if (drag.stroke.pts.length === 4) requestAnimationFrame(loopLaser);
        else draw();
      }
      return;
    }
    if (drag.mode === 'erase') { eraseAt(w); return; }
    if (drag.mode === 'move') {
      C.translate(drag.shape, w.x - drag.last.x, w.y - drag.last.y);
      drag.last = w; drag.moved = true; draw(); return;
    }
    if (drag.mode === 'resize') {
      C.resize(drag.shape, drag.handle, w.x - drag.last.x, w.y - drag.last.y);
      drag.last = w; draw(); return;
    }
    if (drag.mode === 'marquee') {
      drag.marquee = { x: Math.min(drag.start.x, w.x), y: Math.min(drag.start.y, w.y), w: Math.abs(w.x - drag.start.x), h: Math.abs(w.y - drag.start.y) };
      draw(); return;
    }
    if (drag.mode === 'draw') {
      if (drag.shape.type === 'free') drag.shape.pts.push(w.x, w.y);
      else { drag.shape.w = w.x - drag.origin.x; drag.shape.h = w.y - drag.origin.y; }
      draw();
    }  }

  function onUp(e) {
    if (!drag) return;
    var mode = drag.mode;

    if (mode === 'pan') stage.classList.remove('is-panning');

    if (mode === 'draw') {
      var s = drag.shape;
      if (s.type === 'free') {
        if (s.pts.length < 8) { shapes.pop(); undoStack.pop(); syncHistoryBtns(); }
        else sel = s;
      } else if (Math.abs(s.w) < 8 && Math.abs(s.h) < 8) {
        shapes.pop(); undoStack.pop(); syncHistoryBtns();
      } else { C.norm(s); sel = s; }
      scheduleSave(); syncPanel();
    } else if (mode === 'move' || mode === 'resize') {
      if (drag.moved) scheduleSave();
      else undoStack.pop(), syncHistoryBtns();
    } else if (mode === 'erase') scheduleSave();
    else if (mode === 'marquee') {
      var m = drag.marquee;
      if (m && (m.w > 6 || m.h > 6)) {
        sel = null;
        for (var i = shapes.length - 1; i >= 0; i--) {
          var b = C.bbox(shapes[i]);
          if (b.x >= m.x && b.x + b.w <= m.x + m.w && b.y >= m.y && b.y + b.h <= m.y + m.h) { sel = shapes[i]; break; }
        }
        syncPanel();
      }
    }
    drag = null;
    draw();
  }

  function eraseAt(w) {
    var v = C.pick(shapes, w.x, w.y);
    if (v) { shapes = shapes.filter(function (s) { return s !== v; }); if (sel === v) { sel = null; syncPanel(); } draw(); }
  }

  function delSel() {
    if (!sel) return;
    snapshot();
    shapes = shapes.filter(function (s) { return s !== sel; });
    sel = null; syncPanel(); draw(); scheduleSave(); toast('Deleted');
  }

  function dupSel() {
    if (!sel) return;
    snapshot();
    var c = C.clone(sel);
    C.translate(c, 26, 26);
    shapes.push(c);
    sel = c; draw(); scheduleSave(); toast('Duplicated');
  }

  /* ─────────────────────────── text editor ─────────────────────────── */
  var ta;
  function openTextEditor(screenP, worldP, shape) {
    ta.hidden = false;
    ta.value = shape ? shape.text : '';
    ta.style.left = screenP.x + 'px';
    ta.style.top = screenP.y + 'px';
    ta.style.fontSize = ((shape ? shape.fs : def.fs) * view.scale) + 'px';
    ta.style.color = shape ? shape.stroke : def.stroke;
    ta.dataset.wx = worldP.x;
    ta.dataset.wy = worldP.y;
    ta.dataset.id = shape ? shape.id : '';
    ta.focus();
    ta.select();
    document.body.classList.add('is-editing');
  }

  function closeTextEditor(commit) {
    if (ta.hidden) return;
    var txt = ta.value.trim();
    var id = ta.dataset.id;
    document.body.classList.remove('is-editing');
    ta.hidden = true;

    if (!commit) { if (!id) return; ta.value = ''; return; }

    if (id) {
      var s = shapes.filter(function (x) { return x.id === id; })[0];
      if (s) {
        snapshot();
        if (txt) { s.text = txt; } else { shapes = shapes.filter(function (x) { return x !== s; }); sel = null; }
        draw(); scheduleSave();
      }
    } else if (txt) {
      snapshot();
      var ns = C.defaults('text', Number(ta.dataset.wx), Number(ta.dataset.wy));
      ns.text = txt; ns.stroke = def.stroke; ns.fs = def.fs;
      shapes.push(ns); sel = ns; draw(); scheduleSave(); syncPanel();
    }
    ta.value = '';
  }

  /* ─────────────────────────── export ─────────────────────────── */
  function contentBounds() {
    if (!shapes.length) return { x: -260, y: -160, w: 520, h: 320 };
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    shapes.forEach(function (s) {
      var b = C.bbox(s);
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    });
    var pad = 40;
    return { x: x1 - pad, y: y1 - pad, w: (x2 - x1) + pad * 2, h: (y2 - y1) + pad * 2 };
  }

  function renderToCanvas(bg) {
    var b = contentBounds();
    var scale = Math.min(3, Math.max(1, 2000 / Math.max(b.w, b.h)));
    var c = document.createElement('canvas');
    c.width = Math.round(b.w * scale);
    c.height = Math.round(b.h * scale);
    var g = c.getContext('2d');
    g.fillStyle = bg || (theme === 'dark' ? '#101d1f' : '#f5f2ea');
    g.fillRect(0, 0, c.width, c.height);
    g.save();
    g.translate(-b.x * scale, -b.y * scale);
    g.scale(scale, scale);
    shapes.forEach(function (s) { C.drawShape(g, s); });
    g.restore();
    return c;
  }

  function download(blob, name) {
    var a = document.createElement('a');
    var url = URL.createObjectURL(blob);
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
  }

  function fileName(ext) {
    var n = (fileEl && fileEl.value.trim()) || 'kanvas-board';
    return n.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '.' + ext;
  }

  function exportPNG() {
    if (!shapes.length) return toast('Nothing to export yet');
    renderToCanvas().toBlob(function (b) { download(b, fileName('png')); toast('PNG exported'); }, 'image/png');
  }

  function exportJPG() {
    if (!shapes.length) return toast('Nothing to export yet');
    renderToCanvas('#ffffff').toBlob(function (b) { download(b, fileName('jpg')); toast('JPG exported'); }, 'image/jpeg', 0.92);
  }

  function escXML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function shapeToSVG(s) {
    var a = s.opacity == null ? 1 : s.opacity;
    var st = s.stroke, sw = s.sw, f = (s.fill && s.fill !== 'transparent') ? s.fill : 'none';
    var dash = s.dash === 'dashed' ? ' stroke-dasharray="' + (sw * 3.4) + ' ' + (sw * 2.6) + '"' :
      s.dash === 'dotted' ? ' stroke-dasharray="0.1 ' + (sw * 3) + '" stroke-linecap="round"' : '';
    var common = 'fill="' + escXML(f) + '" stroke="' + escXML(st) + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + a + '"' + dash;
    if (s.type === 'rect') return '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="' + s.radius + '" ' + common + '/>';
    if (s.type === 'ellipse') return '<ellipse cx="' + (s.x + s.w / 2) + '" cy="' + (s.y + s.h / 2) + '" rx="' + Math.abs(s.w / 2) + '" ry="' + Math.abs(s.h / 2) + '" ' + common + '/>';
    if (s.type === 'diamond') {
      var pts = [[s.x + s.w / 2, s.y], [s.x + s.w, s.y + s.h / 2], [s.x + s.w / 2, s.y + s.h], [s.x, s.y + s.h / 2]]
        .map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
      return '<polygon points="' + pts + '" ' + common + '/>';
    }
    if (s.type === 'line' || s.type === 'arrow') {
      var x2 = s.x + s.w, y2 = s.y + s.h;
      var out = '<line x1="' + s.x + '" y1="' + s.y + '" x2="' + x2 + '" y2="' + y2 + '" ' + common + '/>';
      if (s.type === 'arrow') {
        var ang = Math.atan2(y2 - s.y, x2 - s.x), L = Math.max(12, sw * 4.4);
        var a1 = [x2 - L * Math.cos(ang - 0.42), y2 - L * Math.sin(ang - 0.42)];
        var a2 = [x2 - L * Math.cos(ang + 0.42), y2 - L * Math.sin(ang + 0.42)];
        out += '<polyline points="' + x2 + ',' + y2 + ' ' + a1[0] + ',' + a1[1] + '" fill="none" stroke="' + escXML(st) + '" stroke-width="' + sw + '" stroke-linecap="round" opacity="' + a + '"/>';
        out += '<polyline points="' + x2 + ',' + y2 + ' ' + a2[0] + ',' + a2[1] + '" fill="none" stroke="' + escXML(st) + '" stroke-width="' + sw + '" stroke-linecap="round" opacity="' + a + '"/>';
      }
      return out;
    }
    if (s.type === 'free') {
      if (s.pts.length < 4) return '';
      var d = 'M' + s.pts[0] + ' ' + s.pts[1];
      for (var i = 2; i < s.pts.length - 2; i += 2) {
        d += ' Q' + s.pts[i] + ' ' + s.pts[i + 1] + ' ' + ((s.pts[i] + s.pts[i + 2]) / 2) + ' ' + ((s.pts[i + 1] + s.pts[i + 3]) / 2);
      }
      return '<path d="' + d + '" fill="none" stroke="' + escXML(st) + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + a + '"/>';
    }
    if (s.type === 'text') {
      var lines = String(s.text).split('\n');
      return lines.map(function (ln, k) {
        return '<text x="' + s.x + '" y="' + (s.y + k * s.fs * 1.25) + '" font-family="Fredoka, sans-serif" font-size="' + s.fs + '" font-weight="600" fill="' + escXML(st) + '" opacity="' + a + '">' + escXML(ln) + '</text>';
      }).join('');
    }
    return '';
  }

  function exportSVG() {
    if (!shapes.length) return toast('Nothing to export yet');
    var b = contentBounds();
    var bg = theme === 'dark' ? '#101d1f' : '#f5f2ea';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.x + ' ' + b.y + ' ' + b.w + ' ' + b.h + '" width="' + Math.round(b.w) + '" height="' + Math.round(b.h) + '">' +
      '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + bg + '"/>' +
      shapes.map(shapeToSVG).join('') + '</svg>';
    download(new Blob([svg], { type: 'image/svg+xml' }), fileName('svg'));
    toast('SVG exported');
  }

  function exportJSON() {
    var data = JSON.stringify({ app: 'kanvas', version: 1, file: fileEl.value, view: view, shapes: shapes.map(strip) }, null, 2);
    download(new Blob([data], { type: 'application/json' }), fileName('json'));
    toast('JSON exported');
  }

  function importJSON() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var data = JSON.parse(fr.result);
          if (!data.shapes || !data.shapes.length) throw new Error('empty');
          snapshot();
          shapes = data.shapes;
          if (data.view) view = data.view;
          if (data.file) fileEl.value = data.file;
          sel = null; updateZoomLabel(); draw(); scheduleSave();
          toast('Board loaded');
        } catch (e) { toast('Could not read that file'); }
      };
      fr.readAsText(f);
    };
    inp.click();
  }

  /* ─────────────────────────── theme ─────────────────────────── */
  function setTheme(t, silent) {
    theme = t;
    root.dataset.theme = t;
    var btn = $('#bdTheme');
    if (btn) {
      btn.innerHTML = '<i class="ph ph-' + (t === 'dark' ? 'sun' : 'moon') + '"></i>';
      btn.setAttribute('aria-label', t === 'dark' ? 'Light theme' : 'Dark theme');
    }
    draw();
    if (!silent) scheduleSave();
  }

  /* ─────────────────────────── keyboard ─────────────────────────── */
  var spaceDown = false;
  function onKey(e) {
    if (document.body.dataset.route !== 'board') return;
    var typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

    if (e.code === 'Space' && !typing) { spaceDown = true; stage.classList.add('is-space'); e.preventDefault(); }

    var k = e.key.toLowerCase();

    if (typing) {
      if (e.target === ta && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); closeTextEditor(true); }
      if (e.target === ta && e.key === 'Escape') { e.preventDefault(); closeTextEditor(false); }
      return;
    }

    if (e.key === 'Escape') {
      if (!ta.hidden) return closeTextEditor(false);
      if (sel) { sel = null; syncPanel(); draw(); return; }
      if ($('#bdExport') && !$('#bdExport').hidden) return toggleExport(false);
      if (Kanvas.app) Kanvas.app.closeMenu();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'd') { e.preventDefault(); dupSel(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); exportJSON(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'p') { e.preventDefault(); exportPNG(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'a') { e.preventDefault(); if (shapes.length) { sel = shapes[shapes.length - 1]; syncPanel(); draw(); } return; }
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delSel(); return; }
    if (k === '0') { e.preventDefault(); resetZoom(); return; }
    if (k === '=' || k === '+') { e.preventDefault(); zoomAt(1.15, W / 2, H / 2); return; }
    if (k === '-') { e.preventDefault(); zoomAt(1 / 1.15, W / 2, H / 2); return; }
    if (e.key === '?' || k === '/') { e.preventDefault(); toggleHelp(true); return; }

    var t = Kanvas.TOOLS.filter(function (x) { return x.key.toLowerCase() === k; })[0];
    if (t) { e.preventDefault(); setTool(t.id); }
  }

  function onKeyUp(e) {
    if (e.code === 'Space') { spaceDown = false; if (stage) stage.classList.remove('is-space'); }
  }

  /* ─────────────────────────── chrome ─────────────────────────── */
  function buildChrome() {
    root.innerHTML =
      '<header class="board__bar">' +
        '<a class="board__back" href="#top" title="Back to home"><i class="ph ph-house" aria-hidden="true"></i> Kanvas</a>' +
        '<label class="board__file"><i class="ph ph-folder-open" aria-hidden="true"></i>' +
          '<input id="bdFile" value="Untitled board" aria-label="Board name" spellcheck="false"></label>' +
        '<span class="board__saved" id="bdStatus">Saved locally</span>' +
        '<span class="board__spacer"></span>' +
        '<div class="board__group">' +
          '<button class="bbtn bbtn--icon" id="bdUndo" type="button" aria-label="Undo" title="Undo (Ctrl+Z)"><i class="ph ph-arrow-counter-clockwise"></i></button>' +
          '<button class="bbtn bbtn--icon" id="bdRedo" type="button" aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><i class="ph ph-arrow-clockwise"></i></button>' +
          '<button class="bbtn bbtn--icon" id="bdHelp" type="button" aria-label="Keyboard shortcuts" title="Shortcuts (?)"><i class="ph ph-keyboard"></i></button>' +
          '<button class="bbtn bbtn--icon" id="bdTheme" type="button" aria-label="Dark theme" title="Toggle theme"><i class="ph ph-moon"></i></button>' +
          '<span class="board__menuwrap">' +
            '<button class="bbtn bbtn--grass" id="bdExportBtn" type="button" aria-expanded="false" aria-haspopup="true">EXPORT <i class="ph ph-caret-down"></i></button>' +
            '<div class="board__menu" id="bdExport" hidden role="menu">' +
              '<button type="button" role="menuitem" data-exp="png"><i class="ph ph-image"></i> PNG image <b>PNG</b></button>' +
              '<button type="button" role="menuitem" data-exp="jpg"><i class="ph ph-file-jpg"></i> JPG image <b>JPG</b></button>' +
              '<button type="button" role="menuitem" data-exp="svg"><i class="ph ph-file-svg"></i> SVG vector <b>SVG</b></button>' +
              '<button type="button" role="menuitem" data-exp="json"><i class="ph ph-file-json"></i> JSON document <b>JSON</b></button>' +
              '<hr>' +
              '<button type="button" role="menuitem" data-exp="open"><i class="ph ph-upload-simple"></i> Open a JSON board</button>' +
            '</div>' +
          '</span>' +
        '</div>' +
      '</header>' +

      '<div class="board__work">' +
        '<nav class="board__tools" id="bdRail" role="toolbar" aria-label="Drawing tools"></nav>' +

        '<div class="board__stage" id="bdStage" data-tool="select">' +
          '<canvas id="bdCanvas"></canvas>' +
          '<div class="board__empty" id="bdEmpty">' +
            '<h2>Blank canvas</h2>' +
            '<p>Pick a tool and drag to draw — or press ? for shortcuts.</p>' +
            '<div class="board__empty-actions">' +
              '<button class="bbtn bbtn--grass" type="button" data-quick="rect"><i class="ph ph-square"></i> <span class="lbl">Draw a rectangle</span></button>' +
              '<button class="bbtn" type="button" data-quick="pen"><i class="ph ph-pencil-simple"></i> <span class="lbl">Scribble freely</span></button>' +
            '</div>' +
          '</div>' +
          '<textarea id="bdText" class="board__textarea" hidden rows="1" spellcheck="false" placeholder="Type something…"></textarea>' +
        '</div>' +

        '<aside class="board__panel" id="bdPanel" aria-label="Style panel">' +
          '<div class="board__label"><span id="bdPanelTitle">Select</span></div>' +
          '<div><span class="board__label">Stroke</span><div class="board__swatches" id="bdSwatches"></div></div>' +
          '<div><span class="board__label">Fill</span><div class="board__swatches" id="bdFills"></div></div>' +
          '<div><span class="board__label">Stroke weight</span><div class="board__seg" id="bdWidths"></div></div>' +
          '<div><span class="board__label">Stroke style</span><div class="board__seg" id="bdDashes"></div></div>' +
          '<div><span class="board__label">Opacity <output id="bdOpacityVal">100%</output></span>' +
            '<input class="board__range" id="bdOpacity" type="range" min="10" max="100" value="100" aria-label="Opacity"></div>' +
          '<div><span class="board__label">Text size <output id="bdFontOut">28</output></span>' +
            '<input class="board__range" id="bdFont" type="range" min="10" max="160" value="28" aria-label="Text size"></div>' +
          '<div class="board__panel-row">' +
            '<button class="bbtn" id="bdDup" type="button"><i class="ph ph-copy"></i> <span class="lbl">Duplicate</span></button>' +
            '<button class="bbtn" id="bdDelete" type="button"><i class="ph ph-trash"></i> <span class="lbl">Delete</span></button>' +
          '</div>' +
          '<p class="board__hintline">Tip: hold <b>Space</b> and drag to pan, <b>Ctrl</b> + scroll to zoom, <b>Esc</b> to deselect.</p>' +
        '</aside>' +

        '<div class="board__zoom">' +
          '<button type="button" id="bdZoomOut" aria-label="Zoom out"><i class="ph ph-minus"></i></button>' +
          '<button type="button" id="bdZoomFit" title="Reset zoom (0)"><output id="bdZoom2">100%</output></button>' +
          '<button type="button" id="bdZoomIn" aria-label="Zoom in"><i class="ph ph-plus"></i></button>' +
        '</div>' +

        '<div class="board__hint"><span>Space + drag · pan</span><span>Ctrl + scroll · zoom</span><span id="bdCount">0 shapes</span></div>' +
      '</div>' +

      '<div class="board__help" id="bdHelpBox" hidden>' +
        '<div class="board__help-panel" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">' +
          '<div class="board__help-head"><h3>Keyboard shortcuts</h3>' +
            '<button class="bbtn bbtn--icon" type="button" data-help-close aria-label="Close"><i class="ph ph-x"></i></button></div>' +
          '<div class="help-grid" id="bdHelpGrid"></div>' +
        '</div>' +
      '</div>' +

      '<div class="board__toast" id="bdToast" role="status" aria-live="polite"></div>';

    railEl = $('#bdRail');
    panelEl = $('#bdPanel');
    canvas = $('#bdCanvas');
    stage = $('#bdStage');
    ctx = canvas.getContext('2d');
    toastEl = $('#bdToast');
    fileEl = $('#bdFile');
    zoomEl = $('#bdZoom2');
    ta = $('#bdText');

    railEl.innerHTML = Kanvas.TOOLS.map(function (t) {
      return '<button class="tool" type="button" data-tool="' + t.id + '" aria-pressed="false" data-tip="' + t.label + ' (' + t.key + ')" aria-label="' + t.label + '">' +
        '<i class="ph ph-' + t.icon + '"></i><kbd>' + t.key + '</kbd></button>';
    }).join('');

    $('#bdSwatches').innerHTML = Kanvas.PALETTE.map(function (c) {
      return '<button class="swatch" type="button" data-stroke="' + c + '" style="--c:' + c + '" aria-label="Stroke ' + c + '" title="Stroke ' + c + '"></button>';
    }).join('');
    $('#bdFills').innerHTML = Kanvas.FILLS.map(function (c) {
      var none = c === 'transparent';
      return '<button class="swatch' + (none ? ' swatch--none' : '') + '" type="button" data-fill="' + c + '"' +
        (none ? '' : ' style="--c:' + c + '"') + ' aria-label="' + (none ? 'No fill' : 'Fill ' + c) + '" title="' + (none ? 'No fill' : 'Fill ' + c) + '"></button>';
    }).join('');
    $('#bdWidths').innerHTML = [1.5, 2, 3, 4, 6, 9].map(function (v) {
      return '<button type="button" data-sw="' + v + '" aria-label="Stroke width ' + v + '" title="' + v + 'px"><i style="height:' + v + 'px"></i></button>';
    }).join('');
    $('#bdDashes').innerHTML = ['solid', 'dashed', 'dotted'].map(function (d) {
      return '<button type="button" data-dash="' + d + '" aria-label="' + d + ' stroke" title="' + d + '"><i class="seg-line is-' + d + '"></i></button>';
    }).join('');

    $('#bdHelpGrid').innerHTML =
      helpGroup('Tools', Kanvas.TOOLS.map(function (t) { return [t.key, t.label]; })) +
      helpGroup('Editing', [['Ctrl Z', 'Undo'], ['Ctrl ⇧ Z', 'Redo'], ['Ctrl D', 'Duplicate'], ['Delete', 'Remove shape'], ['Esc', 'Deselect']]) +
      helpGroup('Canvas', [['Space + drag', 'Pan'], ['Ctrl + scroll', 'Zoom'], ['0', 'Reset zoom'], ['+ −', 'Zoom in / out']]) +
      helpGroup('Export', [['Ctrl S', 'Save JSON'], ['Ctrl P', 'Export PNG'], ['?', 'This panel']]);

    function helpGroup(title, rows) {
      return '<div class="help-col"><h4>' + title + '</h4>' + rows.map(function (r) {
        return '<div class="kbd-row"><kbd>' + r[0] + '</kbd><span>' + r[1] + '</span></div>';
      }).join('') + '</div>';
    }
  }

  function wire() {
    railEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tool]');
      if (b) setTool(b.dataset.tool);
    });

    panelEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-stroke],[data-fill],[data-sw],[data-dash]');
      if (!b) return;
      if (b.hasAttribute('data-stroke')) styleSet({ stroke: b.dataset.stroke });
      else if (b.hasAttribute('data-fill')) styleSet({ fill: b.dataset.fill });
      else if (b.hasAttribute('data-sw')) styleSet({ sw: Number(b.dataset.sw) });
      else if (b.hasAttribute('data-dash')) styleSet({ dash: b.dataset.dash });
    });

    var op = $('#bdOpacity');
    op.addEventListener('input', function () {
      $('#bdOpacityVal').textContent = op.value + '%';
      var v = Number(op.value) / 100;
      if (sel) { sel.opacity = v; draw(); scheduleSave(); } else def.opacity = v;
    });

    $('#bdFont').addEventListener('input', function () {
      var v = Math.max(10, Math.min(160, Number(this.value) || 28));
      var out = $('#bdFontOut');
      if (out) out.textContent = v;
      if (sel && sel.type === 'text') { sel.fs = v; draw(); scheduleSave(); } else def.fs = v;
    });

    $('#bdDelete').addEventListener('click', delSel);
    $('#bdDup').addEventListener('click', dupSel);
    $('#bdUndo').addEventListener('click', undo);
    $('#bdRedo').addEventListener('click', redo);
    $('#bdZoomIn').addEventListener('click', function () { zoomAt(1.15, W / 2, H / 2); });
    $('#bdZoomOut').addEventListener('click', function () { zoomAt(1 / 1.15, W / 2, H / 2); });
    $('#bdZoomFit').addEventListener('click', resetZoom);
    $('#bdTheme').addEventListener('click', function () { setTheme(theme === 'dark' ? 'light' : 'dark'); });
    $('#bdHelp').addEventListener('click', function () { toggleHelp($('#bdHelpBox').hidden); });

    fileEl.addEventListener('input', scheduleSave);

    var expMenu = $('#bdExport');
    $('#bdExportBtn').addEventListener('click', function (e) { e.stopPropagation(); toggleExport(); });
    expMenu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-exp]');
      if (!b) return;
      toggleExport(false);
      ({ png: exportPNG, jpg: exportJPG, svg: exportSVG, json: exportJSON, open: importJSON })[b.dataset.exp]();
    });
    document.addEventListener('click', function (e) {
      if (!expMenu.hidden && !e.target.closest('#bdExport') && !e.target.closest('#bdExportBtn')) toggleExport(false);
    });

    $('#bdHelpBox').addEventListener('click', function (e) {
      if (e.target === this || e.target.closest('[data-help-close]')) toggleHelp(false);
    });

    var empty = $('#bdEmpty');
    empty.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quick]');
      if (!b) return;
      setTool(b.dataset.quick);
      empty.classList.add('is-dismissed');
      toast(b.dataset.quick === 'pen' ? 'Pencil selected — drag on the canvas' : 'Rectangle selected — drag on the canvas');
    });

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('dblclick', function (e) {
      var p = pt(e), w = toWorld(p.x, p.y);
      var hitS = C.pick(shapes, w.x, w.y);
      if (hitS && hitS.type === 'text') openTextEditor(p, w, hitS);
    });

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = pt(e);
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.pow(0.998, e.deltaY * (e.deltaMode === 1 ? 16 : 1)), p.x, p.y);
      } else {
        var m = e.deltaMode === 1 ? 16 : 1;
        view.x -= e.deltaX * m;
        view.y -= e.deltaY * m;
        draw();
      }
    }, { passive: false });

    /* pinch to zoom + two-finger pan */
    var pts = {};
    stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') pts[e.pointerId] = e; });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'touch' || !pts[e.pointerId]) return;
      pts[e.pointerId] = e;
      var ids = Object.keys(pts);
      if (ids.length !== 2) return;
      var a = pts[ids[0]], b = pts[ids[1]];
      var d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      var mid = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
      var r = canvas.getBoundingClientRect();
      if (stage.__pd) {
        zoomAt(d / stage.__pd, mid.x - r.left, mid.y - r.top);
        view.x += mid.x - stage.__pm.x;
        view.y += mid.y - stage.__pm.y;
        draw();
      }
      stage.__pd = d; stage.__pm = mid;
      drag = null;
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      stage.addEventListener(ev, function (e) {
        delete pts[e.pointerId];
        if (Object.keys(pts).length < 2) { stage.__pd = null; stage.__pm = null; }
      });
    });

    ta.addEventListener('blur', function () { closeTextEditor(true); });
  }

  function toggleExport(open) {
    var m = $('#bdExport');
    if (!m) return;
    var willOpen = open == null ? m.hidden : open;
    m.hidden = !willOpen;
    var b = $('#bdExportBtn');
    if (b) b.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  function toggleHelp(open) {
    var h = $('#bdHelpBox');
    if (h) h.hidden = !open;
  }

  /* ─────────────────────────── lifecycle ─────────────────────────── */
  function init() {
    if (ready) { activate(); return; }
    ready = true;
    root = $('#boardRoot');
    buildChrome();
    wire();
    load();
    setTool('select');
    syncPanel();
    updateZoomLabel();

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', function () { clearTimeout(root.__rz); root.__rz = setTimeout(resize, 90); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { resize(); }).observe(stage);

    activate();
  }

  function activate() {
    requestAnimationFrame(function () {
      resize();
      if (!shapes.length) resetZoom();
      else fitView();
      syncPanel();
      var s = $('#bdStatus');
      if (s) s.textContent = 'Saved locally';
    });
  }

  function updateHUD() {
    var c = $('#bdCount');
    if (c) c.textContent = shapes.length + (shapes.length === 1 ? ' shape' : ' shapes');
    var z = $('#bdZoom2');
    if (z) z.textContent = Math.round(view.scale * 100) + '%';
  }

  /* HUD refresh loop while board is visible */
  setInterval(function () {
    if (document.body.dataset.route !== 'board') return;
    updateHUD();
  }, 600);

  return { init: init, activate: activate };
})();
