/* ==========================================================================
   SOUND
   --------------------------------------------------------------------------
   Every sound on this site is synthesized with the Web Audio API — there
   are no audio files to load or replace. This fits the glitch theme (short
   digital blips and noise bursts are easy to generate) and keeps the
   project dependency-free.

   Public API: Sound.init(), Sound.playBlip(), Sound.playGlitch()
   ========================================================================== */

var Sound = (function () {
  var SFX_KEY = 'portfolio:sfx';
  var MUSIC_KEY = 'portfolio:music';

  var ctx = null;
  var musicNodes = null;
  var musicGain = null;

  function getSfxEnabled() {
    var v = null;
    try { v = localStorage.getItem(SFX_KEY); } catch (e) {}
    return v === null ? true : v === 'true';
  }
  function getMusicEnabled() {
    var v = null;
    try { v = localStorage.getItem(MUSIC_KEY); } catch (e) {}
    return v === null ? false : v === 'true';
  }
  function persist(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (e) {}
  }
  function updateSwitch(id, val) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('aria-checked', String(val));
  }

  function setSfxEnabled(val) {
    persist(SFX_KEY, val);
    updateSwitch('sfxSwitch', val);
  }
  function setMusicEnabled(val) {
    persist(MUSIC_KEY, val);
    updateSwitch('musicSwitch', val);
    if (val) startMusic(); else stopMusic();
  }

  function ensureContext() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Short click/tick — used for nav, buttons, toggles.
  function playBlip() {
    if (!getSfxEnabled()) return;
    var c = ensureContext();
    if (!c) return;
    var t0 = c.currentTime;

    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(680, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.09);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.06, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.12);
  }

  // Noise burst + tone stab — used for opening panels/modals, bigger moments.
  function playGlitch() {
    if (!getSfxEnabled()) return;
    var c = ensureContext();
    if (!c) return;
    var t0 = c.currentTime;

    var bufferSize = Math.floor(c.sampleRate * 0.15);
    var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    var noise = c.createBufferSource();
    noise.buffer = buffer;
    var bandpass = c.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1800, t0);
    bandpass.frequency.exponentialRampToValueAtTime(400, t0 + 0.15);
    var noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(0.12, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    noise.connect(bandpass).connect(noiseGain).connect(c.destination);
    noise.start(t0);
    noise.stop(t0 + 0.16);

    var osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t0);
    var oscGain = c.createGain();
    oscGain.gain.setValueAtTime(0.05, t0);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    osc.connect(oscGain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.12);
  }

  // Quiet three-oscillator ambient pad with slow detune drift.
  function startMusic() {
    if (!getMusicEnabled()) return;
    var c = ensureContext();
    if (!c || musicNodes) return;

    var now = c.currentTime;
    musicGain = c.createGain();
    musicGain.gain.setValueAtTime(0, now);
    musicGain.connect(c.destination);
    musicGain.gain.linearRampToValueAtTime(0.045, now + 2);

    var baseFreqs = [110, 164.81, 220]; // A2, E3, A3
    musicNodes = baseFreqs.map(function (freq, i) {
      var osc = c.createOscillator();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.value = freq;

      var lfo = c.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      var lfoGain = c.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start();

      var gain = c.createGain();
      gain.gain.value = 0.33;
      osc.connect(gain).connect(musicGain);
      osc.start();
      return { osc: osc, lfo: lfo, gain: gain };
    });
  }

  function stopMusic() {
    if (!musicNodes || !ctx) return;
    var now = ctx.currentTime;
    if (musicGain) {
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setValueAtTime(musicGain.gain.value, now);
      musicGain.gain.linearRampToValueAtTime(0, now + 0.8);
    }
    var nodesToStop = musicNodes;
    setTimeout(function () {
      nodesToStop.forEach(function (n) {
        try { n.osc.stop(); n.lfo.stop(); } catch (e) {}
      });
    }, 900);
    musicNodes = null;
  }

  // Browsers require a user gesture before audio can play — this listens once.
  function unlock() {
    ensureContext();
    if (getMusicEnabled()) startMusic();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  }

  function init() {
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    updateSwitch('sfxSwitch', getSfxEnabled());
    updateSwitch('musicSwitch', getMusicEnabled());

    var sfxBtn = document.getElementById('sfxSwitch');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', function () {
        var next = !getSfxEnabled();
        setSfxEnabled(next);
        if (next) playBlip();
      });
    }

    var musicBtn = document.getElementById('musicSwitch');
    if (musicBtn) {
      musicBtn.addEventListener('click', function () {
        var next = !getMusicEnabled();
        setMusicEnabled(next);
        playBlip();
      });
    }
  }

  return { init: init, playBlip: playBlip, playGlitch: playGlitch };
})();
