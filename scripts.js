/* ============== Click — shared interactions ============== */
(function () {
  'use strict';

  // ---- Scroll reveals (initialized once preloader is done, or immediately on inner pages) ----
  let revealsArmed = false;
  const initReveals = () => {
    if (revealsArmed) return;
    revealsArmed = true;
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
  };

  // ---- Preloader (home page only) ----
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const MIN_SHOW_MS = 1300;
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - start));
      setTimeout(() => {
        preloader.classList.add('is-done');
        document.body.classList.add('is-loaded');
        initReveals();
        setTimeout(() => preloader.remove(), 800);
      }, wait);
    };
    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
      setTimeout(finish, 4000);
    }
  } else {
    // No preloader on inner pages — arm reveals as soon as DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReveals, { once: true });
    } else {
      initReveals();
    }
  }

  // Nav: scrolled state
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScrollNav = () => nav.classList.toggle('nav--scrolled', window.scrollY > 12);
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }

  // Services mega-menu (desktop hover + click)
  const navDropdown = document.querySelector('.nav__dropdown');
  const navDropdownTrigger = document.querySelector('.nav__dropdown-trigger');
  const navMenu = document.querySelector('.nav__menu');
  if (navDropdown && navDropdownTrigger && navMenu) {
    const setDropdown = (open) => {
      navMenu.classList.toggle('nav__menu--open', open);
      navDropdownTrigger.classList.toggle('is-active', open);
      navDropdownTrigger.setAttribute('aria-expanded', String(open));
    };
    navDropdown.addEventListener('mouseenter', () => setDropdown(true));
    navDropdown.addEventListener('mouseleave', () => setDropdown(false));
    navDropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      setDropdown(!navMenu.classList.contains('nav__menu--open'));
    });
    document.addEventListener('mousedown', (e) => {
      if (!navDropdown.contains(e.target)) setDropdown(false);
    });
  }

  // Mobile burger
  const burger = document.querySelector('.nav__burger');
  const navLinks = document.querySelector('.nav__links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = !navLinks.classList.contains('nav__links--open');
      navLinks.classList.toggle('nav__links--open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  // Section reveal trigger — adds `.is-revealing` when the section is in view.
  // CSS handles all the choreography (Features = 2 waves, Services = 3 phases).
  function trigger(selector) {
    const section = document.querySelector(selector);
    if (!section) return;
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.classList.add('is-revealing');
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        section.classList.add('is-revealing');
        io.unobserve(section);
      }
    }, { rootMargin: '0px 0px -40% 0px', threshold: 0 });
    io.observe(section);
  }
  trigger('.features');
  trigger('.services-showcase');

  // Team, Process, Stats counters, and Final CTA use the global .reveal observer
  // (initialized in initReveals above) — no scroll lock, natural scroll flow.

  // Year in footer
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact form (homepage doesn't have one; only contact.html does)
  const form = document.querySelector('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successEl = form.querySelector('.form-success');
      if (successEl) successEl.classList.add('is-visible');
      form.reset();
      setTimeout(() => { if (successEl) successEl.classList.remove('is-visible'); }, 6000);
    });
  }
})();
