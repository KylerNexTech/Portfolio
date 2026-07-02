/* ==========================================================================
   THEME — dark / light mode
   --------------------------------------------------------------------------
   The actual theme attribute is set as early as possible by the inline
   script in each HTML <head> (to avoid a flash of the wrong theme). This
   file just keeps the settings-panel switch in sync and handles toggling.
   ========================================================================== */

var Theme = (function () {
  var STORAGE_KEY = 'portfolio:theme';

  function current() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function set(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage unavailable, theme still applies for this load */ }
    apply(theme);
    updateSwitch();
  }

  function toggle() {
    set(current() === 'dark' ? 'light' : 'dark');
  }

  function updateSwitch() {
    var btn = document.getElementById('darkModeSwitch');
    if (!btn) return;
    btn.setAttribute('aria-checked', String(current() === 'dark'));
  }

  function init() {
    updateSwitch();
    var btn = document.getElementById('darkModeSwitch');
    if (btn) {
      btn.addEventListener('click', function () {
        toggle();
        if (typeof Sound !== 'undefined') Sound.playBlip();
      });
    }
  }

  return { init: init, toggle: toggle, set: set, current: current };
})();
