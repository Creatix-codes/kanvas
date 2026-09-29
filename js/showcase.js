/* ============================================================
   KANVAS — showcase.js  (landing "What you can make" grid)
   ============================================================ */
(function () {
  'use strict';
  var S = Kanvas.split;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init() {
    var grid = document.getElementById('showcaseGrid');
    if (!grid || grid.dataset.done) return;
    grid.dataset.done = '1';

    var items = (window.DOCS && window.DOCS.examples) ? window.DOCS.examples : [];
    grid.innerHTML = items.map(function (g) {
      return '<a class="gcard" href="#/docs" data-reveal>' +
        '<div class="gcard__art"><span class="gcard__tag">' + esc(g.tag) + '</span>' +
          Kanvas.diagram.gallery(g.kind) + '</div>' +
        '<div class="gcard__body"><h3>' + esc(g.title) + '</h3><p>' + esc(g.desc) + '</p></div>' +
        '<span class="gcard__go"><i class="ph ph-arrow-up-right"></i></span>' +
      '</a>';
    }).join('');

    S.stagger(grid, '.gcard', 80);
    S.observeReveal(grid);
  }

  Kanvas.showcase = { init: init };
})();
