/**
 * ═══════════════════════════════════════════
 * LINKHUB — Main JavaScript
 * Vanilla JS, modular functions, no inline JS
 * ═══════════════════════════════════════════
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // DOM REFERENCES
  // ═══════════════════════════════════════════

  const DOM = {
    html: document.documentElement,
    body: document.body,
    preloader: document.getElementById('preloader'),
    themeToggle: document.getElementById('themeToggle'),
    navbar: document.getElementById('navbar'),
    navHamburger: document.getElementById('navHamburger'),
    navDrawer: document.getElementById('navDrawer'),
    navLinks: document.querySelectorAll('[data-nav-link]'),
    drawerLinks: document.querySelectorAll('[data-drawer-link]'),
    mainContent: document.getElementById('mainContent'),
  };

  // ═══════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════

  const CONFIG = {
    preloaderDuration: 2500,
    preloaderFadeOut: 500,
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -50px 0px',
  };

  // ═══════════════════════════════════════════
  // UTILITY — Check Reduced Motion Preference
  // ═══════════════════════════════════════════

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ═══════════════════════════════════════════
  // MODULE: Preloader
  // ═══════════════════════════════════════════

  const Preloader = {
    init() {
      // Lock scroll while preloader is active
      DOM.body.classList.add('is-locked');

      const duration = prefersReducedMotion() ? 500 : CONFIG.preloaderDuration;

      // Wait for preloader duration, then exit
      setTimeout(() => {
        this.exit();
      }, duration);
    },

    exit() {
      if (!DOM.preloader) return;

      // Add exit class for CSS transition
      DOM.preloader.classList.add('is-exiting');

      // After fade-out transition completes, remove from DOM
      setTimeout(() => {
        DOM.body.classList.remove('is-locked');

        if (DOM.preloader && DOM.preloader.parentNode) {
          DOM.preloader.parentNode.removeChild(DOM.preloader);
        }

        // Show navbar and theme toggle after preloader exits
        Navbar.show();
        ThemeToggle.show();

        // Trigger reveal animations on visible elements
        RevealAnimations.init();
      }, CONFIG.preloaderFadeOut);
    },
  };

  // ═══════════════════════════════════════════
  // MODULE: Theme Toggle (Light/Dark)
  // ═══════════════════════════════════════════

  const ThemeToggle = {
    currentTheme: 'dark',

    init() {
      // Read saved preference or default to dark
      const saved = this.getSavedTheme();
      this.currentTheme = saved || 'dark';
      this.applyTheme(this.currentTheme);

      // Bind click event
      if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', () => {
          this.toggle();
        });
      }
    },

    toggle() {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.currentTheme);
      this.saveTheme(this.currentTheme);
    },

    applyTheme(theme) {
      DOM.html.setAttribute('data-theme', theme);
    },

    saveTheme(theme) {
      try {
        localStorage.setItem('linkhub-theme', theme);
      } catch (e) {
        // localStorage not available, fail silently
      }
    },

    getSavedTheme() {
      try {
        return localStorage.getItem('linkhub-theme');
      } catch (e) {
        return null;
      }
    },

    show() {
      if (DOM.themeToggle) {
        DOM.themeToggle.classList.add('is-visible');
      }
    },
  };

  // ═══════════════════════════════════════════
  // MODULE: Navbar
  // ═══════════════════════════════════════════

  const Navbar = {
    isDrawerOpen: false,
    backdrop: null,

    init() {
      this.createBackdrop();
      this.bindEvents();
    },

    show() {
      if (DOM.navbar) {
        DOM.navbar.classList.add('is-visible');
      }
    },

    createBackdrop() {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'navbar-backdrop';
      this.backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.backdrop);
    },

    bindEvents() {
      // Hamburger toggle
      if (DOM.navHamburger) {
        DOM.navHamburger.addEventListener('click', () => {
          this.toggleDrawer();
        });
      }

      // Backdrop click closes drawer
      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => {
          this.closeDrawer();
        });
      }

      // Drawer link clicks close drawer
      DOM.drawerLinks.forEach((link) => {
        link.addEventListener('click', () => {
          this.closeDrawer();
        });
      });

      // Desktop nav link smooth scroll (already handled by CSS scroll-behavior)
      // but we can add active state logic here if needed

      // Close drawer on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isDrawerOpen) {
          this.closeDrawer();
          DOM.navHamburger.focus();
        }
      });

      // Close drawer on resize to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 640 && this.isDrawerOpen) {
          this.closeDrawer();
        }
      });
    },

    toggleDrawer() {
      if (this.isDrawerOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    openDrawer() {
      this.isDrawerOpen = true;

      if (DOM.navHamburger) {
        DOM.navHamburger.setAttribute('aria-expanded', 'true');
        DOM.navHamburger.setAttribute('aria-label', 'Close navigation menu');
      }

      if (DOM.navDrawer) {
        DOM.navDrawer.classList.add('is-open');
        DOM.navDrawer.setAttribute('aria-hidden', 'false');
      }

      if (this.backdrop) {
        this.backdrop.classList.add('is-active');
      }

      DOM.body.classList.add('is-locked');
    },

    closeDrawer() {
      this.isDrawerOpen = false;

      if (DOM.navHamburger) {
        DOM.navHamburger.setAttribute('aria-expanded', 'false');
        DOM.navHamburger.setAttribute('aria-label', 'Open navigation menu');
      }

      if (DOM.navDrawer) {
        DOM.navDrawer.classList.remove('is-open');
        DOM.navDrawer.setAttribute('aria-hidden', 'true');
      }

      if (this.backdrop) {
        this.backdrop.classList.remove('is-active');
      }

      DOM.body.classList.remove('is-locked');
    },
  };

  // ═══════════════════════════════════════════
  // MODULE: Reveal Animations (Intersection Observer)
  // ═══════════════════════════════════════════

  const RevealAnimations = {
    observer: null,

    init() {
      if (prefersReducedMotion()) {
        // If reduced motion is preferred, make everything visible immediately
        this.revealAll();
        return;
      }

      // Check for IntersectionObserver support
      if (!('IntersectionObserver' in window)) {
        this.revealAll();
        return;
      }

      this.createObserver();
      this.observeElements();
    },

    createObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              // Stop observing once revealed
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: CONFIG.revealThreshold,
          rootMargin: CONFIG.revealRootMargin,
        }
      );
    },

    observeElements() {
      const elements = document.querySelectorAll(
        '.reveal, .reveal-text, .reveal-card'
      );

      elements.forEach((el) => {
        this.observer.observe(el);
      });
    },

    revealAll() {
      const elements = document.querySelectorAll(
        '.reveal, .reveal-text, .reveal-card'
      );

      elements.forEach((el) => {
        el.classList.add('is-visible');
      });
    },
  };

  // ═══════════════════════════════════════════
  // MODULE: Lucide Icons Initialization
  // ═══════════════════════════════════════════

  const Icons = {
    init() {
      // Wait for Lucide to be available, then create icons
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      } else {
        // Lucide loaded via defer, try again after a short delay
        window.addEventListener('load', () => {
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        });
      }
    },
  };

  // ═══════════════════════════════════════════
  // MODULE: Smooth Scroll Enhancement
  // ═══════════════════════════════════════════

  const SmoothScroll = {
    init() {
      // Handle anchor links with smooth scrolling + offset for fixed navbar
      const anchorLinks = document.querySelectorAll('a[href^="#"]');

      anchorLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (!target) return;

          e.preventDefault();

          const navbarHeight = DOM.navbar
            ? DOM.navbar.offsetHeight + 20
            : 80;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        });
      });
    },
  };

  // ═══════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════

  function init() {
    // Initialize Lucide icons first
    Icons.init();

    // Initialize theme (applies saved preference immediately)
    ThemeToggle.init();

    // Initialize navbar (drawer, backdrop, events)
    Navbar.init();

    // Initialize smooth scroll enhancements
    SmoothScroll.init();

    // Start preloader sequence
    Preloader.init();
  }

  // ── Kick everything off ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
