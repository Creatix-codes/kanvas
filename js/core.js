/* ============================================================
   KANVAS — core.js
   Shared whiteboard model: shapes, hit-testing, rendering.
   Used by the landing mini-demo and the full #/board app.
   ============================================================ */
window.Kanvas = window.Kanvas || {};
Kanvas.core = (function () {
  'use strict';

  var uid = 0;
  function id() { return 's' + (++uid) + '-' + Date.now().toString(36); }

  function defaults(type, x, y) {
    var base = {
      id: id(), type: type, x: x, y: y, w: 0, h: 0, pts: [],
      stroke: '#0d1d1e', fill: 'transparent', sw: 3, dash: 'solid',
      opacity: 1, text: '', fs: 24, radius: 8
    };
    if (type === 'text') { base.text = 'Text'; base.sw = 0; }
    return base;
  }

  function bbox(s) {
    if (s.type === 'free') {
      var xs = [], ys = [], i;
      for (i = 0; i < s.pts.length; i += 2) { xs.push(s.pts[i]); ys.push(s.pts[i + 1]); }
      if (!xs.length) return { x: s.x, y: s.y, w: 0, h: 0 };
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
      var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    var x = s.w < 0 ? s.x + s.w : s.x;
    var y = s.h < 0 ? s.y + s.h : s.y;
    if (s.type === 'text') {
      return { x: s.x, y: s.y - s.fs, w: Math.max(s.fs * 0.6 * (s.text.length || 1), 40), h: s.fs * 1.25 };
    }
    return { x: x, y: y, w: Math.abs(s.w), h: Math.abs(s.h) };
  }

  function norm(s) {
    if (s.type === 'free') return s;
    if (s.w < 0) { s.x += s.w; s.w = -s.w; }
    if (s.h < 0) { s.y += s.h; s.h = -s.h; }
    return s;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function diamondPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
  }

  function setDash(ctx, dash, sw) {
    if (dash === 'dashed') ctx.setLineDash([sw * 3.4, sw * 2.6]);
    else if (dash === 'dotted') ctx.setLineDash([0.1, sw * 3]);
    else ctx.setLineDash([]);
  }

  function arrowHead(ctx, x1, y1, x2, y2, sw) {
    var a = Math.atan2(y2 - y1, x2 - x1);
    var len = Math.max(12, sw * 4.4);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - len * Math.cos(a - 0.42), y2 - len * Math.sin(a - 0.42));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - len * Math.cos(a + 0.42), y2 - len * Math.sin(a + 0.42));
    ctx.stroke();
  }

  function drawShape(ctx, s) {
    ctx.save();
    ctx.globalAlpha = s.opacity == null ? 1 : s.opacity;
    ctx.lineWidth = s.sw;
    ctx.strokeStyle = s.stroke;
    ctx.fillStyle = s.fill === 'transparent' || !s.fill ? 'rgba(0,0,0,0)' : s.fill;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setDash(ctx, s.dash, s.sw);

    if (s.type === 'rect') {
      roundRectPath(ctx, s.x, s.y, s.w, s.h, s.radius);
      ctx.fill(); if (s.sw) ctx.stroke();
    } else if (s.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, Math.abs(s.w / 2), Math.abs(s.h / 2), 0, 0, Math.PI * 2);
      ctx.fill(); if (s.sw) ctx.stroke();
    } else if (s.type === 'diamond') {
      diamondPath(ctx, s.x, s.y, s.w, s.h);
      ctx.fill(); if (s.sw) ctx.stroke();
    } else if (s.type === 'line' || s.type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.stroke();
      if (s.type === 'arrow') { setDash(ctx, 'solid', s.sw); arrowHead(ctx, s.x, s.y, s.x + s.w, s.y + s.h, s.sw); }
    } else if (s.type === 'free') {
      if (s.pts.length > 3) {
        ctx.beginPath();
        ctx.moveTo(s.pts[0], s.pts[1]);
        for (var i = 2; i < s.pts.length - 2; i += 2) {
          var mx = (s.pts[i] + s.pts[i + 2]) / 2, my = (s.pts[i + 1] + s.pts[i + 3]) / 2;
          ctx.quadraticCurveTo(s.pts[i], s.pts[i + 1], mx, my);
        }
        ctx.stroke();
      }
    } else if (s.type === 'text') {
      ctx.fillStyle = s.stroke;
      ctx.font = '600 ' + s.fs + 'px Fredoka, DM Sans, sans-serif';
      ctx.textBaseline = 'alphabetic';
      var lines = String(s.text).split('\n');
      for (var l = 0; l < lines.length; l++) ctx.fillText(lines[l], s.x, s.y + l * s.fs * 1.25);
    } else if (s.type === 'image' && s.img) {
      ctx.drawImage(s.img, s.x, s.y, s.w, s.h);
      if (s.sw) { setDash(ctx, s.dash, s.sw); ctx.strokeRect(s.x, s.y, s.w, s.h); }
    }
    ctx.restore();
  }

  function drawHandles(ctx, s, scale) {
    var b = bbox(s);
    var hs = 9 / (scale || 1);
    ctx.save();
    ctx.setLineDash([]);
    ctx.lineWidth = 2 / (scale || 1);
    ctx.strokeStyle = '#0d1d1e';
    ctx.fillStyle = '#fcee6b';
    ctx.globalAlpha = 1;
    ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
    [[b.x - 4, b.y - 4], [b.x + b.w + 4, b.y - 4], [b.x - 4, b.y + b.h + 4], [b.x + b.w + 4, b.y + b.h + 4]]
      .forEach(function (p) {
        ctx.beginPath();
        ctx.rect(p[0] - hs / 2, p[1] - hs / 2, hs, hs);
        ctx.fill(); ctx.stroke();
      });
    ctx.restore();
  }

  /* -------- hit testing -------- */
  function distToSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    var t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function pointInPoly(px, py, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
      var xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function hit(s, x, y) {
    var tol = Math.max(8, s.sw + 6);
    if (s.type === 'line' || s.type === 'arrow') {
      return distToSeg(x, y, s.x, s.y, s.x + s.w, s.y + s.h) <= tol;
    }
    if (s.type === 'free') {
      for (var i = 0; i < s.pts.length - 2; i += 2) {
        if (distToSeg(x, y, s.pts[i], s.pts[i + 1], s.pts[i + 2], s.pts[i + 3]) <= tol) return true;
      }
      return false;
    }
    var b = bbox(s);
    if (s.type === 'text') return x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 4 && y <= b.y + b.h + 4;
    if (s.fill && s.fill !== 'transparent') {
      if (s.type === 'ellipse') {
        var ex = (x - (b.x + b.w / 2)) / (b.w / 2 || 1), ey = (y - (b.y + b.h / 2)) / (b.h / 2 || 1);
        if (ex * ex + ey * ey <= 1) return true;
      } else if (s.type === 'diamond') {
        if (pointInPoly(x, y, [b.x + b.w / 2, b.y, b.x + b.w, b.y + b.h / 2, b.x + b.w / 2, b.y + b.h, b.x, b.y + b.h / 2])) return true;
      } else if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return true;
    }
    var edges = [
      [b.x, b.y, b.x + b.w, b.y], [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
      [b.x + b.w, b.y + b.h, b.x, b.y + b.h], [b.x, b.y + b.h, b.x, b.y]
    ];
    for (var e = 0; e < edges.length; e++) {
      if (distToSeg(x, y, edges[e][0], edges[e][1], edges[e][2], edges[e][3]) <= tol) return true;
    }
    return false;
  }

  function pick(shapes, x, y) {
    for (var i = shapes.length - 1; i >= 0; i--) if (hit(shapes[i], x, y)) return shapes[i];
    return null;
  }

  function handleAt(s, x, y) {
    var b = bbox(s), r = 10;
    var pts = [
      { k: 'nw', x: b.x, y: b.y }, { k: 'ne', x: b.x + b.w, y: b.y },
      { k: 'sw', x: b.x, y: b.y + b.h }, { k: 'se', x: b.x + b.w, y: b.y + b.h }
    ];
    for (var i = 0; i < pts.length; i++) {
      if (Math.abs(x - pts[i].x) <= r && Math.abs(y - pts[i].y) <= r) return pts[i].k;
    }
    return null;
  }

  function resize(s, handle, dx, dy) {
    if (s.type === 'free') return;
    var b = bbox(s);
    if (handle.indexOf('n') > -1) { s.y += dy; s.h -= dy; }
    if (handle.indexOf('s') > -1) { s.h += dy; }
    if (handle.indexOf('w') > -1) { s.x += dx; s.w -= dx; }
    if (handle.indexOf('e') > -1) { s.w += dx; }
    if (s.type !== 'text') { s.w = Math.max(s.w, 12); s.h = Math.max(s.h, 12); }
  }

  function translate(s, dx, dy) {
    if (s.type === 'free') {
      for (var i = 0; i < s.pts.length; i += 2) { s.pts[i] += dx; s.pts[i + 1] += dy; }
    } else { s.x += dx; s.y += dy; }
  }

  function clone(s) {
    var c = JSON.parse(JSON.stringify(s));
    c.id = id();
    if (c.type === 'free') c.pts = c.pts.slice();
    return c;
  }

  function drawAll(ctx, shapes, view, opts) {
    opts = opts || {};
    for (var i = 0; i < shapes.length; i++) drawShape(ctx, shapes[i]);
    if (opts.selection) drawHandles(ctx, opts.selection, view ? view.scale : 1);
  }

  function drawGrid(ctx, w, h, view, color) {
    var step = 24 * (view ? view.scale : 1);
    if (step < 8) return;
    var ox = (view ? view.x : 0) % step, oy = (view ? view.y : 0) % step;
    ctx.save();
    ctx.fillStyle = color || 'rgba(13,29,30,.2)';
    for (var x = ox; x < w; x += step) for (var y = oy; y < h; y += step) {
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.restore();
  }

  /* sample starter board for the landing demo */
  function starter() {
    return [
      { type: 'rect', x: 48, y: 56, w: 168, h: 104, stroke: '#0d1d1e', fill: '#a5e5fa', sw: 3.5, radius: 10, text: '', opacity: 1, dash: 'solid' },
      { type: 'ellipse', x: 300, y: 62, w: 116, h: 116, stroke: '#0d1d1e', fill: '#fcee6b', sw: 3.5, opacity: 1, dash: 'solid' },
      { type: 'arrow', x: 224, y: 112, w: 62, h: 0, stroke: '#0d1d1e', fill: 'transparent', sw: 3.5, opacity: 1, dash: 'solid' },
      { type: 'rect', x: 300, y: 216, w: 172, h: 78, stroke: '#0d1d1e', fill: '#35c46b', sw: 3.5, radius: 10, opacity: 1, dash: 'solid' },
      { type: 'free', pts: [56, 236, 96, 208, 140, 254, 186, 214, 236, 250], stroke: '#0d1d1e', sw: 4, fill: 'transparent', opacity: 1, dash: 'solid' }
    ].map(function (s) {
      s.id = id(); s.text = s.text || ''; s.fs = 24;
      return s;
    });
  }

  return {
    id: id, defaults: defaults, bbox: bbox, norm: norm,
    drawShape: drawShape, drawAll: drawAll, drawGrid: drawGrid, drawHandles: drawHandles,
    hit: hit, pick: pick, handleAt: handleAt, resize: resize, translate: translate,
    clone: clone, starter: starter
  };
})();
