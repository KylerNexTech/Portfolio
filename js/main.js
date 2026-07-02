/* ==========================================================================
   MAIN — runs on every page. Wires up shared modules, then dispatches to
   whichever page-specific logic applies, based on <body data-page="...">.

   Adding a new page later? Add a new `if (page === 'your-page') { ... }`
   block at the bottom of init().
   ========================================================================== */

function renderFeaturedProjects() {
  var el = document.getElementById('featuredProjects');
  if (!el || typeof PROJECTS === 'undefined') return;
  var esc = Effects.escapeHtml;
  var featured = PROJECTS.slice(0, 3);

  el.innerHTML = featured.map(function (p, i) {
    return (
      '<a class="feature-card" href="projects.html#' + esc(p.id) + '" data-nav-link>' +
        '<span class="feature-card__index">0' + (i + 1) + '</span>' +
        '<h3 class="feature-card__title">' + esc(p.title) + '</h3>' +
        '<p class="feature-card__tagline">' + esc(p.tagline) + '</p>' +
        '<span class="feature-card__tags">' + p.tags.slice(0, 2).map(esc).join(' · ') + '</span>' +
      '</a>'
    );
  }).join('');

  // Newly-injected links need the glitch page-transition wired up too.
  if (typeof Nav !== 'undefined') Nav.init();
}

function initRoleCycle() {
  var el = document.getElementById('roleCycle');
  if (!el || typeof Effects === 'undefined' || typeof ROLES === 'undefined' || !ROLES.length) return;

  var fx = new Effects.TextScramble(el);
  var index = 0;

  function cycle() {
    fx.setText(ROLES[index]).then(function () {
      index = (index + 1) % ROLES.length;
      setTimeout(cycle, 2600);
    });
  }
  cycle();
}

function initTerminalThoughts() {
  var el = document.getElementById('terminalText');
  if (!el || typeof Effects === 'undefined' || typeof THOUGHTS === 'undefined') return;
  Effects.typewriter(el, THOUGHTS);
}

document.addEventListener('DOMContentLoaded', function () {
  if (typeof Theme !== 'undefined') Theme.init();
  if (typeof Sound !== 'undefined') Sound.init();
  if (typeof Nav !== 'undefined') Nav.init();
  if (typeof SettingsPanel !== 'undefined') SettingsPanel.init();

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var page = document.body.dataset.page;

  if (page === 'home') {
    renderFeaturedProjects();
    initRoleCycle();
    initTerminalThoughts();
  }

  if (page === 'projects' && typeof Carousel !== 'undefined') {
    Carousel.init();
  }

  // Effects.init() runs last so [data-scramble] / .glitch pick up
  // any content the page-specific code above just rendered.
  if (typeof Effects !== 'undefined') Effects.init();
});
