/* Hukm Qalbi — Shared interactions */
(function(){
  'use strict';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Ready class
  requestAnimationFrame(() => document.body.classList.add('ready'));

  // Reveal on intersect
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .mask').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .mask').forEach(el => el.classList.add('in'));
  }

  // Adaptive nav theme
  const nav = document.getElementById('nav');
  if (nav) {
    const themed = document.querySelectorAll('[data-theme]');
    const updateNavTheme = () => {
      const r = nav.getBoundingClientRect();
      const y = r.top + r.height / 2;
      let theme = 'light';
      for (const s of themed) {
        const sr = s.getBoundingClientRect();
        if (sr.top <= y && sr.bottom > y) { theme = s.dataset.theme; break; }
      }
      if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
    };
    updateNavTheme();
    window.addEventListener('scroll', updateNavTheme, { passive: true });
    window.addEventListener('resize', updateNavTheme);
  }

  // Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  if (menuBtn && menuPanel) {
    const openMenu = () => {
      menuPanel.classList.add('open');
      document.body.classList.add('locked', 'menu-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
    };
    const closeMenu = () => {
      menuPanel.classList.remove('open');
      document.body.classList.remove('locked', 'menu-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    };
    menuBtn.addEventListener('click', () => {
      menuPanel.classList.contains('open') ? closeMenu() : openMenu();
    });
    menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuPanel.classList.contains('open')) closeMenu();
    });
  }

  // Waveform decoration
  const wv = document.getElementById('waveform');
  if (wv) {
    for (let i = 0; i < 32; i++) {
      const bar = document.createElement('i');
      bar.style.height = (20 + Math.random() * 80) + '%';
      bar.style.animationDelay = (Math.random() * 1.6).toFixed(2) + 's';
      bar.style.animationDuration = (1.2 + Math.random() * 1.2).toFixed(2) + 's';
      wv.appendChild(bar);
    }
  }

  // File field label
  const fi = document.getElementById('f-file');
  const ff = document.getElementById('fileField');
  const ft = document.getElementById('fileTitle');
  const fh = document.getElementById('fileHelp');
  if (fi && ff) {
    fi.addEventListener('change', () => {
      if (fi.files && fi.files.length) {
        const f = fi.files[0];
        ft.textContent = f.name;
        fh.textContent = (f.size / (1024 * 1024)).toFixed(2) + ' MB — click to change';
        ff.classList.add('has-file');
      } else {
        ft.textContent = 'Drop a brief, deck, or reference';
        fh.textContent = 'PDF, PNG, JPG, or DOCX — up to 20MB';
        ff.classList.remove('has-file');
      }
    });
  }

  // Form
  const form = document.getElementById('inquiryForm');
  const msgEl = document.getElementById('formMessage');
  const okEl = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  const showMessage = (text, kind) => {
    if (!msgEl) return;
    msgEl.className = 'form-message show form-message--' + kind;
    msgEl.innerHTML = text;
  };
  const hideMessage = () => {
    if (!msgEl) return;
    msgEl.className = 'form-message';
    msgEl.innerHTML = '';
  };

  const validate = () => {
    let ok = true;
    [
      ['f-name', v => v.trim().length > 0],
      ['f-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
      ['f-details', v => v.trim().length >= 10]
    ].forEach(([id, test]) => {
      const input = document.getElementById(id);
      if (!input) return;
      const field = input.closest('.field');
      const pass = test(input.value);
      if (field) field.classList.toggle('error', !pass);
      if (!pass) ok = false;
    });
    return ok;
  };

  if (form) {
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        const f = input.closest('.field');
        if (f) f.classList.remove('error');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();
      if (!validate()) {
        showMessage('Please correct the highlighted fields and try again.', 'error');
        return;
      }
      const endpoint = (form.dataset.endpoint || '').trim();
      if (!endpoint) {
        showMessage(
          'The contact form is not connected on this deployment. ' +
          'Reach us directly via <a href="https://instagram.com/hukmqalbi" target="_blank" rel="noopener">Instagram</a> ' +
          'or <a href="https://x.com/hukmqalbi" target="_blank" rel="noopener">X</a>.',
          'info'
        );
        return;
      }
      const original = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }
      try {
        const res = await fetch(endpoint, {
          method: 'POST', body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Submission failed');
        form.style.display = 'none';
        if (okEl) okEl.classList.add('show');
      } catch {
        showMessage(
          'Something went wrong. Please try again, or contact us via ' +
          '<a href="https://instagram.com/hukmqalbi" target="_blank" rel="noopener">Instagram</a>.',
          'error'
        );
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = original; }
      }
    });
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    link.addEventListener('click', (e) => {
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
