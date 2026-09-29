/* ============================================================
   KANVAS — diagram.js
   Small SVG generators for editorial visuals, action demos,
   the tool canvas and the showcase gallery.
   ============================================================ */
window.Kanvas = window.Kanvas || {};
Kanvas.diagram = (function () {
  'use strict';

  var INK = '#0d1d1e', SKY = '#a5e5fa', SUN = '#fcee6b', GRASS = '#35c46b', PAPER = '#f5f2ea', WHITE = '#fffdf8';

  function svg(vb, body, extra) {
    return '<svg viewBox="' + vb + '" fill="none" xmlns="http://www.w3.org/2000/svg" ' + (extra || '') + '>' + body + '</svg>';
  }
  function dotGrid(x0, y0, x1, y1, step) {
    var out = '', x, y;
    for (x = x0; x <= x1; x += step) for (y = y0; y <= y1; y += step)
      out += '<circle cx="' + x + '" cy="' + y + '" r=".9" fill="rgba(13,29,30,.24)"/>';
    return out;
  }

  /* ---------------- editorial visuals ---------------- */
  var illust = {
    idea: function () {
      return svg('0 0 260 180',
        dotGrid(10, 10, 250, 170, 20) +
        '<rect x="26" y="34" width="96" height="62" rx="8" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M44 58h60M44 74h36" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="186" cy="72" r="34" fill="' + SUN + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M174 72h24M186 60v24" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M126 66h22" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 11"/>' +
        '<rect x="44" y="118" width="70" height="40" rx="8" fill="' + SKY + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M140 138h58" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M154 152h34" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>');
    },
    shapes: function () {
      return svg('0 0 260 180',
        dotGrid(10, 10, 250, 170, 20) +
        '<rect x="24" y="34" width="76" height="52" rx="8" fill="' + SKY + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="172" cy="60" r="30" fill="' + SUN + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M118 60h24" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 9"/>' +
        '<path d="M60 122l30 30 30-30" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M150 116h72M150 140h48" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="146" y="106" width="84" height="48" rx="8" stroke="' + INK + '" stroke-width="4"/>');
    },
    pen: function () {
      return svg('0 0 260 180',
        dotGrid(10, 10, 250, 170, 20) +
        '<path d="M34 132c22-56 52-78 88-64 26 10 46 4 74-32" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M40 44c14 14 22 30 24 48" stroke="' + GRASS + '" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="150" y="88" width="84" height="56" rx="9" fill="' + SUN + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M166 112h52M166 128h32" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M96 150c14-8 30-8 44 0" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>');
    },
    faq: function () {
      return svg('0 0 260 180',
        dotGrid(10, 10, 250, 170, 20) +
        '<rect x="26" y="30" width="208" height="42" rx="10" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<circle cx="50" cy="51" r="8" fill="' + GRASS + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<path d="M70 51h120" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="26" y="86" width="208" height="64" rx="10" fill="' + SKY + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M46 108h164M46 128h96" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M212 66l10 14 10-14" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>');
    }
  };

  /* ---------------- action demo art ---------------- */
  var art = {
    drawRect: function () {
      return svg('0 0 340 150',
        dotGrid(12, 12, 328, 138, 17) +
        '<rect x="8" y="8" width="26" height="134" rx="6" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="14" y="16" width="14" height="14" rx="4" fill="' + SKY + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="58" y="40" width="150" height="76" rx="6" fill="none" stroke="' + INK + '" stroke-width="3" stroke-dasharray="7 7"/>' +
        '<path d="M206 116l6 14 6-9 7 11 6-5-7-11 9-2z" fill="' + INK + '"/>' +
        '<text x="133" y="132" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="' + INK + '">150 × 76</text>');
    },
    resultRect: function () {
      return svg('0 0 340 150',
        dotGrid(12, 12, 328, 138, 17) +
        '<rect x="8" y="8" width="26" height="134" rx="6" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="14" y="16" width="14" height="14" rx="4" fill="' + GRASS + '" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="58" y="40" width="150" height="76" rx="9" fill="' + SKY + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<text x="133" y="76" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="16" fill="' + INK + '">My Shape</text>' +
        '<text x="133" y="98" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12.5" fill="rgba(13,29,30,.62)">Click to select</text>' +
        [[54, 36], [204, 36], [54, 110], [204, 110]].map(function (p) {
          return '<rect x="' + (p[0] - 4) + '" y="' + (p[1] - 4) + '" width="8" height="8" rx="2" fill="' + INK + '"/>';
        }).join('') +
        '<rect x="52" y="34" width="158" height="84" rx="11" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 6" opacity=".55"/>');
    },
    historyBefore: function () {
      return svg('0 0 340 170',
        dotGrid(12, 12, 328, 158, 17) +
        '<text x="16" y="26" font-family="Fredoka,sans-serif" font-weight="600" font-size="13" letter-spacing="2" fill="rgba(13,29,30,.5)">BEFORE</text>' +
        '<rect x="26" y="44" width="78" height="48" rx="8" fill="' + SKY + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<text x="65" y="73" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="' + INK + '">Moved</text>' +
        '<rect x="128" y="44" width="78" height="48" rx="8" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-dasharray="6 6" opacity=".45"/>' +
        '<path d="M156 60l24 24M180 60l-24 24" stroke="rgba(13,29,30,.4)" stroke-width="4" stroke-linecap="round"/>' +
        '<text x="167" y="112" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12.5" fill="rgba(13,29,30,.62)">Deleted</text>' +
        '<rect x="230" y="44" width="78" height="48" rx="8" fill="' + SUN + '" stroke="' + INK + '" stroke-width="3.5" stroke-dasharray="6 6"/>' +
        '<text x="269" y="73" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="' + INK + '">Added</text>' +
        '<text x="269" y="112" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12.5" fill="rgba(13,29,30,.62)">staged</text>');
    },
    historyAfter: function () {
      return svg('0 0 340 170',
        dotGrid(12, 12, 328, 158, 17) +
        '<text x="16" y="26" font-family="Fredoka,sans-serif" font-weight="600" font-size="13" letter-spacing="2" fill="rgba(13,29,30,.5)">AFTER</text>' +
        '<rect x="26" y="44" width="78" height="48" rx="8" fill="' + GRASS + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<text x="65" y="73" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="' + INK + '">Restored</text>' +
        '<rect x="128" y="44" width="78" height="48" rx="8" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<path d="M156 68h24" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<text x="167" y="112" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12.5" fill="rgba(13,29,30,.62)">Redone</text>' +
        '<rect x="230" y="44" width="78" height="48" rx="8" fill="' + SKY + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<text x="269" y="73" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="' + INK + '">Saved</text>' +
        '<text x="269" y="112" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12.5" fill="rgba(13,29,30,.62)">local storage</text>');
    },
    toolCanvas: function () {
      var shapes =
        '<rect x="60" y="54" width="150" height="96" rx="10" fill="rgba(59,130,246,.09)" stroke="#3b82f6" stroke-width="4"/>' +
        '<text x="135" y="100" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="17" fill="#1e40af">My Shape</text>' +
        '<text x="135" y="124" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="13" fill="rgba(13,29,30,.6)">Click to select</text>' +
        '<circle cx="330" cy="96" r="52" fill="rgba(53,196,107,.14)" stroke="#22a356" stroke-width="4"/>' +
        '<path d="M218 100h56" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 10"/>' +
        '<path d="M424 60l24 24-24 24" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(-6,4)"/>' +
        '<path d="M390 72l40 40" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="450" y="46" width="132" height="66" rx="9" fill="' + SUN + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M466 70h100M466 90h64" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M60 190c40-40 96-48 148-24 34 16 72 14 116-14" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M316 146l14 8-4 15" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
      return svg('0 0 640 300', dotGrid(10, 10, 630, 290, 20) + shapes);
    }
  };

  /* ---------------- gallery boards ---------------- */
  function box(x, y, w, h, fill, stroke, rx) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 8) + '" fill="' + fill + '" stroke="' + (stroke || INK) + '" stroke-width="3"/>';
  }
  function line(d, dash) {
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"' + (dash ? ' stroke-dasharray="6 8"' : '') + '/>';
  }
  function label(x, y, t, size, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-family="Fredoka,sans-serif" font-weight="600" font-size="' + (size || 13) + '" fill="' + INK + '">' + t + '</text>';
  }
  function note(x, y, w, t) {
    return box(x, y, w, 34, SUN, INK, 6) + label(x + w / 2, y + 22, t, 12);
  }

  var gallery = {
    mind: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        line('M200 125 C150 80 120 70 90 60') + line('M200 125 C150 170 120 186 88 196') +
        line('M200 125 C255 80 285 72 316 62') + line('M200 125 C255 172 285 184 316 194') +
        box(160, 100, 80, 50, GRASS) + label(200, 131, 'Launch', 15) +
        box(34, 40, 96, 40, SKY) + label(82, 65, 'Marketing', 13) +
        box(32, 176, 96, 40, WHITE) + label(80, 201, 'Design', 13) +
        box(272, 42, 96, 40, WHITE) + label(320, 67, 'Engineering', 12.5) +
        box(274, 174, 96, 40, SKY) + label(322, 199, 'Launch day', 12.5) +
        note(24, 108, 84, 'Open q?'));
    },
    wire: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        box(36, 34, 96, 182, WHITE, INK, 12) +
        box(48, 50, 72, 26, SKY, INK, 6) + label(84, 68, 'Browse', 12) +
        box(48, 86, 72, 44, WHITE, INK, 6) + line('M58 100h52') + line('M58 114h34') +
        box(48, 140, 72, 44, WHITE, INK, 6) + line('M58 154h52') + line('M58 168h34') +
        box(152, 34, 96, 182, WHITE, INK, 12) +
        box(164, 50, 72, 40, SUN, INK, 6) +
        box(164, 100, 72, 60, WHITE, INK, 6) + label(200, 134, 'Lesson', 12) +
        box(164, 170, 72, 30, GRASS, INK, 6) + label(200, 190, 'Play', 12) +
        box(268, 34, 96, 182, WHITE, INK, 12) +
        box(280, 50, 72, 90, WHITE, INK, 6) +
        box(280, 152, 72, 48, SKY, INK, 6) + label(316, 181, 'Done', 12) +
        line('M136 125h12') + line('M252 125h12'));
    },
    flow: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        line('M96 62h60') + line('M196 62h60') +
        line('M320 84v46') + line('M280 152h-64') +
        box(24, 42, 72, 40, SKY) + label(60, 67, 'Sign up', 13) +
        box(112, 42, 72, 40, WHITE) + label(148, 67, 'Verify', 13) +
        box(200, 42, 72, 40, WHITE) + label(236, 67, 'Profile', 13) +
        box(284, 42, 72, 40, SUN) + label(320, 67, 'Tour', 13) +
        box(236, 130, 88, 44, WHITE) + label(280, 158, 'Skip', 13) +
        box(124, 130, 92, 44, GRASS) + label(170, 158, 'Dashboard', 13) +
        line('M280 174v28h-86v-28') +
        line('M170 102v28') + label(60, 220, 'Start', 12.5, 'start'));
    },
    matrix: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        '<path d="M60 30v180h300" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
        line('M60 120h300', true) + line('M210 30v180', true) +
        '<rect x="76" y="46" width="118" height="60" rx="6" fill="rgba(53,196,107,.14)" stroke="' + INK + '" stroke-width="3"/>' +
        label(135, 82, 'Quick wins', 13) +
        '<rect x="226" y="46" width="118" height="60" rx="6" fill="rgba(165,229,250,.5)" stroke="' + INK + '" stroke-width="3"/>' +
        label(285, 82, 'Big bets', 13) +
        '<rect x="76" y="132" width="118" height="64" rx="6" fill="rgba(252,238,107,.5)" stroke="' + INK + '" stroke-width="3"/>' +
        label(135, 170, 'Fill-ins', 13) +
        '<rect x="226" y="132" width="118" height="64" rx="6" fill="rgba(13,29,30,.06)" stroke="' + INK + '" stroke-width="3" stroke-dasharray="7 7"/>' +
        label(285, 170, 'Time sink', 13) +
        note(84, 54, 74, 'vote ×3') + note(236, 140, 82, 'sprint 4'));
    },
    tree: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        line('M200 60v26') + line('M200 118l-72 24') + line('M200 118l72 24') +
        line('M128 176l-40 22') + line('M128 176l40 22') +
        box(164, 34, 72, 40, GRASS) + label(200, 60, '8', 16) +
        box(92, 142, 72, 40, WHITE) + label(128, 168, '3', 16) +
        box(236, 142, 72, 40, WHITE) + label(272, 168, '13', 16) +
        box(52, 196, 60, 34, SKY) + label(82, 218, '1', 14) +
        box(132, 196, 60, 34, SKY) + label(162, 218, '6', 14) +
        '<text x="336" y="60" font-family="Caveat,cursive" font-size="26" fill="' + INK + '">O(log n)</text>' +
        line('M330 74c14 8 26 16 34 30'));
    },
    arch: function () {
      return svg('0 0 400 250',
        dotGrid(10, 10, 390, 240, 20) +
        box(140, 26, 120, 44, SKY) + label(200, 54, 'Client', 14) +
        line('M200 70v32') +
        box(140, 102, 120, 44, WHITE) + label(200, 130, 'API gateway', 13) +
        line('M150 146l-52 32') + line('M200 146v32') + line('M250 146l52 32') +
        box(46, 178, 92, 44, SUN) + label(92, 206, 'Auth', 13) +
        box(154, 178, 92, 44, GRASS) + label(200, 206, 'Boards', 13) +
        box(262, 178, 92, 44, WHITE) + label(308, 206, 'Export', 13) +
        '<circle cx="356" cy="46" r="18" fill="rgba(53,196,107,.2)" stroke="' + INK + '" stroke-width="3"/>' +
        label(356, 51, '✓', 15));
    }
  };

  return {
    illust: function (n) { return (illust[n] || illust.idea)(); },
    art: function (n) { return (art[n] || art.drawRect)(); },
    gallery: function (n) { return (gallery[n] || gallery.mind)(); }
  };
})();
