/**
 * Adion Framework - Navigation JavaScript
 * Advanced navigation components and interactions
 */

(function() {
  'use strict';

  // ========================================
  // NAVBAR COMPONENT
  // ========================================

  class NavbarComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        scrollThreshold: 50,
        autoHide: false,
        hideOnScroll: false,
        showOnScrollUp: true,
        mobileBreakpoint: 1024,
        ...options
      };
      
      this.isScrolled = false;
      this.lastScrollY = 0;
      this.isHidden = false;
      this.mobileMenu = null;
      this.dropdowns = new Map();
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.createMobileMenu();
      this.bindEvents();
      this.initializeDropdowns();
      this.handleScroll();
    }

    createMobileMenu() {
      // Find existing mobile menu or create one
      this.mobileMenu = this.element.querySelector('.mobile-menu');
      
      if (!this.mobileMenu) {
        this.mobileMenu = document.createElement('div');
        this.mobileMenu.className = 'mobile-menu';
        this.mobileMenu.innerHTML = this.buildMobileMenuContent();
        document.body.appendChild(this.mobileMenu);
      }
    }

    buildMobileMenuContent() {
      const nav = this.element.querySelector('.navbar-nav');
      if (!nav) return '';

      let content = '<div class="mobile-menu-content">';
      content += '<ul class="mobile-menu-nav">';

      // Convert desktop nav to mobile nav
      Array.from(nav.children).forEach(item => {
        const link = item.querySelector('.navbar-nav-link');
        const dropdown = item.querySelector('.navbar-dropdown');
        
        if (link && !dropdown) {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          const icon = link.querySelector('svg') ? link.querySelector('svg').outerHTML : '';
          
          content += `
            <li class="mobile-menu-item">
              <a href="${href}" class="mobile-menu-link">
                ${icon ? `<span class="mobile-menu-icon">${icon}</span>` : ''}
                <span>${text}</span>
              </a>
            </li>
          `;
        } else if (dropdown) {
          const toggle = dropdown.querySelector('.navbar-dropdown-toggle');
          const menu = dropdown.querySelector('.navbar-dropdown-menu');
          
          if (toggle && menu) {
            const text = toggle.textContent.trim();
            const icon = toggle.querySelector('svg') ? toggle.querySelector('svg').outerHTML : '';
            
            content += `
              <li class="mobile-menu-item">
                <a href="#" class="mobile-menu-link mobile-menu-dropdown-toggle" data-dropdown="${dropdown.id || 'dropdown-' + Math.random().toString(36).substr(2, 9)}">
                  ${icon ? `<span class="mobile-menu-icon">${icon}</span>` : ''}
                  <span>${text}</span>
                  <svg class="mobile-menu-icon mobile-menu-dropdown-arrow" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </a>
                <ul class="mobile-menu-dropdown" style="display: none;">
            `;
            
            Array.from(menu.children).forEach(dropdownItem => {
              const dropdownLink = dropdownItem.querySelector('.navbar-dropdown-link');
              if (dropdownLink) {
                const href = dropdownLink.getAttribute('href');
                const text = dropdownLink.textContent.trim();
                const icon = dropdownLink.querySelector('.navbar-dropdown-icon') ? dropdownLink.querySelector('.navbar-dropdown-icon').outerHTML : '';
                
                content += `
                  <li class="mobile-menu-item">
                    <a href="${href}" class="mobile-menu-link">
                      ${icon ? `<span class="mobile-menu-icon">${icon}</span>` : ''}
                      <span>${text}</span>
                    </a>
                  </li>
                `;
              }
            });
            
            content += '</ul></li>';
          }
        }
      });

      content += '</ul>';

      // Add mobile menu actions
      const actions = this.element.querySelector('.navbar-actions');
      if (actions) {
        content += '<div class="mobile-menu-actions">';
        
        Array.from(actions.children).forEach(action => {
          if (action.classList.contains('navbar-action')) {
            const icon = action.querySelector('svg') ? action.querySelector('svg').outerHTML : '';
            const text = action.getAttribute('aria-label') || 'Action';
            const isPrimary = action.classList.contains('navbar-action-primary');
            
            content += `
              <a href="#" class="mobile-menu-action ${isPrimary ? 'mobile-menu-action-primary' : ''}">
                ${icon ? `<span class="mobile-menu-icon">${icon}</span>` : ''}
                <span>${text}</span>
              </a>
            `;
          }
        });
        
        content += '</div>';
      }

      content += '</div>';
      return content;
    }

    bindEvents() {
      // Mobile menu toggle
      const mobileToggle = this.element.querySelector('.mobile-menu-toggle');
      if (mobileToggle) {
        mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
      }

      // Mobile menu dropdown toggles
      this.mobileMenu.addEventListener('click', (e) => {
        const toggle = e.target.closest('.mobile-menu-dropdown-toggle');
        if (toggle) {
          e.preventDefault();
          this.toggleMobileDropdown(toggle);
        }
      });

      // Close mobile menu on link click
      this.mobileMenu.addEventListener('click', (e) => {
        const link = e.target.closest('.mobile-menu-link:not(.mobile-menu-dropdown-toggle)');
        if (link) {
          this.closeMobileMenu();
        }
      });

      // Close mobile menu on outside click
      document.addEventListener('click', (e) => {
        if (this.mobileMenu.classList.contains('show') && 
            !this.element.contains(e.target) && 
            !this.mobileMenu.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Handle scroll
      if (this.options.hideOnScroll || this.options.showOnScrollUp) {
        window.addEventListener('scroll', () => this.handleScroll());
      }

      // Handle resize
      window.addEventListener('resize', () => this.handleResize());
    }

    initializeDropdowns() {
      const dropdowns = this.element.querySelectorAll('.navbar-dropdown');
      
      dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.navbar-dropdown-toggle');
        const menu = dropdown.querySelector('.navbar-dropdown-menu');
        
        if (toggle && menu) {
          const dropdownComponent = new NavbarDropdown(dropdown, toggle, menu);
          this.dropdowns.set(dropdown, dropdownComponent);
        }
      });
    }

    toggleMobileMenu() {
      const toggle = this.element.querySelector('.mobile-menu-toggle');
      
      if (this.mobileMenu.classList.contains('show')) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }

    openMobileMenu() {
      const toggle = this.element.querySelector('.mobile-menu-toggle');
      
      this.mobileMenu.classList.add('show');
      toggle.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      this.element.dispatchEvent(new CustomEvent('mobile-menu:open'));
    }

    closeMobileMenu() {
      const toggle = this.element.querySelector('.mobile-menu-toggle');
      
      this.mobileMenu.classList.remove('show');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
      
      // Close all mobile dropdowns
      const mobileDropdowns = this.mobileMenu.querySelectorAll('.mobile-menu-dropdown');
      mobileDropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
      });
      
      this.element.dispatchEvent(new CustomEvent('mobile-menu:close'));
    }

    toggleMobileDropdown(toggle) {
      const dropdown = toggle.nextElementSibling;
      const arrow = toggle.querySelector('.mobile-menu-dropdown-arrow');
      
      if (dropdown.style.display === 'none' || !dropdown.style.display) {
        dropdown.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      } else {
        dropdown.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    }

    handleScroll() {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > this.lastScrollY;
      
      // Update scrolled state
      if (currentScrollY > this.options.scrollThreshold) {
        if (!this.isScrolled) {
          this.isScrolled = true;
          this.element.classList.add('navbar-scrolled');
          this.element.dispatchEvent(new CustomEvent('navbar:scrolled'));
        }
      } else {
        if (this.isScrolled) {
          this.isScrolled = false;
          this.element.classList.remove('navbar-scrolled');
          this.element.dispatchEvent(new CustomEvent('navbar:unscrolled'));
        }
      }

      // Handle auto hide/show
      if (this.options.hideOnScroll && isScrollingDown && currentScrollY > 100) {
        if (!this.isHidden) {
          this.hide();
        }
      } else if (this.options.showOnScrollUp && !isScrollingDown) {
        if (this.isHidden) {
          this.show();
        }
      }

      this.lastScrollY = currentScrollY;
    }

    handleResize() {
      if (window.innerWidth > this.options.mobileBreakpoint) {
        this.closeMobileMenu();
      }
    }

    hide() {
      this.element.style.transform = 'translateY(-100%)';
      this.isHidden = true;
      this.element.dispatchEvent(new CustomEvent('navbar:hide'));
    }

    show() {
      this.element.style.transform = 'translateY(0)';
      this.isHidden = false;
      this.element.dispatchEvent(new CustomEvent('navbar:show'));
    }

    destroy() {
      // Close mobile menu
      this.closeMobileMenu();
      
      // Remove mobile menu from DOM
      if (this.mobileMenu && this.mobileMenu.parentNode) {
        this.mobileMenu.parentNode.removeChild(this.mobileMenu);
      }
      
      // Destroy dropdowns
      this.dropdowns.forEach(dropdown => dropdown.destroy());
      this.dropdowns.clear();
    }
  }

  // ========================================
  // NAVBAR DROPDOWN COMPONENT
  // ========================================

  class NavbarDropdown {
    constructor(dropdown, toggle, menu) {
      this.dropdown = dropdown;
      this.toggle = toggle;
      this.menu = menu;
      this.isOpen = false;
      
      this.init();
    }

    init() {
      this.bindEvents();
    }

    bindEvents() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.dropdown.contains(e.target)) {
          this.close();
        }
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    toggleDropdown() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.menu.classList.add('show');
      this.toggle.classList.add('open');
      this.isOpen = true;
      
      this.dropdown.dispatchEvent(new CustomEvent('dropdown:open'));
    }

    close() {
      this.menu.classList.remove('show');
      this.toggle.classList.remove('open');
      this.isOpen = false;
      
      this.dropdown.dispatchEvent(new CustomEvent('dropdown:close'));
    }

    destroy() {
      this.close();
    }
  }

  // ========================================
  // SIDEBAR COMPONENT
  // ========================================

  class SidebarComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        overlay: true,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        ...options
      };
      
      this.overlay = null;
      this.isOpen = false;
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.createOverlay();
      this.bindEvents();
    }

    createOverlay() {
      if (this.options.overlay) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
      }
    }

    bindEvents() {
      // Overlay click
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      // Escape key
      if (this.options.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }

      // Outside click
      if (this.options.closeOnOutsideClick) {
        document.addEventListener('click', (e) => {
          if (this.isOpen && !this.element.contains(e.target) && !this.overlay?.contains(e.target)) {
            this.close();
          }
        });
      }
    }

    open() {
      this.element.classList.add('show');
      if (this.overlay) {
        this.overlay.style.opacity = '1';
        this.overlay.style.visibility = 'visible';
      }
      document.body.style.overflow = 'hidden';
      this.isOpen = true;
      
      this.element.dispatchEvent(new CustomEvent('sidebar:open'));
    }

    close() {
      this.element.classList.remove('show');
      if (this.overlay) {
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
      }
      document.body.style.overflow = '';
      this.isOpen = false;
      
      this.element.dispatchEvent(new CustomEvent('sidebar:close'));
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    destroy() {
      this.close();
      
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
    }
  }

  // ========================================
  // BREADCRUMB COMPONENT
  // ========================================

  class BreadcrumbComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        separator: '/',
        homeText: 'Home',
        homeIcon: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
        ...options
      };
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.buildBreadcrumb();
    }

    buildBreadcrumb() {
      const path = window.location.pathname;
      const segments = path.split('/').filter(segment => segment);
      
      let breadcrumbHTML = '';
      
      // Home link
      breadcrumbHTML += `
        <div class="breadcrumb-item">
          <a href="/" class="breadcrumb-link">
            ${this.options.homeIcon}
            <span>${this.options.homeText}</span>
          </a>
        </div>
      `;
      
      // Path segments
      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += '/' + segment;
        const isLast = index === segments.length - 1;
        const text = this.formatSegmentText(segment);
        
        if (isLast) {
          breadcrumbHTML += `
            <div class="breadcrumb-separator">${this.options.separator}</div>
            <div class="breadcrumb-item">
              <span class="breadcrumb-current">${text}</span>
            </div>
          `;
        } else {
          breadcrumbHTML += `
            <div class="breadcrumb-separator">${this.options.separator}</div>
            <div class="breadcrumb-item">
              <a href="${currentPath}" class="breadcrumb-link">${text}</a>
            </div>
          `;
        }
      });
      
      this.element.innerHTML = breadcrumbHTML;
    }

    formatSegmentText(segment) {
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    update(path) {
      // Update breadcrumb for a specific path
      window.history.pushState({}, '', path);
      this.buildBreadcrumb();
    }
  }

  // ========================================
  // PAGINATION COMPONENT
  // ========================================

  class PaginationComponent {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        currentPage: 1,
        totalPages: 1,
        maxVisible: 5,
        showFirstLast: true,
        showPrevNext: true,
        firstText: 'First',
        lastText: 'Last',
        prevText: 'Previous',
        nextText: 'Next',
        onPageChange: null,
        ...options
      };
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.buildPagination();
      this.bindEvents();
    }

    buildPagination() {
      const { currentPage, totalPages, maxVisible } = this.options;
      
      if (totalPages <= 1) {
        this.element.style.display = 'none';
        return;
      }
      
      this.element.style.display = 'flex';
      
      let paginationHTML = '';
      
      // First button
      if (this.options.showFirstLast && currentPage > 1) {
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="1">${this.options.firstText}</a>
          </li>
        `;
      }
      
      // Previous button
      if (this.options.showPrevNext && currentPage > 1) {
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="${currentPage - 1}">${this.options.prevText}</a>
          </li>
        `;
      }
      
      // Page numbers
      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (startPage > 1) {
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="1">1</a>
          </li>
        `;
        
        if (startPage > 2) {
          paginationHTML += `
            <li class="pagination-item">
              <span class="pagination-ellipsis">...</span>
            </li>
          `;
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link ${isActive ? 'active' : ''}" data-page="${i}">${i}</a>
          </li>
        `;
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          paginationHTML += `
            <li class="pagination-item">
              <span class="pagination-ellipsis">...</span>
            </li>
          `;
        }
        
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="${totalPages}">${totalPages}</a>
          </li>
        `;
      }
      
      // Next button
      if (this.options.showPrevNext && currentPage < totalPages) {
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="${currentPage + 1}">${this.options.nextText}</a>
          </li>
        `;
      }
      
      // Last button
      if (this.options.showFirstLast && currentPage < totalPages) {
        paginationHTML += `
          <li class="pagination-item">
            <a href="#" class="pagination-link" data-page="${totalPages}">${this.options.lastText}</a>
          </li>
        `;
      }
      
      this.element.innerHTML = paginationHTML;
    }

    bindEvents() {
      this.element.addEventListener('click', (e) => {
        const link = e.target.closest('.pagination-link');
        if (link) {
          e.preventDefault();
          const page = parseInt(link.getAttribute('data-page'));
          this.goToPage(page);
        }
      });
    }

    goToPage(page) {
      if (page < 1 || page > this.options.totalPages || page === this.options.currentPage) {
        return;
      }
      
      this.options.currentPage = page;
      this.buildPagination();
      
      if (this.options.onPageChange) {
        this.options.onPageChange(page);
      }
      
      this.element.dispatchEvent(new CustomEvent('pagination:change', {
        detail: { page }
      }));
    }

    update(options) {
      Object.assign(this.options, options);
      this.buildPagination();
    }
  }

  // ========================================
  // INITIALIZE COMPONENTS
  // ========================================

  function initializeNavigation() {
    // Initialize navbars
    document.querySelectorAll('.navbar').forEach(element => {
      new NavbarComponent(element);
    });
    
    // Initialize sidebars
    document.querySelectorAll('.sidebar').forEach(element => {
      new SidebarComponent(element);
    });
    
    // Initialize breadcrumbs
    document.querySelectorAll('.breadcrumb').forEach(element => {
      new BreadcrumbComponent(element);
    });
    
    // Initialize pagination
    document.querySelectorAll('.pagination').forEach(element => {
      new PaginationComponent(element);
    });
  }

  // ========================================
  // EXPORT COMPONENTS
  // ========================================

  window.AYdocsNavigation = {
    NavbarComponent,
    NavbarDropdown,
    SidebarComponent,
    BreadcrumbComponent,
    PaginationComponent,
    initializeNavigation
  };

  // Initialize navigation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
  } else {
    initializeNavigation();
  }

})();
