/* ============================================================
   SoleCraft — pricing.js
   Pricing tab filter, table/card mode toggle
   ============================================================ */

(function () {
  'use strict';

  /* ── Pricing Category Tab Filter ─────────────────────────── */
  const tabBtns     = document.querySelectorAll('.pricing-tab-btn');
  const pricingSections = document.querySelectorAll('.pricing-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-category');

      pricingSections.forEach(section => {
        if (filter === 'all') {
          section.style.display = '';
        } else {
          const cat = section.getAttribute('data-category');
          section.style.display = cat === filter ? '' : 'none';
        }
      });
    });
  });

  /* ── Add data-label attributes for mobile card mode ──────── */
  // This ensures the CSS ::before pseudo-element shows column headers
  document.querySelectorAll('.pricing-table').forEach(table => {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

    table.querySelectorAll('tbody tr:not(.pricing-category-header)').forEach(row => {
      Array.from(row.querySelectorAll('td')).forEach((td, i) => {
        if (headers[i]) {
          td.setAttribute('data-label', headers[i]);
        }
      });
    });
  });

})();
