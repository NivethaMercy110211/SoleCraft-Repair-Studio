/* ============================================================
   SoleCraft — gallery.js
   Before/after slider, filter system, lightbox
   ============================================================ */

(function () {
  'use strict';

  /* ── Gallery Filter System ───────────────────────────────── */
  const filterBtns   = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid  = document.querySelector('.gallery-grid');
  const galleryEmpty = document.getElementById('gallery-empty');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visibleCount = 0;

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeInItem 0.35s ease forwards';
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      if (galleryGrid) {
        galleryGrid.setAttribute('data-visible-count', visibleCount);
      }

      if (galleryEmpty) {
        galleryEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  /* ── Before/After Slider ─────────────────────────────────── */
  function initBASlider(container) {
    const before    = container.querySelector('.ba-before');
    const handle    = container.querySelector('.ba-handle');
    let isDragging  = false;
    let currentPct  = 50;

    function setPosition(pct) {
      const clamped = Math.max(2, Math.min(98, pct));
      currentPct = clamped;
      before.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left = `${clamped}%`;
    }

    function getPercent(e, rect) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onStart(e) {
      isDragging = true;
      container.classList.add('dragging');
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      setPosition(getPercent(e, rect));
    }

    function onEnd() {
      isDragging = false;
      container.classList.remove('dragging');
    }

    // Mouse
    container.addEventListener('mousedown',  onStart);
    window.addEventListener('mousemove',     onMove);
    window.addEventListener('mouseup',       onEnd);

    // Touch
    container.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove',     onMove,  { passive: false });
    window.addEventListener('touchend',      onEnd);

    // Keyboard (when container is focused)
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') setPosition(currentPct - 5);
      if (e.key === 'ArrowRight') setPosition(currentPct + 5);
    });

    // Init at 50%
    setPosition(50);
  }

  document.querySelectorAll('.ba-container').forEach(initBASlider);

  /* ── Lightbox ────────────────────────────────────────────── */
  const lightbox      = document.querySelector('.sc-lightbox');
  const lightboxClose = document.querySelector('.sc-lightbox-close');
  const lightboxSlider = lightbox?.querySelector('.sc-lightbox-slider');
  const lightboxTitle  = lightbox?.querySelector('.sc-lightbox-title');
  const lightboxDesc   = lightbox?.querySelector('.sc-lightbox-desc');

  function openLightbox(btn) {
    if (!lightbox) return;

    const card   = btn.closest('.gallery-card');
    const ba     = card.querySelector('.ba-container');
    const before = ba.querySelector('.ba-before img')?.src;
    const after  = ba.querySelector('.ba-after img')?.src;
    const title  = card.querySelector('.gallery-card-label')?.textContent;
    const desc   = card.querySelector('.gallery-card-desc')?.textContent;

    if (lightboxSlider) {
      lightboxSlider.innerHTML = `
        <div class="ba-container" style="height:400px;">
          <div class="ba-after">
            <img src="${after || ''}" alt="After repair">
          </div>
          <div class="ba-before">
            <img src="${before || ''}" alt="Before repair">
          </div>
          <div class="ba-handle">
            <div class="ba-handle-knob"><i class="bi bi-chevron-expand" style="transform:rotate(90deg)"></i></div>
          </div>
          <span class="ba-label before">Before</span>
          <span class="ba-label after">After</span>
        </div>
      `;
      const newSlider = lightboxSlider.querySelector('.ba-container');
      if (newSlider) initBASlider(newSlider);
    }

    if (lightboxTitle) lightboxTitle.textContent = title || '';
    if (lightboxDesc)  lightboxDesc.textContent  = desc  || '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(btn));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

})();
