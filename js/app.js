/**
 * Adion Framework - Application JavaScript
 * Main application logic and initialization
 */

(function() {
  'use strict';

  // ========================================
  // APPLICATION CLASS
  // ========================================

  class AYdocsApp {
    constructor() {
      this.framework = window.AYdocs;
      this.stats = {
        components: 0,
        utilities: 0,
        linesOfCode: 0,
        dependencies: 0
      };
      
      this.init();
    }

    init() {
      // Wait for framework to be ready
      if (this.framework) {
        this.onFrameworkReady();
      } else {
        document.addEventListener('aydocs:ready', () => this.onFrameworkReady());
      }
    }

    onFrameworkReady() {
      console.log('🚀 AYdocs App initialized');
      
      // Initialize app features
      this.initLoadingScreen();
      this.initHeroAnimations();
      this.initStatsCounter();
      this.initParticleSystem();
      this.initCodeWindow();
      this.initContactForm();
      this.initDemoButtons();
      this.initScrollEffects();
      this.initKeyboardShortcuts();
      this.initStatistics();
      this.initNotifications();
      
      // Start real-time stats updates
      this.startStatsUpdates();
    }

    // ========================================
    // LOADING SCREEN
    // ========================================

    initLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');
      
      if (loadingScreen) {
        // Hide loading screen after a delay
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          
          // Remove from DOM after animation
          setTimeout(() => {
            if (loadingScreen.parentNode) {
              loadingScreen.parentNode.removeChild(loadingScreen);
            }
          }, 500);
        }, 2000);
      }
    }

    // ========================================
    // HERO ANIMATIONS
    // ========================================

    initHeroAnimations() {
      const heroTitle = document.querySelector('.hero-title');
      const heroDescription = document.querySelector('.hero-description');
      const heroActions = document.querySelector('.hero-actions');
      const heroStats = document.querySelector('.hero-stats');
      
      if (heroTitle) {
        setTimeout(() => this.framework.animations.fadeInUp(heroTitle, 1000), 300);
      }
      
      if (heroDescription) {
        setTimeout(() => this.framework.animations.fadeInUp(heroDescription, 1000), 600);
      }
      
      if (heroActions) {
        setTimeout(() => this.framework.animations.fadeInUp(heroActions, 1000), 900);
      }
      
      if (heroStats) {
        setTimeout(() => this.framework.animations.fadeInUp(heroStats, 1000), 1200);
      }
    }

    // ========================================
    // STATS COUNTER
    // ========================================

    initStatsCounter() {
      const statNumbers = document.querySelectorAll('.stat-number[data-target]');
      
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          
          // Format numbers with commas
          if (target >= 1000) {
            stat.textContent = Math.floor(current).toLocaleString();
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 16);
      });
    }

    // ========================================
    // PARTICLE SYSTEM
    // ========================================

    initParticleSystem() {
      const particlesContainer = document.getElementById('hero-particles');
      
      if (!particlesContainer) return;
      
      // Create particles
      for (let i = 0; i < 50; i++) {
        this.createParticle(particlesContainer);
      }
    }

    createParticle(container) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random properties
      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(45deg, var(--color-primary-400), var(--color-primary-600));
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: float ${duration}s ${delay}s infinite linear;
        pointer-events: none;
      `;
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        // Create new particle
        this.createParticle(container);
      }, (duration + delay) * 1000);
    }

    // ========================================
    // CODE WINDOW
    // ========================================

    initCodeWindow() {
      const codeWindow = document.querySelector('.code-window');
      
      if (codeWindow) {
        // Add typing animation to code
        this.typeCode(codeWindow);
        
        // Add window controls functionality
        this.initWindowControls(codeWindow);
      }
    }

    typeCode(window) {
      const codeElement = window.querySelector('code');
      if (!codeElement) return;
      
      const originalCode = codeElement.innerHTML;
      codeElement.innerHTML = '';
      
      let index = 0;
      const typingSpeed = 50;
      
      const typeNextChar = () => {
        if (index < originalCode.length) {
          codeElement.innerHTML += originalCode[index];
          index++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          // Start blinking cursor
          this.addBlinkingCursor(codeElement);
        }
      };
      
      setTimeout(typeNextChar, 1000);
    }

    addBlinkingCursor(element) {
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.textContent = '|';
      cursor.style.cssText = `
        animation: blink 1s infinite;
        color: var(--color-primary-500);
      `;
      
      element.appendChild(cursor);
      
      // Add CSS for blinking cursor
      if (!document.getElementById('cursor-styles')) {
        const style = document.createElement('style');
        style.id = 'cursor-styles';
        style.textContent = `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    }

    initWindowControls(window) {
      const controls = window.querySelectorAll('.window-control');
      
      controls.forEach((control, index) => {
        control.addEventListener('click', () => {
          control.classList.add('active');
          
          setTimeout(() => {
            control.classList.remove('active');
          }, 200);
          
          // Simulate window actions
          switch (index) {
            case 0: // Close
              window.style.transform = 'scale(0.8)';
              window.style.opacity = '0';
              setTimeout(() => {
                window.style.transform = 'scale(1)';
                window.style.opacity = '1';
              }, 300);
              break;
            case 1: // Minimize
              window.style.transform = 'scaleY(0.1)';
              setTimeout(() => {
                window.style.transform = 'scaleY(1)';
              }, 300);
              break;
            case 2: // Maximize
              window.style.transform = 'scale(1.1)';
              setTimeout(() => {
                window.style.transform = 'scale(1)';
              }, 300);
              break;
          }
        });
      });
    }

    // ========================================
    // CONTACT FORM
    // ========================================

    initContactForm() {
      const contactForm = document.getElementById('contact-form');
      
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleContactForm(contactForm);
        });
      }
    }

    async handleContactForm(form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        this.framework.showToast('Message sent successfully!', 'success');
        form.reset();
        
        // Update stats
        this.stats.components++;
        this.updateStatsDisplay();
        
      } catch (error) {
        // Error
        this.framework.showToast('Failed to send message. Please try again.', 'error');
      } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }

    // ========================================
    // DEMO BUTTONS
    // ========================================

    initDemoButtons() {
      // Get Started button
      const getStartedBtn = document.getElementById('get-started-btn');
      if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
          this.showGetStartedModal();
        });
      }
      
      // Hero CTA buttons
      const heroCtaPrimary = document.getElementById('hero-cta-primary');
      if (heroCtaPrimary) {
        heroCtaPrimary.addEventListener('click', () => {
          this.showGetStartedModal();
        });
      }
      
      const heroCtaSecondary = document.getElementById('hero-cta-secondary');
      if (heroCtaSecondary) {
        heroCtaSecondary.addEventListener('click', () => {
          this.showDemoModal();
        });
      }
      
      // Modal demo button
      const modalDemoBtn = document.getElementById('modal-demo-btn');
      if (modalDemoBtn) {
        modalDemoBtn.addEventListener('click', () => {
          this.showDemoModal();
        });
      }
    }

    showGetStartedModal() {
      const modal = this.framework.createModal('get-started', {
        title: 'Get Started with AYdocs Framework',
        content: `
          <div class="get-started-content">
            <h3>Welcome to the Future of Web Development!</h3>
            <p>AYdocs Framework is the most advanced web framework built from scratch. Here's how to get started:</p>
            
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Download the Framework</h4>
                  <p>Get the latest version of AYdocs Framework</p>
                  <button class="btn btn-primary btn-sm" onclick="this.parentElement.parentElement.querySelector('.download-link').click()">
                    Download Now
                  </button>
                  <a href="#" class="download-link" style="display: none;">Download</a>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Include in Your Project</h4>
                  <pre><code>&lt;link rel="stylesheet" href="css/framework.css"&gt;
&lt;script src="js/framework.js"&gt;&lt;/script&gt;</code></pre>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Start Building</h4>
                  <p>Use the comprehensive component library to build amazing applications</p>
                </div>
              </div>
            </div>
          </div>
        `,
        size: 'lg'
      });
      
      modal.open();
    }

    showDemoModal() {
      const modal = this.framework.createModal('demo', {
        title: 'AYdocs Framework Demo',
        content: `
          <div class="demo-content">
            <h3>Experience the Power of AYdocs Framework</h3>
            <p>Watch this interactive demo to see what makes AYdocs Framework the most advanced web framework:</p>
            
            <div class="demo-video">
              <div class="video-placeholder">
                <div class="play-button">
                  <svg viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                </div>
                <p>Interactive Demo Video</p>
              </div>
            </div>
            
            <div class="demo-features">
              <h4>What You'll See:</h4>
              <ul>
                <li>150+ Pre-built Components</li>
                <li>Advanced Animation System</li>
                <li>Responsive Design Patterns</li>
                <li>Theme Customization</li>
                <li>Performance Optimizations</li>
              </ul>
            </div>
          </div>
        `,
        size: 'lg'
      });
      
      modal.open();
    }

    // ========================================
    // SCROLL EFFECTS
    // ========================================

    initScrollEffects() {
      // Parallax effect for hero section
      this.initParallaxEffect();
      
      // Reveal animations for sections
      this.initRevealAnimations();
      
      // Navbar scroll effect
      this.initNavbarScrollEffect();
    }

    initParallaxEffect() {
      const heroSection = document.querySelector('.hero-section');
      
      if (!heroSection) return;
      
      window.addEventListener('scroll', this.framework.utils.throttle(() => {
        const scrolled = window.pageYOffset;
        const parallax = heroSection.querySelector('.hero-background');
        
        if (parallax) {
          parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
      }, 16));
    }

    initRevealAnimations() {
      const sections = document.querySelectorAll('section');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Animate child elements
            const animatedElements = entry.target.querySelectorAll('[data-animate]');
            animatedElements.forEach((element, index) => {
              setTimeout(() => {
                const animation = element.getAttribute('data-animate');
                this.framework.animations.animate(element, animation);
              }, index * 100);
            });
          }
        });
      }, { threshold: 0.1 });

      sections.forEach(section => observer.observe(section));
    }

    initNavbarScrollEffect() {
      const navbar = document.getElementById('navbar');
      
      if (!navbar) return;
      
      window.addEventListener('scroll', this.framework.utils.throttle(() => {
        const scrolled = window.pageYOffset;
        
        if (scrolled > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, 16));
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================

    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.showSearchModal();
        }
        
        // Ctrl/Cmd + D - Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          this.framework.theme.toggleTheme();
        }
        
        // Escape - Close modals
        if (e.key === 'Escape') {
          this.closeAllModals();
        }
      });
    }

    showSearchModal() {
      const modal = this.framework.createModal('search', {
        title: 'Search AYdocs Framework',
        content: `
          <div class="search-content">
            <div class="search-input-container">
              <input type="text" class="search-input" placeholder="Search components, utilities, examples..." autofocus>
            </div>
            <div class="search-results">
              <div class="search-result">
                <h4>Button Component</h4>
                <p>Primary, secondary, and outline button variants</p>
              </div>
              <div class="search-result">
                <h4>Card Component</h4>
                <p>Flexible content containers with headers and footers</p>
              </div>
              <div class="search-result">
                <h4>Modal Component</h4>
                <p>Overlay dialogs for user interactions</p>
              </div>
            </div>
          </div>
        `,
        size: 'lg'
      });
      
      modal.open();
      
      // Focus search input
      setTimeout(() => {
        const searchInput = modal.modal.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }

    closeAllModals() {
      this.framework.modals.forEach(modal => {
        if (modal.isOpen) {
          modal.close();
        }
      });
    }

    // ========================================
    // REAL-TIME STATS
    // ========================================

    startStatsUpdates() {
      // Update stats every 5 seconds
      setInterval(() => {
        this.updateStats();
      }, 5000);
    }

    updateStats() {
      // Simulate real-time updates
      this.stats.components += Math.floor(Math.random() * 3);
      this.stats.utilities += Math.floor(Math.random() * 2);
      this.stats.linesOfCode += Math.floor(Math.random() * 50);
      
      this.updateStatsDisplay();
    }

    updateStatsDisplay() {
      const statsElements = {
        components: document.querySelector('.stat-item:nth-child(2) .stat-number'),
        utilities: document.querySelector('.stat-item:nth-child(3) .stat-number'),
        linesOfCode: document.querySelector('.stat-item:nth-child(1) .stat-number')
      };
      
      Object.keys(statsElements).forEach(key => {
        const element = statsElements[key];
        if (element && this.stats[key] !== undefined) {
          element.textContent = this.stats[key].toLocaleString();
        }
      });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    showNotification(message, type = 'info') {
      this.framework.showToast(message, type);
    }

    showSuccess(message) {
      this.showNotification(message, 'success');
    }

    showError(message) {
      this.showNotification(message, 'error');
    }

    showWarning(message) {
      this.showNotification(message, 'warning');
    }

    showInfo(message) {
      this.showNotification(message, 'info');
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  // Initialize app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AYdocsApp = new AYdocsApp();
    });
  } else {
    window.AYdocsApp = new AYdocsApp();
  }

  // ========================================
  // GLOBAL UTILITIES
  // ========================================

  // Make app globally available
  window.AYdocsApp = window.AYdocsApp || new AYdocsApp();

})();
