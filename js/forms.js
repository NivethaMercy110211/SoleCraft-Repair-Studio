/* ============================================================
   SoleCraft — forms.js
   Enquiry form validation, file upload, success/error states
   ============================================================ */

(function () {
  'use strict';

  /* ── Utility: Mark field as error ────────────────────────── */
  function setError(input, message) {
    const group = input.closest('.sc-form-group');
    if (!group) return;
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    group.classList.add('has-error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input) {
    const group = input.closest('.sc-form-group');
    if (!group) return;
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    group.classList.remove('has-error');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[\d\s\+\-\(\)]{7,15}$/.test(phone);
  }

  /* ── Validate a single input ─────────────────────────────── */
  function validateField(input) {
    const value  = input.value.trim();
    const type   = input.type;
    const name   = input.name;
    const required = input.hasAttribute('required');

    if (required && !value) {
      setError(input, 'This field is required.');
      return false;
    }

    if (value && type === 'email' && !validateEmail(value)) {
      setError(input, 'Please enter a valid email address.');
      return false;
    }

    if (value && (name === 'phone' || type === 'tel') && !validatePhone(value)) {
      setError(input, 'Please enter a valid phone number.');
      return false;
    }

    if (value) clearError(input);
    return true;
  }

  /* Keep the paired contact dropdown menus inside their form columns. */
  document.querySelectorAll('#repair-service, #shoe-type').forEach(select => {
    const field = document.createElement('div');
    field.className = 'sc-select';
    select.parentNode.insertBefore(field, select);
    field.appendChild(select);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sc-form-control sc-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', select.closest('.sc-form-group').querySelector('label').textContent.trim());

    const menu = document.createElement('div');
    menu.className = 'sc-select-menu';
    menu.id = `${select.id}-options`;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', trigger.getAttribute('aria-label'));
    menu.hidden = true;
    trigger.setAttribute('aria-controls', menu.id);

    Array.from(select.options).filter(option => !option.disabled).forEach(option => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'sc-select-option';
      item.setAttribute('role', 'option');
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        validateField(select);
        closeMenu();
        trigger.focus();
      });
      menu.appendChild(item);
    });

    field.append(trigger, menu);
    select.classList.add('sc-select-native');
    select.tabIndex = -1;

    function sync() {
      trigger.textContent = select.selectedOptions[0]?.textContent || '';
      menu.querySelectorAll('.sc-select-option').forEach(item => {
        item.setAttribute('aria-selected', String(item.dataset.value === select.value));
      });
    }

    function closeMenu() {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      field.classList.remove('open-up');
    }

    function openMenu() {
      document.querySelectorAll('.sc-select-menu:not([hidden])').forEach(other => {
        if (other !== menu) other.closest('.sc-select').querySelector('.sc-select-trigger').click();
      });
      const roomBelow = window.innerHeight - trigger.getBoundingClientRect().bottom;
      field.classList.toggle('open-up', roomBelow < 240 && trigger.getBoundingClientRect().top > roomBelow);
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (menu.hidden) openMenu();
        const options = Array.from(menu.querySelectorAll('.sc-select-option'));
        const selected = options.findIndex(item => item.dataset.value === select.value);
        options[Math.max(0, selected)]?.focus();
      } else if (event.key === 'Escape') closeMenu();
    });
    menu.addEventListener('keydown', event => {
      const options = Array.from(menu.querySelectorAll('.sc-select-option'));
      const current = options.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
      } else if (event.key === 'Escape') {
        closeMenu();
        trigger.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!field.contains(event.target)) closeMenu();
    });
    field.addEventListener('focusout', event => {
      if (!field.contains(event.relatedTarget)) closeMenu();
    });
    select.closest('.sc-form-group').querySelector('label').addEventListener('click', event => {
      event.preventDefault();
      trigger.focus();
    });
    select.addEventListener('change', sync);
    select.form?.addEventListener('reset', () => setTimeout(sync, 0));
    sync();
  });

  /* ── Real-time validation on blur ────────────────────────── */
  document.querySelectorAll('.sc-form-control').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });

  /* ── Enquiry Form Submit ─────────────────────────────────── */
  document.querySelectorAll('.sc-enquiry-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      const inputs = form.querySelectorAll('.sc-form-control[required]');

      inputs.forEach(input => {
        if (!validateField(input)) valid = false;
      });

      const successMsg = form.querySelector('.form-message.success');
      const errorMsg   = form.querySelector('.form-message.error');

      if (!valid) {
        if (errorMsg) {
          errorMsg.classList.add('show');
          errorMsg.textContent = 'Please fill in all required fields correctly.';
          setTimeout(() => errorMsg.classList.remove('show'), 5000);
        }
        // Scroll to first error
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstError.closest('.sc-select')?.querySelector('.sc-select-trigger') || firstError).focus();
        }
        return;
      }

      // Simulate successful submission (replace with actual API call)
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Request Repair Estimate';
        }

        form.reset();
        form.querySelectorAll('.sc-form-control').forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });
        form.querySelectorAll('.sc-form-group').forEach(g => g.classList.remove('has-error'));
        clearFilePreview(form);

        if (successMsg) {
          successMsg.classList.add('show');
          setTimeout(() => successMsg.classList.remove('show'), 7000);
        }
      }, 1200);
    });

    // Save original button text
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.setAttribute('data-original-text', submitBtn.textContent.trim());
    }
  });

  /* ── File Upload ─────────────────────────────────────────── */
  function clearFilePreview(form) {
    const previewList = form.querySelector('.file-preview-list');
    if (previewList) previewList.innerHTML = '';
  }

  document.querySelectorAll('.file-upload-area').forEach(area => {
    const input       = area.querySelector('input[type="file"]');
    const previewList = area.closest('.sc-form-group')?.querySelector('.file-preview-list');

    if (!input) return;

    function renderFiles(files) {
      if (!previewList) return;
      previewList.innerHTML = '';
      Array.from(files).forEach((file, i) => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        item.innerHTML = `
          <i class="bi bi-image"></i>
          <span>${file.name.length > 24 ? file.name.substring(0, 22) + '…' : file.name}</span>
          <button type="button" title="Remove" aria-label="Remove ${file.name}">
            <i class="bi bi-x"></i>
          </button>
        `;
        item.querySelector('button').addEventListener('click', () => {
          item.remove();
        });
        previewList.appendChild(item);
      });
    }

    input.addEventListener('change', () => renderFiles(input.files));

    area.addEventListener('dragover', e => {
      e.preventDefault();
      area.classList.add('drag-over');
    });

    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));

    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const dt = e.dataTransfer;
      if (dt.files.length) {
        renderFiles(dt.files);
      }
    });
  });

  /* ── Password Toggle ─────────────────────────────────────── */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.password-field');
      const input = field?.querySelector('.sc-form-control');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.querySelector('i').className = 'bi bi-eye-slash';
      } else {
        input.type = 'password';
        btn.querySelector('i').className = 'bi bi-eye';
      }
    });
  });

  /* ── Auth Forms ──────────────────────────────────────────── */
  document.querySelectorAll('.sc-auth-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('.sc-form-control[required]').forEach(input => {
        if (!validateField(input)) valid = false;
      });

      if (!valid) return;

      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Please wait...';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = btn.getAttribute('data-original-text') || 'Submit';
        }, 1500);
      }
    });

    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.setAttribute('data-original-text', btn.textContent.trim());
  });

})();
