/**
 * Adion Framework - Components JavaScript
 * Advanced UI components and interactions
 */

(function() {
  'use strict';

  // ========================================
  // COMPONENT REGISTRY
  // ========================================

  class ComponentRegistry {
    constructor() {
      this.components = new Map();
      this.observers = new Map();
    }

    register(name, component) {
      this.components.set(name, component);
    }

    get(name) {
      return this.components.get(name);
    }

    create(name, element, options = {}) {
      const ComponentClass = this.get(name);
      if (ComponentClass) {
        return new ComponentClass(element, options);
      }
      throw new Error(`Component "${name}" not found`);
    }
  }

  // ========================================
  // DROPDOWN COMPONENT
  // ========================================

  class DropdownComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        trigger: 'click',
        placement: 'bottom-start',
        offset: 8,
        closeOnClickOutside: true,
        closeOnEscape: true,
        ...options
      };
      
      this.isOpen = false;
      this.dropdown = null;
      this.trigger = null;
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.createDropdown();
      this.bindEvents();
    }

    createDropdown() {
      // Find trigger element
      this.trigger = this.element.querySelector('[data-dropdown-trigger]') || this.element;
      
      // Create dropdown menu
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'dropdown-menu';
      this.dropdown.setAttribute('data-dropdown-menu', '');
      
      // Get menu content
      const menuContent = this.element.querySelector('[data-dropdown-menu]');
      if (menuContent) {
        this.dropdown.innerHTML = menuContent.innerHTML;
        menuContent.remove();
      }
      
      // Position dropdown
      this.positionDropdown();
      
      // Add to DOM
      document.body.appendChild(this.dropdown);
    }

    positionDropdown() {
      const triggerRect = this.trigger.getBoundingClientRect();
      const dropdownRect = this.dropdown.getBoundingClientRect();
      
      let top = triggerRect.bottom + this.options.offset;
      let left = triggerRect.left;
      
      // Adjust position based on placement
      switch (this.options.placement) {
        case 'top-start':
          top = triggerRect.top - dropdownRect.height - this.options.offset;
          break;
        case 'top-end':
          top = triggerRect.top - dropdownRect.height - this.options.offset;
          left = triggerRect.right - dropdownRect.width;
          break;
        case 'bottom-end':
          left = triggerRect.right - dropdownRect.width;
          break;
        case 'left-start':
          left = triggerRect.left - dropdownRect.width - this.options.offset;
          top = triggerRect.top;
          break;
        case 'right-start':
          left = triggerRect.right + this.options.offset;
          top = triggerRect.top;
          break;
      }
      
      // Keep dropdown in viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left + dropdownRect.width > viewportWidth) {
        left = viewportWidth - dropdownRect.width - 16;
      }
      
      if (top + dropdownRect.height > viewportHeight) {
        top = triggerRect.top - dropdownRect.height - this.options.offset;
      }
      
      if (left < 0) left = 16;
      if (top < 0) top = 16;
      
      this.dropdown.style.position = 'fixed';
      this.dropdown.style.top = `${top}px`;
      this.dropdown.style.left = `${left}px`;
      this.dropdown.style.zIndex = '1000';
    }

    bindEvents() {
      if (this.options.trigger === 'click') {
        this.trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle();
        });
      } else if (this.options.trigger === 'hover') {
        this.trigger.addEventListener('mouseenter', () => this.open());
        this.trigger.addEventListener('mouseleave', () => this.close());
        this.dropdown.addEventListener('mouseenter', () => this.open());
        this.dropdown.addEventListener('mouseleave', () => this.close());
      }
      
      // Close on escape
      if (this.options.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }
      
      // Close on outside click
      if (this.options.closeOnClickOutside) {
        document.addEventListener('click', (e) => {
          if (this.isOpen && !this.element.contains(e.target) && !this.dropdown.contains(e.target)) {
            this.close();
          }
        });
      }
      
      // Handle dropdown item clicks
      this.dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('[data-dropdown-item]');
        if (item) {
          const value = item.getAttribute('data-value');
          const text = item.textContent;
          
          this.element.dispatchEvent(new CustomEvent('dropdown:select', {
            detail: { value, text, item }
          }));
          
          if (item.hasAttribute('data-close-on-select')) {
            this.close();
          }
        }
      });
    }

    open() {
      if (this.isOpen) return;
      
      this.positionDropdown();
      this.dropdown.style.display = 'block';
      
      requestAnimationFrame(() => {
        this.dropdown.classList.add('show');
        this.isOpen = true;
        
        this.element.dispatchEvent(new CustomEvent('dropdown:open'));
      });
    }

    close() {
      if (!this.isOpen) return;
      
      this.dropdown.classList.remove('show');
      
      setTimeout(() => {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        
        this.element.dispatchEvent(new CustomEvent('dropdown:close'));
      }, 150);
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      if (this.dropdown && this.dropdown.parentNode) {
        this.dropdown.parentNode.removeChild(this.dropdown);
      }
    }
  }

  // ========================================
  // TABS COMPONENT
  // ========================================

  class TabsComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        activeTab: 0,
        autoHeight: true,
        ...options
      };
      
      this.tabs = [];
      this.panels = [];
      this.activeIndex = this.options.activeTab;
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.findTabsAndPanels();
      this.bindEvents();
      this.showTab(this.activeIndex);
    }

    findTabsAndPanels() {
      this.tabs = Array.from(this.element.querySelectorAll('[data-tab]'));
      this.panels = Array.from(this.element.querySelectorAll('[data-tab-panel]'));
      
      // Create tab list if it doesn't exist
      if (!this.element.querySelector('.tab-list')) {
        this.createTabList();
      }
    }

    createTabList() {
      const tabList = document.createElement('div');
      tabList.className = 'tab-list';
      
      this.tabs.forEach((tab, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.textContent = tab.textContent;
        tabButton.setAttribute('data-tab-index', index);
        tabButton.setAttribute('role', 'tab');
        tabButton.setAttribute('aria-selected', 'false');
        
        if (index === this.activeIndex) {
          tabButton.classList.add('active');
          tabButton.setAttribute('aria-selected', 'true');
        }
        
        tabList.appendChild(tabButton);
      });
      
      this.element.insertBefore(tabList, this.element.firstChild);
    }

    bindEvents() {
      // Tab button clicks
      this.element.addEventListener('click', (e) => {
        const tabButton = e.target.closest('.tab-button');
        if (tabButton) {
          const index = parseInt(tabButton.getAttribute('data-tab-index'));
          this.showTab(index);
        }
      });
      
      // Keyboard navigation
      this.element.addEventListener('keydown', (e) => {
        const tabButton = e.target.closest('.tab-button');
        if (!tabButton) return;
        
        const currentIndex = parseInt(tabButton.getAttribute('data-tab-index'));
        let newIndex = currentIndex;
        
        switch (e.key) {
          case 'ArrowLeft':
            newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
            break;
          case 'ArrowRight':
            newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = this.tabs.length - 1;
            break;
          default:
            return;
        }
        
        e.preventDefault();
        this.showTab(newIndex);
        this.element.querySelector(`[data-tab-index="${newIndex}"]`).focus();
      });
    }

    showTab(index) {
      if (index < 0 || index >= this.tabs.length) return;
      
      // Update active tab
      this.activeIndex = index;
      
      // Update tab buttons
      this.element.querySelectorAll('.tab-button').forEach((button, i) => {
        button.classList.toggle('active', i === index);
        button.setAttribute('aria-selected', i === index);
      });
      
      // Update tab panels
      this.panels.forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
        panel.setAttribute('aria-hidden', i !== index);
      });
      
      // Auto height adjustment
      if (this.options.autoHeight) {
        this.adjustHeight();
      }
      
      this.element.dispatchEvent(new CustomEvent('tabs:change', {
        detail: { index, tab: this.tabs[index], panel: this.panels[index] }
      }));
    }

    adjustHeight() {
      const activePanel = this.panels[this.activeIndex];
      if (activePanel) {
        const content = this.element.querySelector('.tab-content');
        if (content) {
          content.style.height = `${activePanel.offsetHeight}px`;
        }
      }
    }

    nextTab() {
      const nextIndex = this.activeIndex < this.tabs.length - 1 ? this.activeIndex + 1 : 0;
      this.showTab(nextIndex);
    }

    prevTab() {
      const prevIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.tabs.length - 1;
      this.showTab(prevIndex);
    }
  }

  // ========================================
  // ACCORDION COMPONENT
  // ========================================

  class AccordionComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        allowMultiple: false,
        allowToggle: true,
        ...options
      };
      
      this.items = [];
      this.activeItems = new Set();
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.findItems();
      this.bindEvents();
    }

    findItems() {
      this.items = Array.from(this.element.querySelectorAll('[data-accordion-item]'));
      
      this.items.forEach((item, index) => {
        const trigger = item.querySelector('[data-accordion-trigger]');
        const panel = item.querySelector('[data-accordion-panel]');
        
        if (trigger && panel) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.setAttribute('aria-controls', `accordion-panel-${index}`);
          panel.setAttribute('id', `accordion-panel-${index}`);
          panel.setAttribute('aria-labelledby', trigger.id || `accordion-trigger-${index}`);
          
          if (!trigger.id) {
            trigger.id = `accordion-trigger-${index}`;
          }
        }
      });
    }

    bindEvents() {
      this.element.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-accordion-trigger]');
        if (trigger) {
          e.preventDefault();
          this.toggleItem(trigger);
        }
      });
    }

    toggleItem(trigger) {
      const item = trigger.closest('[data-accordion-item]');
      const panel = item.querySelector('[data-accordion-panel]');
      const isActive = item.classList.contains('active');
      
      if (isActive && this.options.allowToggle) {
        this.closeItem(item, panel, trigger);
      } else {
        this.openItem(item, panel, trigger);
      }
    }

    openItem(item, panel, trigger) {
      // Close other items if not allowing multiple
      if (!this.options.allowMultiple) {
        this.closeAllItems();
      }
      
      item.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      this.activeItems.add(item);
      
      // Animate panel
      panel.style.maxHeight = '0px';
      panel.style.overflow = 'hidden';
      panel.style.transition = 'max-height 0.3s ease';
      
      requestAnimationFrame(() => {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });
      
      // Remove transition after animation
      setTimeout(() => {
        panel.style.maxHeight = '';
        panel.style.overflow = '';
        panel.style.transition = '';
      }, 300);
      
      this.element.dispatchEvent(new CustomEvent('accordion:open', {
        detail: { item, panel, trigger }
      }));
    }

    closeItem(item, panel, trigger) {
      item.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
      this.activeItems.delete(item);
      
      // Animate panel
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.style.overflow = 'hidden';
      panel.style.transition = 'max-height 0.3s ease';
      
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0px';
      });
      
      setTimeout(() => {
        panel.style.maxHeight = '';
        panel.style.overflow = '';
        panel.style.transition = '';
      }, 300);
      
      this.element.dispatchEvent(new CustomEvent('accordion:close', {
        detail: { item, panel, trigger }
      }));
    }

    closeAllItems() {
      this.items.forEach(item => {
        const panel = item.querySelector('[data-accordion-panel]');
        const trigger = item.querySelector('[data-accordion-trigger]');
        
        if (item.classList.contains('active')) {
          this.closeItem(item, panel, trigger);
        }
      });
    }

    openAllItems() {
      if (this.options.allowMultiple) {
        this.items.forEach(item => {
          const panel = item.querySelector('[data-accordion-panel]');
          const trigger = item.querySelector('[data-accordion-trigger]');
          
          if (!item.classList.contains('active')) {
            this.openItem(item, panel, trigger);
          }
        });
      }
    }
  }

  // ========================================
  // CAROUSEL COMPONENT
  // ========================================

  class CarouselComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        autoplay: false,
        interval: 5000,
        loop: true,
        showDots: true,
        showArrows: true,
        ...options
      };
      
      this.slides = [];
      this.currentIndex = 0;
      this.autoplayTimer = null;
      this.isTransitioning = false;
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.findSlides();
      this.createCarousel();
      this.bindEvents();
      
      if (this.options.autoplay) {
        this.startAutoplay();
      }
    }

    findSlides() {
      this.slides = Array.from(this.element.querySelectorAll('[data-carousel-slide]'));
      
      if (this.slides.length === 0) {
        // Create slides from direct children
        this.slides = Array.from(this.element.children).filter(child => 
          child.nodeType === Node.ELEMENT_NODE
        );
      }
    }

    createCarousel() {
      // Create carousel container
      this.container = document.createElement('div');
      this.container.className = 'carousel-container';
      
      // Create slides wrapper
      this.slidesWrapper = document.createElement('div');
      this.slidesWrapper.className = 'carousel-slides';
      
      // Move slides to wrapper
      this.slides.forEach((slide, index) => {
        slide.classList.add('carousel-slide');
        slide.setAttribute('data-slide-index', index);
        this.slidesWrapper.appendChild(slide);
      });
      
      this.container.appendChild(this.slidesWrapper);
      
      // Create navigation
      if (this.options.showArrows) {
        this.createArrows();
      }
      
      if (this.options.showDots) {
        this.createDots();
      }
      
      // Replace element content
      this.element.innerHTML = '';
      this.element.appendChild(this.container);
      
      // Show first slide
      this.showSlide(0);
    }

    createArrows() {
      this.prevButton = document.createElement('button');
      this.prevButton.className = 'carousel-arrow carousel-arrow-prev';
      this.prevButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
      this.prevButton.setAttribute('aria-label', 'Previous slide');
      
      this.nextButton = document.createElement('button');
      this.nextButton.className = 'carousel-arrow carousel-arrow-next';
      this.nextButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
      this.nextButton.setAttribute('aria-label', 'Next slide');
      
      this.container.appendChild(this.prevButton);
      this.container.appendChild(this.nextButton);
    }

    createDots() {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'carousel-dots';
      
      this.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('data-slide-index', index);
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        
        if (index === 0) {
          dot.classList.add('active');
        }
        
        this.dotsContainer.appendChild(dot);
      });
      
      this.container.appendChild(this.dotsContainer);
    }

    bindEvents() {
      // Arrow clicks
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.prevSlide());
      }
      
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.nextSlide());
      }
      
      // Dot clicks
      if (this.dotsContainer) {
        this.dotsContainer.addEventListener('click', (e) => {
          const dot = e.target.closest('.carousel-dot');
          if (dot) {
            const index = parseInt(dot.getAttribute('data-slide-index'));
            this.goToSlide(index);
          }
        });
      }
      
      // Keyboard navigation
      this.element.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.prevSlide();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextSlide();
            break;
          case 'Home':
            e.preventDefault();
            this.goToSlide(0);
            break;
          case 'End':
            e.preventDefault();
            this.goToSlide(this.slides.length - 1);
            break;
        }
      });
      
      // Touch/swipe support
      this.addTouchSupport();
      
      // Pause autoplay on hover
      if (this.options.autoplay) {
        this.element.addEventListener('mouseenter', () => this.stopAutoplay());
        this.element.addEventListener('mouseleave', () => this.startAutoplay());
      }
    }

    addTouchSupport() {
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      
      this.element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
      });
      
      this.element.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY)) {
          e.preventDefault();
        }
      });
      
      this.element.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        }
        
        isDragging = false;
      });
    }

    showSlide(index) {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      
      // Update current index
      this.currentIndex = index;
      
      // Update slides
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      // Update dots
      if (this.dotsContainer) {
        this.dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
      
      // Update arrows
      if (this.options.loop) {
        if (this.prevButton) this.prevButton.style.display = '';
        if (this.nextButton) this.nextButton.style.display = '';
      } else {
        if (this.prevButton) this.prevButton.style.display = index === 0 ? 'none' : '';
        if (this.nextButton) this.nextButton.style.display = index === this.slides.length - 1 ? 'none' : '';
      }
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 300);
      
      this.element.dispatchEvent(new CustomEvent('carousel:change', {
        detail: { index, slide: this.slides[index] }
      }));
    }

    nextSlide() {
      let nextIndex = this.currentIndex + 1;
      
      if (nextIndex >= this.slides.length) {
        nextIndex = this.options.loop ? 0 : this.slides.length - 1;
      }
      
      this.showSlide(nextIndex);
    }

    prevSlide() {
      let prevIndex = this.currentIndex - 1;
      
      if (prevIndex < 0) {
        prevIndex = this.options.loop ? this.slides.length - 1 : 0;
      }
      
      this.showSlide(prevIndex);
    }

    goToSlide(index) {
      if (index >= 0 && index < this.slides.length) {
        this.showSlide(index);
      }
    }

    startAutoplay() {
      if (this.autoplayTimer) return;
      
      this.autoplayTimer = setInterval(() => {
        this.nextSlide();
      }, this.options.interval);
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    destroy() {
      this.stopAutoplay();
      
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // ========================================
  // TOOLTIP COMPONENT
  // ========================================

  class TooltipComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        placement: 'top',
        offset: 8,
        delay: 200,
        trigger: 'hover',
        ...options
      };
      
      this.tooltip = null;
      this.showTimer = null;
      this.hideTimer = null;
      this.isVisible = false;
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.createTooltip();
      this.bindEvents();
    }

    createTooltip() {
      const text = this.element.getAttribute('data-tooltip') || this.element.getAttribute('title');
      
      if (!text) return;
      
      // Remove title attribute to prevent default tooltip
      this.element.removeAttribute('title');
      
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'tooltip';
      this.tooltip.textContent = text;
      this.tooltip.setAttribute('role', 'tooltip');
      
      document.body.appendChild(this.tooltip);
    }

    bindEvents() {
      if (this.options.trigger === 'hover') {
        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
        this.tooltip.addEventListener('mouseenter', () => this.show());
        this.tooltip.addEventListener('mouseleave', () => this.hide());
      } else if (this.options.trigger === 'click') {
        this.element.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      } else if (this.options.trigger === 'focus') {
        this.element.addEventListener('focus', () => this.show());
        this.element.addEventListener('blur', () => this.hide());
      }
      
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.hide();
        }
      });
    }

    show() {
      if (this.isVisible || !this.tooltip) return;
      
      clearTimeout(this.hideTimer);
      
      this.showTimer = setTimeout(() => {
        this.positionTooltip();
        this.tooltip.classList.add('show');
        this.isVisible = true;
        
        this.element.dispatchEvent(new CustomEvent('tooltip:show'));
      }, this.options.delay);
    }

    hide() {
      if (!this.isVisible || !this.tooltip) return;
      
      clearTimeout(this.showTimer);
      
      this.hideTimer = setTimeout(() => {
        this.tooltip.classList.remove('show');
        this.isVisible = false;
        
        this.element.dispatchEvent(new CustomEvent('tooltip:hide'));
      }, 100);
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    positionTooltip() {
      const elementRect = this.element.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (this.options.placement) {
        case 'top':
          top = elementRect.top - tooltipRect.height - this.options.offset;
          left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = elementRect.bottom + this.options.offset;
          left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
          left = elementRect.left - tooltipRect.width - this.options.offset;
          break;
        case 'right':
          top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
          left = elementRect.right + this.options.offset;
          break;
      }
      
      // Keep tooltip in viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 0) left = 8;
      if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8;
      if (top < 0) top = 8;
      if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8;
      
      this.tooltip.style.position = 'fixed';
      this.tooltip.style.top = `${top}px`;
      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.zIndex = '1000';
    }

    destroy() {
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
      
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
    }
  }

  // ========================================
  // INITIALIZE COMPONENTS
  // ========================================

  function initializeComponents() {
    // Initialize dropdowns
    document.querySelectorAll('[data-aydocs="dropdown"]').forEach(element => {
      new DropdownComponent(element);
    });
    
    // Initialize tabs
    document.querySelectorAll('[data-aydocs="tabs"]').forEach(element => {
      new TabsComponent(element);
    });
    
    // Initialize accordions
    document.querySelectorAll('[data-aydocs="accordion"]').forEach(element => {
      new AccordionComponent(element);
    });
    
    // Initialize carousels
    document.querySelectorAll('[data-aydocs="carousel"]').forEach(element => {
      new CarouselComponent(element);
    });
    
    // Initialize tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      new TooltipComponent(element);
    });
  }

  // ========================================
  // EXPORT COMPONENTS
  // ========================================

  window.AYdocsComponents = {
    DropdownComponent,
    TabsComponent,
    AccordionComponent,
    CarouselComponent,
    TooltipComponent,
    initializeComponents
  };

  // Initialize components when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
  } else {
    initializeComponents();
  }

})();
