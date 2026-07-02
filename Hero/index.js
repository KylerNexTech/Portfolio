/* ------------------------------------------------------
   ELEMENTS
------------------------------------------------------- */
const heroImage   = document.getElementById('heroImage');
const hammer      = document.getElementById('hammerCursor');
const cracksSvg    = document.getElementById('cracksOverlay');
const burstLayer   = document.getElementById('burstLayer');
const countdownEl = document.getElementById('countdownValue');
const statusEl     = document.getElementById('statusHint');
const music        = document.getElementById('bgMusic');
const soundToggle  = document.getElementById('soundToggle');
const soundIcon    = document.getElementById('soundIcon');
const Mace = document.getElementById('Mace');
/* ------------------------------------------------------
   CONFIG (functionality pass — visuals/timings can be
   tuned freely, nothing else depends on these values)
------------------------------------------------------- */
const DESTINATION       = 'home.html'; // where to go after the swing sequence finishes

const COUNTDOWN_START   = 20;    // seconds before an idle hammer auto-swings
const CRACKS_ON_HIT     = 6;     // "a decent amount but not too many"

const WINDUP_ANGLE      = -42;   // degrees, rotated AWAY from the image (cocking back)
const SLAM_OVERSHOOT    = 14;    // degrees, rotated PAST the image (impact)

const WINDUP_DURATION   = 450;   // ms
const WINDUP_PAUSE      = 250;   // "wait a moment" before the slam
const SLAM_DURATION     = 130;   // ms — fast, like an actual strike
const SETTLE_DURATION   = 250;   // ms — hammer relaxes back after impact

const BURST_TOTAL_TIME  = 750;   // ms — matches the CSS burstExpand animation duration
const CRACK_DELAY       = 300;   // ms after the burst starts before cracks appear
const FINAL_PAUSE       = 700;   // ms after cracks before navigating to the destination page

/* ------------------------------------------------------
   STATE
------------------------------------------------------- */
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let facingAngle = 0;
let isAnimating = false;     // true for the whole windup -> slam -> burst -> crack sequence (cooldown lock)
let awaitingClick = true;    // true only while idle, waiting for a click or the countdown
let hasFinished = false;     // true once the single swing has happened, blocks further input
let countdownValue = COUNTDOWN_START;
let countdownTimer = null;

/* ------------------------------------------------------
   HELPERS
------------------------------------------------------- */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function imageCenter() {
  const rect = heroImage.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Keeps the hammer's head pointed at the image no matter where the cursor is.
function updateFacingAngle() {
  const c = imageCenter();
  const dx = c.x - mouseX;
  const dy = c.y - mouseY;
  facingAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
}

function renderHammer(offsetDeg) {
  hammer.style.left = mouseX + 'px';
  hammer.style.top  = mouseY + 'px';
  hammer.style.transform = `translate(-50%, -100%) rotate(${facingAngle + offsetDeg}deg)`;
}

/* ------------------------------------------------------
   MOUSE TRACKING
   We just record the latest coordinates on every move,
   and a continuous animation-frame loop is what actually
   repositions the hammer. This keeps tracking smooth and
   reliable regardless of anything else going on in the
   page (this fixes the hammer being stuck in place).
------------------------------------------------------- */
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener('resize', () => {
  if (!isAnimating) updateFacingAngle();
});

function trackingLoop() {
  if (!isAnimating) {
    updateFacingAngle();
    renderHammer(0);
  }
  requestAnimationFrame(trackingLoop);
}
requestAnimationFrame(trackingLoop);

/* ------------------------------------------------------
   CRACKS
------------------------------------------------------- */
function addCracks() {
  const rect = heroImage.getBoundingClientRect();
  cracksSvg.setAttribute('width', rect.width);
  cracksSvg.setAttribute('height', rect.height);
  cracksSvg.style.left = rect.left + 'px';
  cracksSvg.style.top = rect.top + 'px';
  cracksSvg.style.width = rect.width + 'px';
  cracksSvg.style.height = rect.height + 'px';

  for (let i = 0; i < CRACKS_ON_HIT; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generateCrackPath(rect.width, rect.height));
    path.setAttribute('stroke', 'rgba(255,255,255,0.6)');
    path.setAttribute('stroke-width', (1 + Math.random() * 1.5).toFixed(2));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.classList.add('crack-line');
    cracksSvg.appendChild(path);
  }
}

