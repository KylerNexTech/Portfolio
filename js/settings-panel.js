/* ==========================================================================
   SETTINGS PANEL — open/close, focus trap, Escape to close
   ========================================================================== */

var SettingsPanel = (function () {
  var panel, overlay, toggleBtn, closeBtn, lastFocused;

  function open() {
    lastFocused = document.activeElement;
    panel.classList.add('is-open');
    overlay.classList.add('is-open');
    panel.inert = false;
    overlay.inert = false;
    toggleBtn.setAttribute('aria-expanded', 'true');

    var firstFocusable = panel.querySelector('button, a[href], [tabindex]');
    if (firstFocusable) firstFocusable.focus();

    document.addEventListener('keydown', onKeydown);
    if (typeof Sound !== 'undefined') Sound.playGlitch();
  }

  function close() {
    panel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    panel.inert = true;
    overlay.inert = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'Tab') trapFocus(e);
  }

  function trapFocus(e) {
    var focusable = panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function init() {
    panel = document.getElementById('settingsPanel');
    overlay = document.getElementById('settingsOverlay');
    toggleBtn = document.getElementById('settingsToggle');
    closeBtn = document.getElementById('settingsClose');
    if (!panel || !overlay || !toggleBtn) return;

    toggleBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
  }

  return { init: init, open: open, close: close };
})();
