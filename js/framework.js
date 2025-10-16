/**
 * Adion Framework - Core JavaScript
 * The world's most advanced web framework
 * Created by Adion Team - Version 1.0.0
 */

(function(global) {
  'use strict';

  // ========================================
  // CORE FRAMEWORK
  // ========================================

  class AYdocsFramework {
    constructor() {
      this.version = '1.0.0';
      this.components = new Map();
      this.modals = new Map();
      this.toasts = new Map();
      this.theme = new ThemeManager();
      this.animations = new AnimationManager();
      this.utils = new UtilityManager();
      
      this.init();
    }

    init() {
      // Initialize framework when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onReady());
      } else {
        this.onReady();
      }
    }

    onReady() {
      console.log(`🚀 AYdocs Framework v${this.version} initialized`);
      
      // Initialize theme
      this.theme.init();
      
      // Initialize animations
      this.animations.init();
      
      // Initialize components
      this.initComponents();
      
      // Initialize modals
      this.initModals();
      
      // Initialize toasts
      this.initToasts();
      
      // Initialize navigation
      this.initNavigation();
      
      // Initialize forms
      this.initForms();
      
      // Initialize lazy loading
      this.initLazyLoading();
      
      // Initialize intersection observer for animations
      this.initIntersectionObserver();
      
      // Dispatch ready event
      this.dispatchEvent('aydocs:ready', { framework: this });
    }

    // ========================================
    // COMPONENT SYSTEM
    // ========================================

    initComponents() {
      // Initialize all components with data-aydocs attribute
      const componentElements = document.querySelectorAll('[data-aydocs]');
      componentElements.forEach(element => {
        const componentType = element.getAttribute('data-aydocs');
        this.createComponent(componentType, element);
      });
    }

    createComponent(type, element, options = {}) {
      const componentId = this.utils.generateId();
      
      switch (type) {
        case 'button':
          return new ButtonComponent(element, componentId, options);
        case 'card':
          return new CardComponent(element, componentId, options);
        case 'modal':
          return new ModalComponent(element, componentId, options);
        case 'toast':
          return new ToastComponent(element, componentId, options);
        case 'form':
          return new FormComponent(element, componentId, options);
        case 'dropdown':
          return new DropdownComponent(element, componentId, options);
        case 'tabs':
          return new TabsComponent(element, componentId, options);
        case 'accordion':
          return new AccordionComponent(element, componentId, options);
        case 'carousel':
          return new CarouselComponent(element, componentId, options);
        case 'tooltip':
          return new TooltipComponent(element, componentId, options);
        default:
          console.warn(`Unknown component type: ${type}`);
          return null;
      }
    }

    // ========================================
    // MODAL SYSTEM
    // ========================================

    initModals() {
      // Create modal container if it doesn't exist
      if (!document.getElementById('modal-container')) {
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.className = 'modal-container';
        document.body.appendChild(container);
      }

      // Initialize modal triggers
      const modalTriggers = document.querySelectorAll('[data-modal]');
      modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute('data-modal');
          this.openModal(modalId);
        });
      });
    }

    openModal(modalId, options = {}) {
      const modal = this.modals.get(modalId) || this.createModal(modalId, options);
      modal.open();
      return modal;
    }

    closeModal(modalId) {
      const modal = this.modals.get(modalId);
      if (modal) {
        modal.close();
      }
    }

    createModal(id, options = {}) {
      const modal = new ModalComponent(null, id, options);
      this.modals.set(id, modal);
      return modal;
    }

    // ========================================
    // TOAST SYSTEM
    // ========================================

    initToasts() {
      // Create toast container if it doesn't exist
      if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }

    showToast(message, type = 'info', options = {}) {
      const toast = new ToastComponent(null, this.utils.generateId(), {
        message,
        type,
        ...options
      });
      
      this.toasts.set(toast.id, toast);
      toast.show();
      
      // Auto remove after duration
      setTimeout(() => {
        this.hideToast(toast.id);
      }, options.duration || 5000);
      
      return toast;
    }

    hideToast(toastId) {
      const toast = this.toasts.get(toastId);
      if (toast) {
        toast.hide();
        this.toasts.delete(toastId);
      }
    }

    // ========================================
    // NAVIGATION
    // ========================================

    initNavigation() {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;

      // Mobile menu toggle
      const mobileToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
          mobileMenu.classList.toggle('show');
          mobileToggle.classList.toggle('active');
        });
      }

      // Smooth scrolling for anchor links
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#') return;
          
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Active navigation highlighting
      this.initActiveNavigation();
    }

    initActiveNavigation() {
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
      const sections = document.querySelectorAll('section[id]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              }
            });
          }
        });
      }, { threshold: 0.3 });

      sections.forEach(section => observer.observe(section));
    }

    // ========================================
    // FORM SYSTEM
    // ========================================

    initForms() {
      const forms = document.querySelectorAll('form[data-aydocs="form"]');
      forms.forEach(form => {
        new FormComponent(form, this.utils.generateId());
      });
    }

    // ========================================
    // LAZY LOADING
    // ========================================

    initLazyLoading() {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.getAttribute('data-src');
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
      }
    }

    // ========================================
    // INTERSECTION OBSERVER
    // ========================================

    initIntersectionObserver() {
      const animatedElements = document.querySelectorAll('[data-animate]');
      
      if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const animation = element.getAttribute('data-animate');
              this.animations.animate(element, animation);
              observer.unobserve(element);
            }
          });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => observer.observe(element));
      }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    dispatchEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, { detail });
      document.dispatchEvent(event);
    }

    on(eventName, callback) {
      document.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
      document.removeEventListener(eventName, callback);
    }

    // ========================================
    // STATIC METHODS
    // ========================================

    static create(options = {}) {
      return new AYdocsFramework(options);
    }

    static version() {
      return '1.0.0';
    }
  }

  // ========================================
  // THEME MANAGER
  // ========================================

  class ThemeManager {
    constructor() {
      this.currentTheme = 'light';
      this.themes = ['light', 'dark'];
    }

    init() {
      // Load saved theme
      const savedTheme = localStorage.getItem('aydocs-theme');
      if (savedTheme && this.themes.includes(savedTheme)) {
        this.setTheme(savedTheme);
      } else {
        this.setTheme(this.detectSystemTheme());
      }

      // Initialize theme toggle
      this.initThemeToggle();
    }

    detectSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setTheme(theme) {
      if (!this.themes.includes(theme)) return;

      this.currentTheme = theme;
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem('aydocs-theme', theme);
      
      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('aydocs:theme-change', { 
        detail: { theme } 
      }));
    }

    toggleTheme() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    }

    initThemeToggle() {
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => this.toggleTheme());
      }
    }
  }

  // ========================================
  // ANIMATION MANAGER
  // ========================================

  class AnimationManager {
    constructor() {
      this.animations = {
        fadeIn: this.fadeIn.bind(this),
        fadeInUp: this.fadeInUp.bind(this),
        fadeInDown: this.fadeInDown.bind(this),
        fadeInLeft: this.fadeInLeft.bind(this),
        fadeInRight: this.fadeInRight.bind(this),
        slideInUp: this.slideInUp.bind(this),
        slideInDown: this.slideInDown.bind(this),
        slideInLeft: this.slideInLeft.bind(this),
        slideInRight: this.slideInRight.bind(this),
        zoomIn: this.zoomIn.bind(this),
        zoomOut: this.zoomOut.bind(this),
        bounceIn: this.bounceIn.bind(this),
        pulse: this.pulse.bind(this),
        shake: this.shake.bind(this),
        wobble: this.wobble.bind(this)
      };
    }

    init() {
      // Add CSS for animations
      this.addAnimationStyles();
    }

    animate(element, animationName, duration = 1000, delay = 0) {
      if (!this.animations[animationName]) {
        console.warn(`Animation "${animationName}" not found`);
        return;
      }

      setTimeout(() => {
        this.animations[animationName](element, duration);
      }, delay);
    }

    fadeIn(element, duration = 1000) {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
    }

    fadeInUp(element, duration = 1000) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }

    fadeInDown(element, duration = 1000) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-30px)';
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }

    fadeInLeft(element, duration = 1000) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(-30px)';
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      });
    }

    fadeInRight(element, duration = 1000) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(30px)';
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      });
    }

    slideInUp(element, duration = 1000) {
      element.style.transform = 'translateY(100%)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'translateY(0)';
      });
    }

    slideInDown(element, duration = 1000) {
      element.style.transform = 'translateY(-100%)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'translateY(0)';
      });
    }

    slideInLeft(element, duration = 1000) {
      element.style.transform = 'translateX(-100%)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'translateX(0)';
      });
    }

    slideInRight(element, duration = 1000) {
      element.style.transform = 'translateX(100%)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'translateX(0)';
      });
    }

    zoomIn(element, duration = 1000) {
      element.style.transform = 'scale(0)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'scale(1)';
      });
    }

    zoomOut(element, duration = 1000) {
      element.style.transform = 'scale(1)';
      element.style.transition = `transform ${duration}ms ease`;
      requestAnimationFrame(() => {
        element.style.transform = 'scale(0)';
      });
    }

    bounceIn(element, duration = 1000) {
      element.style.transform = 'scale(0)';
      element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      requestAnimationFrame(() => {
        element.style.transform = 'scale(1)';
      });
    }

    pulse(element, duration = 1000) {
      const originalTransform = element.style.transform;
      element.style.animation = `pulse ${duration}ms ease-in-out`;
    }

    shake(element, duration = 1000) {
      element.style.animation = `shake ${duration}ms ease-in-out`;
    }

    wobble(element, duration = 1000) {
      element.style.animation = `wobble ${duration}ms ease-in-out`;
    }

    addAnimationStyles() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        @keyframes wobble {
          0% { transform: translateX(0%); }
          15% { transform: translateX(-25%) rotate(-5deg); }
          30% { transform: translateX(20%) rotate(3deg); }
          45% { transform: translateX(-15%) rotate(-3deg); }
          60% { transform: translateX(10%) rotate(2deg); }
          75% { transform: translateX(-5%) rotate(-1deg); }
          100% { transform: translateX(0%); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ========================================
  // UTILITY MANAGER
  // ========================================

  class UtilityManager {
    generateId() {
      return 'aydocs-' + Math.random().toString(36).substr(2, 9);
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    getScrollPosition() {
      return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      };
    }

    smoothScrollTo(element, offset = 0) {
      const targetPosition = element.offsetTop - offset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let start = null;

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  }

  // ========================================
  // BASE COMPONENT CLASS
  // ========================================

  class BaseComponent {
    constructor(element, id, options = {}) {
      this.element = element;
      this.id = id;
      this.options = { ...this.defaultOptions, ...options };
      this.isInitialized = false;
      
      this.init();
    }

    get defaultOptions() {
      return {};
    }

    init() {
      if (this.isInitialized) return;
      
      this.bindEvents();
      this.isInitialized = true;
    }

    bindEvents() {
      // Override in child classes
    }

    destroy() {
      // Override in child classes
    }

    update(options) {
      this.options = { ...this.options, ...options };
    }
  }

  // ========================================
  // COMPONENT CLASSES
  // ========================================

  class ButtonComponent extends BaseComponent {
    get defaultOptions() {
      return {
        loading: false,
        disabled: false,
        ripple: true
      };
    }

    bindEvents() {
      if (!this.element) return;
      
      this.element.addEventListener('click', (e) => {
        if (this.options.ripple) {
          this.createRipple(e);
        }
        
        if (this.options.loading) {
          e.preventDefault();
          return;
        }
        
        // Dispatch click event
        this.element.dispatchEvent(new CustomEvent('aydocs:button:click', {
          detail: { component: this }
        }));
      });
    }

    createRipple(event) {
      const button = this.element;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
      circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
      circle.classList.add('ripple');

      const ripple = button.getElementsByClassName('ripple')[0];
      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);

      setTimeout(() => {
        circle.remove();
      }, 600);
    }

    setLoading(loading) {
      this.options.loading = loading;
      
      if (loading) {
        this.element.disabled = true;
        this.element.classList.add('loading');
        this.originalText = this.element.textContent;
        this.element.innerHTML = '<span class="loading-spinner"></span> Loading...';
      } else {
        this.element.disabled = false;
        this.element.classList.remove('loading');
        this.element.textContent = this.originalText;
      }
    }
  }

  class ModalComponent extends BaseComponent {
    get defaultOptions() {
      return {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        size: 'md'
      };
    }

    init() {
      if (this.element) {
        this.modal = this.element;
      } else {
        this.createModal();
      }
      
      super.init();
    }

    createModal() {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = this.id;
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      modal.appendChild(backdrop);
      modal.appendChild(modalContent);
      
      const container = document.getElementById('modal-container');
      if (container) {
        container.appendChild(modal);
        this.modal = modal;
      }
    }

    bindEvents() {
      if (!this.modal) return;
      
      // Close on backdrop click
      const backdrop = this.modal.querySelector('.modal-backdrop');
      if (backdrop && this.options.backdrop) {
        backdrop.addEventListener('click', () => this.close());
      }
      
      // Close on escape key
      if (this.options.keyboard) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }
      
      // Close button
      const closeBtn = this.modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
    }

    open() {
      if (!this.modal) return;
      
      this.modal.style.display = 'flex';
      this.isOpen = true;
      
      // Animate in
      requestAnimationFrame(() => {
        this.modal.classList.add('show');
        const backdrop = this.modal.querySelector('.modal-backdrop');
        if (backdrop) backdrop.classList.add('show');
      });
      
      // Focus management
      if (this.options.focus) {
        const focusable = this.modal.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      }
      
      // Dispatch event
      this.modal.dispatchEvent(new CustomEvent('aydocs:modal:open', {
        detail: { component: this }
      }));
    }

    close() {
      if (!this.modal || !this.isOpen) return;
      
      this.modal.classList.remove('show');
      const backdrop = this.modal.querySelector('.modal-backdrop');
      if (backdrop) backdrop.classList.remove('show');
      
      setTimeout(() => {
        this.modal.style.display = 'none';
        this.isOpen = false;
        
        // Dispatch event
        this.modal.dispatchEvent(new CustomEvent('aydocs:modal:close', {
          detail: { component: this }
        }));
      }, 300);
    }
  }

  class ToastComponent extends BaseComponent {
    get defaultOptions() {
      return {
        type: 'info',
        duration: 5000,
        position: 'top-right',
        closable: true,
        pauseOnHover: true
      };
    }

    init() {
      if (this.element) {
        this.toast = this.element;
      } else {
        this.createToast();
      }
      
      super.init();
    }

    createToast() {
      const toast = document.createElement('div');
      toast.className = `toast toast-${this.options.type}`;
      toast.id = this.id;
      
      const icon = this.getIcon();
      const closeBtn = this.options.closable ? 
        '<button class="toast-close" aria-label="Close">&times;</button>' : '';
      
      toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
          <div class="toast-title">${this.options.title || this.getDefaultTitle()}</div>
          <div class="toast-message">${this.options.message}</div>
        </div>
        ${closeBtn}
      `;
      
      const container = document.getElementById('toast-container');
      if (container) {
        container.appendChild(toast);
        this.toast = toast;
      }
    }

    getIcon() {
      const icons = {
        success: '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        error: '<svg viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
        info: '<svg viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
      };
      
      return icons[this.options.type] || icons.info;
    }

    getDefaultTitle() {
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      };
      
      return titles[this.options.type] || 'Notification';
    }

    bindEvents() {
      if (!this.toast) return;
      
      // Close button
      const closeBtn = this.toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }
      
      // Pause on hover
      if (this.options.pauseOnHover) {
        this.toast.addEventListener('mouseenter', () => this.pause());
        this.toast.addEventListener('mouseleave', () => this.resume());
      }
    }

    show() {
      if (!this.toast) return;
      
      this.toast.style.display = 'flex';
      
      requestAnimationFrame(() => {
        this.toast.classList.add('show');
      });
      
      // Dispatch event
      this.toast.dispatchEvent(new CustomEvent('aydocs:toast:show', {
        detail: { component: this }
      }));
    }

    hide() {
      if (!this.toast) return;
      
      this.toast.classList.remove('show');
      
      setTimeout(() => {
        if (this.toast.parentNode) {
          this.toast.parentNode.removeChild(this.toast);
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('aydocs:toast:hide', {
          detail: { component: this }
        }));
      }, 300);
    }

    pause() {
      // Pause auto-hide timer
    }

    resume() {
      // Resume auto-hide timer
    }
  }

  class FormComponent extends BaseComponent {
    get defaultOptions() {
      return {
        validation: true,
        ajax: false,
        resetOnSubmit: true
      };
    }

    bindEvents() {
      if (!this.element) return;
      
      this.element.addEventListener('submit', (e) => {
        if (this.options.validation && !this.validate()) {
          e.preventDefault();
          return;
        }
        
        if (this.options.ajax) {
          e.preventDefault();
          this.submitAjax();
        }
      });
      
      // Real-time validation
      if (this.options.validation) {
        const inputs = this.element.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
        });
      }
    }

    validate() {
      const inputs = this.element.querySelectorAll('input[required], textarea[required], select[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });
      
      return isValid;
    }

    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const required = field.hasAttribute('required');
      
      // Clear previous errors
      this.clearFieldError(field);
      
      // Required validation
      if (required && !value) {
        this.showFieldError(field, 'This field is required');
        return false;
      }
      
      // Type-specific validation
      if (value) {
        switch (type) {
          case 'email':
            if (!this.isValidEmail(value)) {
              this.showFieldError(field, 'Please enter a valid email address');
              return false;
            }
            break;
          case 'url':
            if (!this.isValidUrl(value)) {
              this.showFieldError(field, 'Please enter a valid URL');
              return false;
            }
            break;
          case 'tel':
            if (!this.isValidPhone(value)) {
              this.showFieldError(field, 'Please enter a valid phone number');
              return false;
            }
            break;
        }
      }
      
      return true;
    }

    showFieldError(field, message) {
      field.classList.add('is-error');
      
      let errorElement = field.parentNode.querySelector('.form-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
    }

    clearFieldError(field) {
      field.classList.remove('is-error');
      
      const errorElement = field.parentNode.querySelector('.form-error');
      if (errorElement) {
        errorElement.remove();
      }
    }

    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }

    isValidPhone(phone) {
      const re = /^[\+]?[1-9][\d]{0,15}$/;
      return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    async submitAjax() {
      const formData = new FormData(this.element);
      const data = Object.fromEntries(formData);
      
      try {
        // Show loading state
        this.setLoading(true);
        
        // Submit form (replace with actual endpoint)
        const response = await fetch(this.element.action || '/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Success
          if (window.AYdocs) {
            window.AYdocs.showToast('Form submitted successfully!', 'success');
          }
          
          if (this.options.resetOnSubmit) {
            this.element.reset();
          }
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // Error
        if (window.AYdocs) {
          window.AYdocs.showToast('Form submission failed. Please try again.', 'error');
        }
      } finally {
        this.setLoading(false);
      }
    }

    setLoading(loading) {
      const submitBtn = this.element.querySelector('button[type="submit"]');
      if (submitBtn) {
        if (loading) {
          submitBtn.disabled = true;
          submitBtn.classList.add('loading');
        } else {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      }
    }
  }

  // Placeholder classes for other components
  class CardComponent extends BaseComponent {}
  class DropdownComponent extends BaseComponent {}
  class TabsComponent extends BaseComponent {}
  class AccordionComponent extends BaseComponent {}
  class CarouselComponent extends BaseComponent {}
  class TooltipComponent extends BaseComponent {}

  // ========================================
  // GLOBAL EXPOSURE
  // ========================================

  // Create global instance
  global.AYdocs = new AYdocsFramework();

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AYdocsFramework;
  }

})(window);
