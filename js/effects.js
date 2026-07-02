/* ==========================================================================
   EFFECTS — text scramble, ambient glitch pulses, typewriter
   --------------------------------------------------------------------------
   Public API:
     Effects.init()                        wires up everything on the page
     Effects.TextScramble(el)              reusable scramble-text class
     Effects.typewriter(el, lines, opts)   cycling typewriter effect
     Effects.escapeHtml(str)               small shared helper
   ========================================================================== */

var Effects = (function () {
  var CHARS = '!<>-_\\/[]{}—=+*^?#0123456789';

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function randomString(length) {
    var out = '';
    for (var i = 0; i < length; i++) out += randomChar();
    return out;
  }

  /* ---- TextScramble ----
     Animates an element's text from its current content to a new string,
     cycling random characters in between. Used both for the one-off
     "scramble in" reveal and for continuously cycling words (hero role). */
  function TextScramble(el) {
    this.el = el;
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  TextScramble.prototype.setText = function (newText) {
    var oldText = this.el.textContent;
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function (resolve) { this.resolve = resolve; }.bind(this));

    this.queue = [];
    for (var i = 0; i < length; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 20);
      var end = start + Math.floor(Math.random() * 20) + 10;
      this.queue.push({ from: from, to: to, start: start, end: end, char: '' });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  };

  TextScramble.prototype.update = function () {
    var output = '';
    var complete = 0;

    for (var i = 0; i < this.queue.length; i++) {
      var item = this.queue[i];
      if (this.frame >= item.end) {
        complete++;
        output += escapeHtml(item.to);
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = randomChar();
        }
        output += '<span class="scramble-char">' + escapeHtml(item.char) + '</span>';
      } else {
        output += escapeHtml(item.from);
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      if (this.resolve) this.resolve();
    } else {
      this.frame++;
      this.frameRequest = requestAnimationFrame(this.update);
    }
  };

  /* ---- Scramble-in on scroll into view ----
     Applies to any element with a [data-scramble] attribute. Seeds a
     same-length random string as the starting point (never blanks real
     content, so it degrades safely if JS is slow or an error occurs). */
  function scrambleInView() {
    var els = document.querySelectorAll('[data-scramble]');
    if (!els.length || typeof IntersectionObserver === 'undefined') return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var text = el.textContent;
        var fx = new TextScramble(el);
        fx.el.textContent = randomString(text.length);
        fx.setText(text);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Ambient periodic glitch pulses on .glitch elements ---- */
  function ambientGlitchPulses() {
    var targets = document.querySelectorAll('.glitch');
    targets.forEach(function (el) {
      function trigger() {
        el.classList.add('is-active');
        setTimeout(function () { el.classList.remove('is-active'); }, 420);
        setTimeout(trigger, 4000 + Math.random() * 5000);
      }
      setTimeout(trigger, 600 + Math.random() * 800);
    });
  }

  /* ---- Typewriter: types a line, pauses, erases, moves to next line ---- */
  function typewriter(el, lines, opts) {
    if (!el || !lines || !lines.length) return;
    opts = opts || {};
    var typeSpeed = opts.typeSpeed || 45;
    var pause = opts.pause || 2200;
    var lineIndex = 0;

    function typeLine() {
      var line = lines[lineIndex % lines.length];
      var charIndex = 0;
      el.textContent = '';
      (function type() {
        if (charIndex <= line.length) {
          el.textContent = line.slice(0, charIndex);
          charIndex++;
          setTimeout(type, typeSpeed + Math.random() * 30);
        } else {
          lineIndex++;
          setTimeout(eraseLine, pause);
        }
      })();
    }

    function eraseLine() {
      var current = el.textContent;
      var charIndex = current.length;
      (function erase() {
        if (charIndex >= 0) {
          el.textContent = current.slice(0, charIndex);
          charIndex--;
          setTimeout(erase, 18);
        } else {
          setTimeout(typeLine, 400);
        }
      })();
    }

    typeLine();
  }

  function init() {
    scrambleInView();
    ambientGlitchPulses();
  }

  return { init: init, TextScramble: TextScramble, typewriter: typewriter, escapeHtml: escapeHtml };
})();
