/* ===========================================================
   Rook Technologies — page behaviour
   =========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header: solid on scroll ---------- */
  var header = document.getElementById('site-header');
  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 8);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('hidden') === false;
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) header.classList.add('is-solid');
      else syncHeader();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.add('hidden');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        syncHeader();
      });
    });
  }

  /* ---------- Desktop nav dropdowns ---------- */
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dd'));

  function setDropdown(dd, open) {
    dd.setAttribute('data-open', String(open));
    var trigger = dd.querySelector('.navlink--trigger');
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
  }

  function closeDropdowns(except) {
    dropdowns.forEach(function (dd) { if (dd !== except) setDropdown(dd, false); });
  }

  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector('.navlink--trigger');
    if (!trigger) return;

    setDropdown(dd, false);

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.getAttribute('data-open') !== 'true';
      closeDropdowns(dd);
      setDropdown(dd, open);
    });

    dd.addEventListener('mouseenter', function () { closeDropdowns(dd); setDropdown(dd, true); });
    dd.addEventListener('mouseleave', function () { setDropdown(dd, false); });
    dd.addEventListener('focusout', function (e) {
      if (!dd.contains(e.relatedTarget)) setDropdown(dd, false);
    });
    dd.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setDropdown(dd, false); });
    });
  });

  if (dropdowns.length) {
    document.addEventListener('click', function () { closeDropdowns(null); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdowns(null);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Stat counters ---------- */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCounter);
  } else {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Wind / Solar tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var isActive = t === tab;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', String(isActive));
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !isActive;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- Approach cards ---------- */
  var approachCards = Array.prototype.slice.call(document.querySelectorAll('[data-approach]'));
  function activateApproach(card) {
    approachCards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
  }
  approachCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { activateApproach(card); });
    card.addEventListener('focus', function () { activateApproach(card); });
    card.addEventListener('click', function () { activateApproach(card); });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.faq-item');
      var willOpen = !item.classList.contains('is-open');

      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Testimonials carousel ---------- */
  var track = document.getElementById('tst-track');
  var prevBtn = document.getElementById('tst-prev');
  var nextBtn = document.getElementById('tst-next');

  if (track && prevBtn && nextBtn) {
    var offset = 0;

    function maxOffset() {
      return Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    }

    function stepSize() {
      var first = track.firstElementChild;
      if (!first) return 400;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '20');
      return first.getBoundingClientRect().width + (isNaN(gap) ? 20 : gap);
    }

    function apply() {
      offset = Math.min(Math.max(offset, 0), maxOffset());
      track.style.transform = 'translateX(' + -offset + 'px)';
      prevBtn.disabled = offset <= 1;
      nextBtn.disabled = offset >= maxOffset() - 1;
    }

    prevBtn.addEventListener('click', function () { offset -= stepSize(); apply(); });
    nextBtn.addEventListener('click', function () { offset += stepSize(); apply(); });
    window.addEventListener('resize', apply);
    apply();
  }

  /* ---------- Form helpers ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showStatus(el, message, ok) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    el.style.color = ok ? '#1b4f39' : '#f42a2a';
  }

  function markField(field, invalid) {
    field.classList.toggle('field-error', invalid);
  }

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var contactStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = contactForm.elements.name;
      var email = contactForm.elements.email;
      var message = contactForm.elements.message;
      var terms = contactForm.elements.terms;

      var problems = [];

      markField(name, !name.value.trim());
      if (!name.value.trim()) problems.push('your name');

      var emailBad = !EMAIL_RE.test(email.value.trim());
      markField(email, emailBad);
      if (emailBad) problems.push('a valid email address');

      markField(message, !message.value.trim());
      if (!message.value.trim()) problems.push('a message');

      if (problems.length) {
        showStatus(contactStatus, 'Please add ' + problems.join(', ') + '.', false);
        return;
      }
      if (!terms.checked) {
        showStatus(contactStatus, 'Please accept the Terms and Conditions.', false);
        return;
      }

      // No backend is wired up yet — swap this for a real POST when one exists.
      showStatus(contactStatus, 'Thanks — your message is ready to send. Hook this form up to your endpoint to deliver it.', true);
      contactForm.reset();
    });

    contactForm.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () { markField(field, false); });
    });
  }

  /* ---------- Newsletter ---------- */
  var newsletter = document.getElementById('newsletter-form');
  if (newsletter) {
    var newsletterStatus = document.getElementById('newsletter-status');
    newsletter.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = newsletter.elements.email;
      if (!EMAIL_RE.test(email.value.trim())) {
        showStatus(newsletterStatus, 'Please enter a valid email address.', false);
        return;
      }
      showStatus(newsletterStatus, 'Thanks for subscribing.', true);
      newsletter.reset();
    });
  }

  /* ---------- Anchor offset for the fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

})();
