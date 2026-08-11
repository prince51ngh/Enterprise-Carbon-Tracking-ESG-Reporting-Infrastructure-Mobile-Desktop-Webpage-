document.addEventListener('DOMContentLoaded', () => {

  /* ── VIDEO PLAYBACK GUARANTEE ───────────────── */
  const video = document.querySelector('.video-container video');
  if (video) {
    const playVideo = () => {
      video.play().catch(() => {
        // Suppress autoplay block errors
      });
    };

    playVideo();

    // Prevent pausing under any circumstances
    video.addEventListener('pause', () => {
      playVideo();
    });

    // Fallback play triggers for browser autoplay restrictions
    window.addEventListener('click', playVideo, { once: true });
    window.addEventListener('scroll', playVideo, { once: true });

    // Play when tab becomes active again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        playVideo();
      }
    });
  }

  /* ── HAMBURGER MENU ────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const nav       = document.querySelector('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    // Close menu when a nav link is clicked (mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL-TO-TOP BUTTON ──────────────────── */
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── HEADER SHADOW ON SCROLL ───────────────── */
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── ANIMATED COUNTERS ─────────────────────── */
  const statVals = document.querySelectorAll('.stat-chip .val');
  if (statVals.length) {
    const animateCounter = (el) => {
      const text    = el.textContent.trim();
      const match   = text.match(/^([\d.]+)(.*)$/);
      if (!match) return;
      const target  = parseFloat(match[1]);
      const suffix  = match[2] || '';
      const isFloat = text.includes('.');
      const duration = 1400;
      const start   = performance.now();

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statVals.forEach(el => counterObserver.observe(el));
  }

  /* ── SCROLL-REVEAL (FADE-IN-UP) ───────────── */
  const fadeEls = document.querySelectorAll('.fade-in-up, .stagger-children');
  if (fadeEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => revealObserver.observe(el));
  }

  /* ═════════════════════════════════════════════
     CONTACT FORM — VALIDATION & SUBMISSION
     ═════════════════════════════════════════════ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const fields = {
      name:    { el: document.getElementById('client-name'),     errEl: document.getElementById('err-name') },
      email:   { el: document.getElementById('client-email'),    errEl: document.getElementById('err-email') },
      phone:   { el: document.getElementById('client-phone'),    errEl: document.getElementById('err-phone') },
      scope:   { el: document.getElementById('integration-scope'), errEl: null },
      details: { el: document.getElementById('operational-desc'), errEl: document.getElementById('err-details') }
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;

    // Real-time validation on blur and input
    const validateField = (key) => {
      const { el, errEl } = fields[key];
      if (!el) return true;
      let valid = true;
      let msg   = '';
      const val = el.value.trim();

      switch (key) {
        case 'name':
          if (val.length < 2) { valid = false; msg = 'Name must be at least 2 characters.'; }
          break;
        case 'email':
          if (!emailRegex.test(val)) { valid = false; msg = 'Please enter a valid email address.'; }
          break;
        case 'phone':
          if (val && !phoneRegex.test(val)) { valid = false; msg = 'Please enter a valid phone number.'; }
          break;
        case 'details':
          if (val.length < 10) { valid = false; msg = 'Please provide at least 10 characters.'; }
          break;
      }

      el.classList.toggle('invalid', !valid);
      el.classList.toggle('valid', valid && val.length > 0);
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.toggle('show', !valid);
      }
      return valid;
    };

    // Attach live validation events
    Object.keys(fields).forEach(key => {
      const { el } = fields[key];
      if (el) {
        el.addEventListener('blur', () => validateField(key));
        el.addEventListener('input', () => {
          if (el.classList.contains('invalid')) validateField(key);
        });
      }
    });

    // Submit handler
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let allValid = true;
      Object.keys(fields).forEach(key => {
        if (!validateField(key)) allValid = false;
      });

      if (!allValid) return;

      const submitBtn = contactForm.querySelector('.submit-btn');
      const toast     = document.getElementById('contact-toast');
      submitBtn.disabled  = true;
      submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';

      const formData = {
        rep_name:  fields.name.el.value.trim(),
        rep_email: fields.email.el.value.trim(),
        phone:     fields.phone.el ? fields.phone.el.value.trim() : '',
        scope:     fields.scope.el.value,
        details:   fields.details.el.value.trim()
      };

      try {
        const response = await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (response.ok) {
          showToast(toast, 'success', '✓ Your consultation request has been submitted successfully! We will contact you shortly.');
          contactForm.reset();
          Object.keys(fields).forEach(key => {
            if (fields[key].el) { fields[key].el.classList.remove('valid', 'invalid'); }
          });
        } else {
          showToast(toast, 'error', result.message || 'Submission failed. Please try again.');
        }
      } catch (err) {
        showToast(toast, 'error', 'Network error — please check your connection and try again.');
      }

      submitBtn.disabled  = false;
      submitBtn.innerHTML = 'Submit Engagement Request <span class="arrow">→</span>';
    });
  }

  /* ═════════════════════════════════════════════
     CARBON ESTIMATOR — CALCULATION & SUBMISSION
     ═════════════════════════════════════════════ */
  const estimatorForm = document.getElementById('estimator-form');
  if (estimatorForm) {
    estimatorForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const powerEl = document.getElementById('monthly-power');
      const milesEl = document.getElementById('fleet-miles');
      const power   = parseFloat(powerEl.value);
      const miles   = parseFloat(milesEl.value);

      // Validation
      let valid = true;
      if (isNaN(power) || power < 0) { powerEl.classList.add('invalid'); valid = false; }
      else { powerEl.classList.remove('invalid'); powerEl.classList.add('valid'); }

      if (isNaN(miles) || miles < 0) { milesEl.classList.add('invalid'); valid = false; }
      else { milesEl.classList.remove('invalid'); milesEl.classList.add('valid'); }

      if (!valid) return;

      // Emission factors
      const ELECTRICITY_FACTOR = 0.42;  // kg CO₂ per kWh
      const FLEET_FACTOR       = 0.404; // kg CO₂ per mile

      const elecCO2  = power * ELECTRICITY_FACTOR;
      const fleetCO2 = miles * FLEET_FACTOR;
      const totalCO2 = elecCO2 + fleetCO2;

      // Display result
      const resultBox   = document.getElementById('result-box');
      const resultValue = document.getElementById('result-value');
      const breakdown   = document.getElementById('result-breakdown');
      const tierLow     = document.getElementById('tier-low');
      const tierMed     = document.getElementById('tier-medium');
      const tierHigh    = document.getElementById('tier-high');

      // Animate the value
      resultBox.classList.add('show');
      
      // Hide empty state if exists
      const emptyState = document.getElementById('empty-state');
      if (emptyState) emptyState.style.display = 'none';

      // Loading state
      resultValue.innerHTML = '<div class="skeleton" style="width: 150px; height: 38px; display: inline-block;">Loading</div>';
      breakdown.innerHTML = '<div class="skeleton" style="width: 250px; height: 16px; margin: 4px auto;">Loading</div>';
      
      // Hide tiers temporarily
      if (tierLow) tierLow.classList.remove('show');
      if (tierMed) tierMed.classList.remove('show');
      if (tierHigh) tierHigh.classList.remove('show');

      // Submit to backend
      try {
        await fetch('estimator.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthly_power_kwh: power, fleet_miles: miles, total_co2_kg: totalCO2 })
        });
      } catch (err) {
        // Silent fail
      }
      
      setTimeout(() => {
        animateValue(resultValue, 0, totalCO2, 1200);
        breakdown.textContent = `Electricity: ${elecCO2.toFixed(1)} kg  |  Fleet: ${fleetCO2.toFixed(1)} kg`;

        // Show recommendation tier
        if (totalCO2 < 1000) {
          if (tierLow) tierLow.classList.add('show');
        } else if (totalCO2 < 5000) {
          if (tierMed) tierMed.classList.add('show');
        } else {
          if (tierHigh) tierHigh.classList.add('show');
        }
      }, 1000);
    });
  }

  /* ── Animate numeric value ─────────────────── */
  function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = start + eased * (end - start);
      el.textContent = current.toFixed(1) + ' kg CO₂';
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ═════════════════════════════════════════════
     PRICING TOGGLE — MONTHLY / ANNUAL
     ═════════════════════════════════════════════ */
  const pricingToggle = document.getElementById('pricing-toggle');
  if (pricingToggle) {
    const labelMonthly = document.getElementById('label-monthly');
    const labelAnnual  = document.getElementById('label-annual');
    const saveBadge    = document.getElementById('save-badge');
    const priceCells   = document.querySelectorAll('.price-cell');

    const monthlyPrices = [];
    priceCells.forEach(cell => monthlyPrices.push(cell.textContent));

    const annualPrices = ['$1,440 / yr', '$4,320 / yr', 'Custom Quote'];

    let isAnnual = false;

    pricingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      pricingToggle.classList.toggle('annual', isAnnual);
      if (labelMonthly) labelMonthly.classList.toggle('active-label', !isAnnual);
      if (labelAnnual)  labelAnnual.classList.toggle('active-label', isAnnual);
      if (saveBadge)    saveBadge.classList.toggle('show', isAnnual);

      priceCells.forEach((cell, i) => {
        cell.style.opacity = '0';
        cell.style.transform = 'translateY(-4px)';
        setTimeout(() => {
          cell.textContent = isAnnual ? annualPrices[i] : monthlyPrices[i];
          cell.style.opacity = '1';
          cell.style.transform = 'translateY(0)';
        }, 150);
      });
    });
  }

  /* ═════════════════════════════════════════════
     PUBLICATIONS SEARCH / FILTER
     ═════════════════════════════════════════════ */
  const searchInput = document.getElementById('pub-search');
  if (searchInput) {
    const pubItems  = document.querySelectorAll('.pub-list li');
    const noResults = document.getElementById('no-results');

    searchInput.addEventListener('input', () => {
      const query   = searchInput.value.toLowerCase().trim();
      let found     = 0;

      pubItems.forEach(item => {
        const text    = item.textContent.toLowerCase();
        const matches = text.includes(query);
        item.style.display = matches ? '' : 'none';
        if (matches) found++;
      });

      if (noResults) noResults.classList.toggle('show', found === 0 && query.length > 0);
    });
  }

  /* ═════════════════════════════════════════════
     CASE STUDIES — EXPAND / COLLAPSE
     ═════════════════════════════════════════════ */
  const caseItems = document.querySelectorAll('.case-log-item');
  caseItems.forEach(item => {
    item.addEventListener('click', () => {
      const detail = item.querySelector('.case-detail');
      if (detail) {
        detail.classList.toggle('expanded');
        const hint = item.querySelector('.expand-hint');
        if (hint) {
          hint.textContent = detail.classList.contains('expanded') ? '▲ Click to collapse' : '▼ Click to expand details';
        }
      }
    });
  });

  /* ═════════════════════════════════════════════
     NEWSLETTER SUBSCRIBE
     ═════════════════════════════════════════════ */
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input  = nlForm.querySelector('input');
      const email  = input.value.trim();
      const regex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const msgEl  = document.getElementById('nl-message');

      if (!regex.test(email)) {
        if (msgEl) { msgEl.textContent = 'Please enter a valid email.'; msgEl.style.color = 'var(--error)'; }
        return;
      }

      if (msgEl) { msgEl.textContent = '✓ Subscribed successfully!'; msgEl.style.color = 'var(--success)'; }
      input.value = '';
    });
  }

  /* ═════════════════════════════════════════════
     UTILITY — TOAST MESSAGES
     ═════════════════════════════════════════════ */
  function showToast(el, type, msg) {
    if (!el) return;
    el.className = 'toast-message show ' + type;
    el.textContent = msg;
    setTimeout(() => { el.classList.remove('show'); }, 6000);
  }

  /* ═════════════════════════════════════════════
     DARK MODE TOGGLE
     ═════════════════════════════════════════════ */
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check local storage or system preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (!currentTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      // Optional: change icon based on state
      themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    });
    // Set initial icon
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }

  /* ═════════════════════════════════════════════
     SCROLL PROGRESS BAR
     ═════════════════════════════════════════════ */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgressBar.style.width = scrolled + '%';
    });
  }

  /* ═════════════════════════════════════════════
     TESTIMONIAL CAROUSEL
     ═════════════════════════════════════════════ */
  const carousel = document.querySelector('.testimonial-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance every 5 seconds
    setInterval(() => {
      let nextSlide = (currentSlide + 1) % slides.length;
      showSlide(nextSlide);
    }, 5000);
  }

});