function generateCrackPath(w, h) {
  let x = Math.random() * w;
  let y = Math.random() * h;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  const segments = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < segments; i++) {
    x = Math.max(0, Math.min(w, x + (Math.random() - 0.5) * w * 0.25));
    y = Math.max(0, Math.min(h, y + (Math.random() - 0.5) * h * 0.25));
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/* ------------------------------------------------------
   WIND BURST
   A white cloud that appears at the point of impact,
   expands outward, and dissipates (fades) as it grows.
------------------------------------------------------- */
function triggerBurst() {
  const c = imageCenter();

  const cloud = document.createElement('div');
  cloud.className = 'burst-cloud';
  cloud.style.left = c.x + 'px';
  cloud.style.top = c.y + 'px';
  burstLayer.appendChild(cloud);

  cloud.addEventListener('animationend', () => cloud.remove());
}

/* ------------------------------------------------------
   COUNTDOWN
------------------------------------------------------- */
function updateCountdownDisplay() {
  countdownEl.textContent = countdownValue;
}

function startCountdown() {
  stopCountdown();
  countdownValue = COUNTDOWN_START;
  updateCountdownDisplay();
  countdownTimer = setInterval(() => {
    countdownValue--;
    updateCountdownDisplay();
    if (countdownValue <= 0) {
      stopCountdown();
      performSwing(); // time ran out — swing anyway
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

/* ------------------------------------------------------
   THE SWING SEQUENCE
   click -> wind back -> wait -> slam -> wind burst -> crack -> navigate
------------------------------------------------------- */
async function performSwing() {
  // Cooldown / one-shot lock: ignore anything once finished, mid-swing, or not waiting.
  if (hasFinished || isAnimating || !awaitingClick) return;

  isAnimating = true;
  awaitingClick = false;
  stopCountdown();
  statusEl.textContent = '';

  updateFacingAngle();
  const baseAngle = facingAngle; // lock the facing direction for this whole swing

  // Wind back (cock the hammer away from the image)
  hammer.style.transition = `transform ${WINDUP_DURATION}ms ease-in`;
  hammer.style.transform = `translate(-50%, -100%) rotate(${baseAngle + WINDUP_ANGLE}deg)`;
  await sleep(WINDUP_DURATION);
  await sleep(WINDUP_PAUSE); // wait a moment

  // Slam down (fast strike past the facing angle)
  hammer.style.transition = `transform ${SLAM_DURATION}ms cubic-bezier(0.6, 0, 0.9, 0.4)`;
  hammer.style.transform = `translate(-50%, -100%) rotate(${baseAngle + SLAM_OVERSHOOT}deg)`;
  await sleep(SLAM_DURATION);

  // PLAY THE MACE SOUND (respects the mute rule)
  if (!userMuted && Mace) {
    Mace.currentTime = 0;
    Mace.play().catch(() => {});
  }

  // Impact: wind burst cloud + hammer relaxing back, at the same time
  triggerBurst();
  hammer.style.transition = `transform ${SETTLE_DURATION}ms ease-out`;
  hammer.style.transform = `translate(-50%, -100%) rotate(${baseAngle}deg)`;

  await sleep(CRACK_DELAY);
  addCracks();

  await sleep(Math.max(0, BURST_TOTAL_TIME - CRACK_DELAY) + FINAL_PAUSE);

  hasFinished = true;
  window.location.href = DESTINATION;
}

document.addEventListener('click', () => {
  performSwing();
});

/* ------------------------------------------------------
   SOUND
------------------------------------------------------- */
const MUTED_ICON = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.8L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
const UNMUTED_ICON = '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';

let userMuted = false;
function setIcon(muted) { soundIcon.innerHTML = muted ? MUTED_ICON : UNMUTED_ICON; }
function tryPlay() {
  if (userMuted) return;
  music.play().catch(() => {});
}
tryPlay();
function startOnFirstInteraction() {
  tryPlay();
  document.removeEventListener('pointerdown', startOnFirstInteraction);
  document.removeEventListener('keydown', startOnFirstInteraction);
}
document.addEventListener('pointerdown', startOnFirstInteraction);
document.addEventListener('keydown', startOnFirstInteraction);
setIcon(false);
soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  userMuted = !userMuted;
  if (userMuted) { music.pause(); } else { tryPlay(); }
  setIcon(userMuted);
});

/* ------------------------------------------------------
   INIT
------------------------------------------------------- */
updateFacingAngle();
renderHammer(0);
startCountdown();

