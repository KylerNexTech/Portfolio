/* ==========================================================================
   NAV — mobile menu, page transitions, back to top
   ========================================================================== */

var Nav = (function () {
  function initMobileToggle() {
    var toggle = document.getElementById('navToggle');
    var list = document.getElementById('siteNavList');
    if (!toggle || !list) return;

    toggle.addEventListener('click', function () {
      var isOpen = list.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (typeof Sound !== 'undefined') Sound.playBlip();
    });

    list.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        list.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Any internal link marked [data-nav-link] gets a brief glitch-out before
  // the browser actually navigates. Middle-click, ctrl/cmd-click, external
  // links, "#" anchors, and mailto: links are left completely alone.
  function initPageTransitions() {
    var links = document.querySelectorAll('[data-nav-link]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

        var url;
        try { url = new URL(href, window.location.href); } catch (err) { return; }
        if (url.origin !== window.location.origin) return;

        e.preventDefault();
        document.body.classList.add('is-leaving');
        if (typeof Sound !== 'undefined') Sound.playBlip();
        setTimeout(function () { window.location.href = href; }, 260);
      });
    });
  }

  function initActiveLink() {
    var current = window.location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('.site-nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function init() {
    initMobileToggle();
    initPageTransitions();
    initActiveLink();
    initBackToTop();
  }

  return { init: init };
})();
