/* ============================================
   LBS – Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // === Navigation scroll effect ===
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // === Mobile menu toggle ===
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('nav-mobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      // Show mobile nav (CSS uses display:flex when .open)
      mobileNav.style.display = isOpen ? 'flex' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
        mobileNav.style.display = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileNav.contains(e.target)) {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
        mobileNav.style.display = '';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // === Scroll-triggered fade-in animations ===
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // === Active nav link ===
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('?')[0] === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // === Contact form ===
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Pre-select package from URL param
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('pkg');
    if (pkg) {
      const sel = document.getElementById('package');
      if (sel) sel.value = pkg;
    }

    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      // Basic validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) {
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Sending…';
      btn.disabled = true;

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async res => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const err = new Error('Server error');
            err.status = res.status;
            err.body = body;
            throw err;
          }
          contactForm.reset();
          if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .catch(err => {
          console.error('[Contact form error]', err.status, err.body || err.message);
          if (errorMsg) {
            errorMsg.textContent = '⚠️ Something went wrong. Please email us directly at info@lbsconnect.net.';
            errorMsg.style.display = 'block';
            errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .finally(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        });
    });
  }

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
