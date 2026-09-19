/* ============================================================
   SoleCraft — main.js
   Theme toggle, RTL toggle, scroll animations, sticky header
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme Toggle ────────────────────────────────────────── */
  const themeKey = 'sc-theme';
  const body     = document.body;
  const html     = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    document.querySelectorAll('.sc-theme-icon').forEach(el => {
      el.className = `sc-theme-icon bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`;
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(themeKey);
    const pref  = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved || pref);
  }

  document.querySelectorAll('.sc-theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      const next    = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(themeKey, next);
    });
  });

  initTheme();

  /* ── RTL Toggle ──────────────────────────────────────────── */
  const rtlKey = 'sc-dir';

  function applyDir(dir) {
    html.setAttribute('dir', dir);
    document.querySelectorAll('.sc-rtl-label').forEach(el => {
      el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function initDir() {
    const saved = localStorage.getItem(rtlKey) || 'ltr';
    applyDir(saved);
  }

  document.querySelectorAll('.sc-rtl-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('dir') || 'ltr';
      const next    = current === 'rtl' ? 'ltr' : 'rtl';
      applyDir(next);
      localStorage.setItem(rtlKey, next);
    });
  });

  initDir();

  /* ── Sticky Header Scroll Effect ────────────────────────── */
  const navbar = document.querySelector('.sc-navbar');

  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Scroll To Top ───────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile Menu ─────────────────────────────────────────── */
  const hamburger  = document.querySelector('.sc-hamburger');
  const mobileMenu = document.querySelector('.sc-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', !isOpen);
      hamburger.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on mobile nav link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Keep authentication actions in the expected accessible order. */
  document.querySelectorAll('.auth-form-inner').forEach(panel => {
    const form = panel.querySelector('.sc-auth-form');
    const divider = panel.querySelector('.auth-divider');
    const social = panel.querySelector('.auth-social-btns');
    if (form && divider && social) {
      const label = divider.querySelector('span');
      if (label) label.textContent = 'or continue with';
      form.insertAdjacentElement('afterend', divider);
      divider.insertAdjacentElement('afterend', social);
    }
  });

  /* Align the desktop image caption with the true start of auth content. */
  const authPage = document.querySelector('.auth-page');
  const authCaption = document.querySelector('.auth-img-caption');
  const authFormInner = document.querySelector('.auth-form-inner');

  function alignAuthCaption() {
    if (!authPage || !authCaption || !authFormInner) return;
    if (window.innerWidth <= 1024) {
      authCaption.style.removeProperty('top');
      return;
    }
    const pageTop = authPage.getBoundingClientRect().top;
    const formTop = authFormInner.getBoundingClientRect().top;
    authCaption.style.top = `${Math.max(48, formTop - pageTop)}px`;
  }

  if (authPage && authCaption && authFormInner) {
    alignAuthCaption();
    window.addEventListener('resize', alignAuthCaption, { passive: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(alignAuthCaption).observe(authFormInner);
    }
  }

  /* Make the complete footer brand unit consistently link to Home 1. */
  document.querySelectorAll('.footer-brand').forEach(footerBrand => {
    const brandUnit = footerBrand.firstElementChild;
    if (!brandUnit || brandUnit.matches('a') || (!brandUnit.querySelector('.sc-brand-icon') && !brandUnit.querySelector('.footer-brand-logo') && !brandUnit.matches('.footer-brand-logo'))) return;
    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.className = 'footer-brand-link';
    homeLink.setAttribute('aria-label', 'SoleCraft home');
    brandUnit.replaceWith(homeLink);
    homeLink.appendChild(brandUnit);
  });

  /* Keep the shared footer concise: five useful links per link column. */
  document.querySelectorAll('.sc-footer').forEach(footer => {
    const columns = footer.querySelectorAll('.footer-col');
    columns.forEach(column => {
      const heading = column.querySelector('h5')?.textContent.trim().toLowerCase();
      const links = Array.from(column.querySelectorAll('ul li'));

      if (heading === 'pages') {
        const usefulPages = new Set(['index.html', 'home2.html', 'about.html', 'services.html', 'pricing.html', 'contact.html']);
        links.forEach(item => {
          const href = item.querySelector('a')?.getAttribute('href');
          if (!usefulPages.has(href)) item.remove();
        });
      } else if (heading === 'services') {
        links.slice(5).forEach(item => item.remove());
      }
    });

    /* Contact details remain; the longer hours table belongs on Contact. */
    footer.querySelector('.footer-hours')?.remove();
  });

  /* ── Active Navigation Highlight ────────────────────────── */
  function highlightActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sc-nav-links .nav-link, .mobile-nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === current || href === './' + current)) {
        link.classList.add('active');
      }
    });
  }

  highlightActiveNav();

  /* ── Fade-Up Scroll Animations ───────────────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  } else {
    // Reduced motion: show all immediately
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }

  /* ── Accordion ───────────────────────────────────────────── */
  document.querySelectorAll('.sc-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.sc-accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.sc-accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Open this one if it was closed
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* ── Smooth Anchor Links ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-height'), 10) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Today Timings Highlight ─────────────────────────────── */
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = dayNames[new Date().getDay()];

  document.querySelectorAll('.timings-row').forEach(row => {
    const dayEl = row.querySelector('.day-name');
    if (dayEl && dayEl.textContent.trim().startsWith(today)) {
      row.classList.add('today');
      const tag = document.createElement('span');
      tag.className = 'today-tag';
      tag.textContent = 'Today';
      dayEl.appendChild(tag);
    }
  });

})();
