/* ==========================================================================
   CAROUSEL — projects page only
   --------------------------------------------------------------------------
   Renders project cards from the PROJECTS array (js/data.js), and handles:
     - native scroll-snap + drag-to-scroll (mouse) + wheel-to-horizontal
     - prev/next arrows and a progress bar
     - keyboard navigation between cards
     - a detail modal, deep-linkable via #project-id in the URL
   ========================================================================== */

var Carousel = (function () {
  var track, prevBtn, nextBtn, progressFill;
  var modalOverlay, modal, modalContent, modalClose, lastFocused;

  var isDragging = false;
  var dragMoved = false;
  var dragStartX = 0;
  var dragStartScroll = 0;

  function renderCards() {
    if (!track || typeof PROJECTS === 'undefined') return;
    var esc = Effects.escapeHtml;

    track.innerHTML = PROJECTS.map(function (p, i) {
      var visualClass = i % 2 === 0 ? 'a' : 'b';
      var tags = p.tags.slice(0, 3).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
      return (
        '<article class="project-card" data-id="' + esc(p.id) + '" tabindex="0" role="button" aria-label="View details for ' + esc(p.title) + '">' +
          '<div class="project-card__visual project-card__visual--' + visualClass + '" aria-hidden="true">' +
            '<span class="project-card__index">' + String(i + 1).padStart(2, '0') + '</span>' +
          '</div>' +
          '<div class="project-card__body">' +
            '<h3 class="project-card__title">' + esc(p.title) + '</h3>' +
            '<p class="project-card__tagline">' + esc(p.tagline) + '</p>' +
            '<ul class="project-card__tags">' + tags + '</ul>' +
          '</div>' +
          '<span class="project-card__cta">Dive in →</span>' +
        '</article>'
      );
    }).join('');
  }

  function scrollByCards(direction) {
    var card = track.querySelector('.project-card');
    if (!card) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    var amount = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
  }

  function updateProgress() {
    if (!progressFill) return;
    var maxScroll = track.scrollWidth - track.clientWidth;
    var pct = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
    progressFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  // Mouse-only drag-to-scroll. Touch devices already get smooth native
  // scrolling + scroll-snap, so we deliberately don't touch touch input.
  function initDrag() {
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 5) dragMoved = true;
      track.scrollLeft = dragStartScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      isDragging = false;
      track.classList.remove('is-dragging');
    });
  }

  // Lets a normal vertical mouse wheel drive the horizontal carousel, but
  // releases control back to page scroll once the carousel hits either end.
  function initWheel() {
    track.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var atStart = track.scrollLeft <= 0;
      var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  function initCardActivation() {
    track.addEventListener('click', function (e) {
      if (dragMoved) { dragMoved = false; return; }
      var card = e.target.closest('.project-card');
      if (card) openProject(card.dataset.id);
    });

    track.addEventListener('keydown', function (e) {
      var card = e.target.closest('.project-card');
      if (!card) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProject(card.dataset.id);
      } else if (e.key === 'ArrowRight' && card.nextElementSibling) {
        e.preventDefault();
        card.nextElementSibling.focus();
        card.nextElementSibling.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else if (e.key === 'ArrowLeft' && card.previousElementSibling) {
        e.preventDefault();
        card.previousElementSibling.focus();
        card.previousElementSibling.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  function renderModalContent(project) {
    var esc = Effects.escapeHtml;
    var tags = project.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var liveLink = project.liveUrl ? '<a class="btn btn--primary" href="' + esc(project.liveUrl) + '" target="_blank" rel="noopener noreferrer">Live Site</a>' : '';
    var codeLink = project.codeUrl ? '<a class="btn btn--ghost" href="' + esc(project.codeUrl) + '" target="_blank" rel="noopener noreferrer">Source Code</a>' : '';

    modalContent.innerHTML =
      '<p class="project-modal__eyebrow">' + esc(project.year) + ' — ' + esc(project.role) + '</p>' +
      '<h2 id="projectModalTitle" class="project-modal__title glitch is-active" data-text="' + esc(project.title) + '">' + esc(project.title) + '</h2>' +
      '<p class="project-modal__tagline">' + esc(project.tagline) + '</p>' +
      '<ul class="project-modal__tags">' + tags + '</ul>' +
      '<p class="project-modal__desc">' + esc(project.description) + '</p>' +
      '<div class="project-modal__links">' + liveLink + codeLink + '</div>';

    setTimeout(function () {
      var titleEl = document.getElementById('projectModalTitle');
      if (titleEl) titleEl.classList.remove('is-active');
    }, 450);
  }

  function openProject(id) {
    if (typeof PROJECTS === 'undefined') return;
    var project = PROJECTS.filter(function (p) { return p.id === id; })[0];
    if (!project) return;

    lastFocused = document.activeElement;
    renderModalContent(project);

    modalOverlay.classList.add('is-open');
    modalOverlay.inert = false;
    modal.classList.add('is-glitch-in');
    setTimeout(function () { modal.classList.remove('is-glitch-in'); }, 400);

    if (modalClose) modalClose.focus();
    document.addEventListener('keydown', onModalKeydown);
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    if (typeof Sound !== 'undefined') Sound.playGlitch();
  }

  function closeProject() {
    modalOverlay.classList.remove('is-open');
    modalOverlay.inert = true;
    document.removeEventListener('keydown', onModalKeydown);
    try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') { closeProject(); return; }
    if (e.key === 'Tab') trapModalFocus(e);
  }

  function trapModalFocus(e) {
    var focusable = modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
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

  function openFromHash() {
    var id = window.location.hash.replace('#', '');
    if (!id || typeof PROJECTS === 'undefined') return;
    var exists = PROJECTS.some(function (p) { return p.id === id; });
    if (exists) setTimeout(function () { openProject(id); }, 100);
  }

  function init() {
    track = document.getElementById('carousel');
    prevBtn = document.getElementById('carouselPrev');
    nextBtn = document.getElementById('carouselNext');
    progressFill = document.getElementById('carouselProgressFill');
    modalOverlay = document.getElementById('projectModalOverlay');
    modal = document.getElementById('projectModal');
    modalContent = document.getElementById('projectModalContent');
    modalClose = document.getElementById('projectModalClose');
    if (!track) return;

    renderCards();
    initDrag();
    initWheel();
    initCardActivation();

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollByCards(-1); if (typeof Sound !== 'undefined') Sound.playBlip(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollByCards(1); if (typeof Sound !== 'undefined') Sound.playBlip(); });
    track.addEventListener('scroll', updateProgress);
    updateProgress();

    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeProject();
      });
    }
    if (modalClose) modalClose.addEventListener('click', closeProject);

    openFromHash();
  }

  return { init: init };
})();
