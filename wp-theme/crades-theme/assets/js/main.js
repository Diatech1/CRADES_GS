/**
 * CRADES Theme â€” Main JavaScript
 * Frontend interactivity for the CRADES WordPress theme
 * @version 2.0.0
 */
(function () {
  'use strict';

  /* â”€â”€ Mobile menu toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function initMobileMenu() {
    const menuBtn = document.querySelector('.crades-mobile-menu-btn');
    const mobileMenu = document.querySelector('.crades-mobile-menu');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded',
        mobileMenu.classList.contains('is-open') ? 'true' : 'false'
      );
    });
  }

  /* â”€â”€ Scroll-to-top button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'crades-scroll-top';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.style.cssText = `
      position:fixed;bottom:2rem;right:2rem;width:44px;height:44px;
      border-radius:50%;background:#044bad;color:#fff;border:none;
      cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(4,75,173,0.3);z-index:999;font-size:16px;
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* â”€â”€ Fade-up animation on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function initFadeUp() {
    const els = document.querySelectorAll('.crades-fade-up');
    if (!els.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function (el) {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  /* â”€â”€ Smooth anchor links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* â”€â”€ Header shrink on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function initHeaderShrink() {
    var header = document.querySelector('.wp-block-template-part');
    if (!header) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.classList.add('crades-header-scrolled');
      } else {
        header.classList.remove('crades-header-scrolled');
      }
    });
  }

  /* â”€â”€ Init all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initScrollToTop();
    initFadeUp();
    initSmoothAnchors();
    initHeaderShrink();
  });
})();
