/**
 * Adion Framework - Advanced Notification System
 * Superior to Swal.js with advanced animations and features
 */

(function() {
  'use strict';

  // ========================================
  // NOTIFICATION TYPES
  // ========================================

  const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    QUESTION: 'question',
    LOADING: 'loading',
    CUSTOM: 'custom'
  };

  // ========================================
  // NOTIFICATION MANAGER
  // ========================================

  class NotificationManager {
    constructor() {
      this.notifications = new Map();
      this.container = null;
      this.queue = [];
      this.isProcessing = false;
      this.maxNotifications = 5;
      this.defaultOptions = {
        title: '',
        text: '',
        type: NOTIFICATION_TYPES.INFO,
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        timer: null,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        showCloseButton: true,
        backdrop: true,
        backdropClass: 'notification-backdrop',
        customClass: '',
        width: 'auto',
        padding: '1.5rem',
        margin: '1rem',
        position: 'center',
        animation: true,
        animationType: 'fadeIn',
        animationDuration: 300,
        reverseButtons: false,
        focusConfirm: true,
        focusCancel: false,
        returnFocus: true,
        preConfirm: null,
        preDeny: null,
        didOpen: null,
        didClose: null,
        willOpen: null,
        willClose: null,
        didRender: null,
        didDestroy: null,
        input: null,
        inputPlaceholder: '',
        inputValue: '',
        inputValidator: null,
        inputAttributes: {},
        inputClass: '',
        inputLabel: '',
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false,
        loaderHtml: '<div class="notification-loader"></div>',
        imageUrl: null,
        imageWidth: null,
        imageHeight: null,
        imageAlt: '',
        html: null,
        footer: null,
        toast: false,
        target: 'body',
        toastPosition: 'top-end',
        grow: false,
        growDirection: 'row',
        showClass: {
          popup: 'animate__animated animate__fadeIn',
          backdrop: 'animate__animated animate__fadeIn',
          icon: 'animate__animated animate__zoomIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut',
          backdrop: 'animate__animated animate__fadeOut',
          icon: 'animate__animated animate__zoomOut'
        }
      };
      
      this.init();
    }

    init() {
      this.createContainer();
      this.bindGlobalEvents();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      
      document.body.appendChild(this.container);
    }

    bindGlobalEvents() {
      // Handle escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const topNotification = this.getTopNotification();
          if (topNotification && topNotification.options.allowEscapeKey) {
            topNotification.close();
          }
        }
      });

      // Handle backdrop clicks
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification-backdrop')) {
          const topNotification = this.getTopNotification();
          if (topNotification && topNotification.options.allowOutsideClick) {
            topNotification.close();
          }
        }
      });
    }

    getTopNotification() {
      const notifications = Array.from(this.notifications.values());
      return notifications[notifications.length - 1];
    }

    // ========================================
    // PUBLIC API METHODS
    // ========================================

    fire(options = {}) {
      const notification = new Notification(this, { ...this.defaultOptions, ...options });
      this.notifications.set(notification.id, notification);
      
      if (this.notifications.size > this.maxNotifications) {
        const oldestNotification = this.notifications.values().next().value;
        oldestNotification.close();
      }
      
      return notification.promise;
    }

    // Convenience methods
    success(title, text, options = {}) {
      return this.fire({ title, text, type: NOTIFICATION_TYPES.SUCCESS, ...options });
    }

    error(title, text, options = {}) {
      return this.fire({ title, text, type: NOTIFICATION_TYPES.ERROR, ...options });
    }

    warning(title, text, options = {}) {
      return this.fire({ title, text, type: NOTIFICATION_TYPES.WARNING, ...options });
    }

    info(title, text, options = {}) {
      return this.fire({ title, text, type: NOTIFICATION_TYPES.INFO, ...options });
    }

    question(title, text, options = {}) {
      return this.fire({ 
        title, 
        text, 
        type: NOTIFICATION_TYPES.QUESTION, 
        showCancelButton: true,
        ...options 
      });
    }

    loading(title, text, options = {}) {
      return this.fire({ 
        title, 
        text, 
        type: NOTIFICATION_TYPES.LOADING, 
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        ...options 
      });
    }

    toast(title, text, type = NOTIFICATION_TYPES.INFO, options = {}) {
      return this.fire({ 
        title, 
        text, 
        type, 
        toast: true,
        timer: 3000,
        showConfirmButton: false,
        ...options 
      });
    }

    // Close all notifications
    closeAll() {
      this.notifications.forEach(notification => notification.close());
    }

    // Get notification by ID
    getNotification(id) {
      return this.notifications.get(id);
    }

    // Update notification
    update(id, options) {
      const notification = this.notifications.get(id);
      if (notification) {
        notification.update(options);
      }
    }

    // Queue notifications
    queue(options) {
      this.queue.push(options);
      this.processQueue();
    }

    processQueue() {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
      const options = this.queue.shift();
      
      this.fire(options).then(() => {
        this.isProcessing = false;
        this.processQueue();
      });
    }
  }

  // ========================================
  // NOTIFICATION CLASS
  // ========================================

  class Notification {
    constructor(manager, options) {
      this.manager = manager;
      this.options = options;
      this.id = this.generateId();
      this.element = null;
      this.backdrop = null;
      this.timer = null;
      this.isOpen = false;
      this.isClosing = false;
      this.resolve = null;
      this.reject = null;
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      
      this.create();
      this.open();
    }

    generateId() {
      return 'notification_' + Math.random().toString(36).substr(2, 9);
    }

    create() {
      // Create backdrop
      if (this.options.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.className = `notification-backdrop ${this.options.backdropClass}`;
        this.backdrop.setAttribute('data-notification-id', this.id);
      }

      // Create notification element
      this.element = document.createElement('div');
      this.element.className = `notification ${this.options.customClass}`;
      this.element.setAttribute('data-notification-id', this.id);
      this.element.setAttribute('role', 'dialog');
      this.element.setAttribute('aria-modal', 'true');
      this.element.setAttribute('aria-labelledby', `${this.id}-title`);
      this.element.setAttribute('aria-describedby', `${this.id}-text`);

      // Set position
      if (this.options.toast) {
        this.element.classList.add('notification-toast');
        this.element.classList.add(`notification-toast-${this.options.toastPosition}`);
      } else {
        this.element.classList.add('notification-popup');
        this.element.classList.add(`notification-${this.options.position}`);
      }

      // Set size
      if (this.options.width !== 'auto') {
        this.element.style.width = this.options.width;
      }

      // Set padding
      this.element.style.padding = this.options.padding;

      // Build content
      this.buildContent();

      // Add to container
      if (this.options.toast) {
        this.manager.container.appendChild(this.element);
      } else {
        if (this.backdrop) {
          this.manager.container.appendChild(this.backdrop);
        }
        this.manager.container.appendChild(this.element);
      }

      // Call didRender callback
      if (this.options.didRender) {
        this.options.didRender(this.element);
      }
    }

    buildContent() {
      let content = '';

      // Header
      if (this.options.title || this.options.showCloseButton) {
        content += '<div class="notification-header">';
        
        if (this.options.title) {
          content += `<h3 class="notification-title" id="${this.id}-title">${this.options.title}</h3>`;
        }
        
        if (this.options.showCloseButton) {
          content += `<button class="notification-close" aria-label="Close notification">×</button>`;
        }
        
        content += '</div>';
      }

      // Icon
      if (this.options.type !== NOTIFICATION_TYPES.CUSTOM) {
        content += `<div class="notification-icon notification-icon-${this.options.type}">${this.getIcon()}</div>`;
      }

      // Image
      if (this.options.imageUrl) {
        content += `<img src="${this.options.imageUrl}" class="notification-image" alt="${this.options.imageAlt}"`;
        if (this.options.imageWidth) content += ` width="${this.options.imageWidth}"`;
        if (this.options.imageHeight) content += ` height="${this.options.imageHeight}"`;
        content += '>';
      }

      // Content
      content += '<div class="notification-content">';
      
      if (this.options.html) {
        content += `<div class="notification-html">${this.options.html}</div>`;
      } else if (this.options.text) {
        content += `<div class="notification-text" id="${this.id}-text">${this.options.text}</div>`;
      }

      // Input
      if (this.options.input) {
        content += this.buildInput();
      }

      // Footer
      if (this.options.footer) {
        content += `<div class="notification-footer">${this.options.footer}</div>`;
      }

      content += '</div>';

      // Actions
      if (this.options.showConfirmButton || this.options.showCancelButton) {
        content += this.buildActions();
      }

      // Timer progress bar
      if (this.options.timer && this.options.timerProgressBar) {
        content += '<div class="notification-timer-progress"></div>';
      }

      this.element.innerHTML = content;

      // Bind events
      this.bindEvents();
    }

    buildInput() {
      const inputType = this.options.input;
      let input = '';

      if (inputType === 'text' || inputType === 'email' || inputType === 'password' || inputType === 'number') {
        input = `<input type="${inputType}" class="notification-input ${this.options.inputClass}" placeholder="${this.options.inputPlaceholder}" value="${this.options.inputValue}"`;
        
        // Add input attributes
        Object.entries(this.options.inputAttributes).forEach(([key, value]) => {
          input += ` ${key}="${value}"`;
        });
        
        input += '>';
      } else if (inputType === 'textarea') {
        input = `<textarea class="notification-input ${this.options.inputClass}" placeholder="${this.options.inputPlaceholder}"`;
        
        Object.entries(this.options.inputAttributes).forEach(([key, value]) => {
          input += ` ${key}="${value}"`;
        });
        
        input += `>${this.options.inputValue}</textarea>`;
      } else if (inputType === 'select') {
        input = `<select class="notification-input ${this.options.inputClass}"`;
        
        Object.entries(this.options.inputAttributes).forEach(([key, value]) => {
          input += ` ${key}="${value}"`;
        });
        
        input += '>';
        
        if (this.options.inputOptions) {
          Object.entries(this.options.inputOptions).forEach(([value, text]) => {
            input += `<option value="${value}"${value === this.options.inputValue ? ' selected' : ''}>${text}</option>`;
          });
        }
        
        input += '</select>';
      }

      if (this.options.inputLabel) {
        input = `<label class="notification-input-label">${this.options.inputLabel}${input}</label>`;
      }

      return `<div class="notification-input-container">${input}</div>`;
    }

    buildActions() {
      let actions = '<div class="notification-actions">';
      
      const buttons = [];
      
      if (this.options.showCancelButton) {
        buttons.push({
          text: this.options.cancelButtonText,
          className: 'notification-button notification-button-cancel',
          color: this.options.cancelButtonColor,
          action: 'deny'
        });
      }
      
      if (this.options.showConfirmButton) {
        buttons.push({
          text: this.options.confirmButtonText,
          className: 'notification-button notification-button-confirm',
          color: this.options.confirmButtonColor,
          action: 'confirm'
        });
      }
      
      if (this.options.reverseButtons) {
        buttons.reverse();
      }
      
      buttons.forEach(button => {
        actions += `<button class="${button.className}" style="background-color: ${button.color}" data-action="${button.action}">${button.text}</button>`;
      });
      
      actions += '</div>';
      
      return actions;
    }

    getIcon() {
      const icons = {
        [NOTIFICATION_TYPES.SUCCESS]: '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        [NOTIFICATION_TYPES.ERROR]: '<svg viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        [NOTIFICATION_TYPES.WARNING]: '<svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
        [NOTIFICATION_TYPES.INFO]: '<svg viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        [NOTIFICATION_TYPES.QUESTION]: '<svg viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        [NOTIFICATION_TYPES.LOADING]: '<div class="notification-spinner"></div>'
      };
      
      return icons[this.options.type] || '';
    }

    bindEvents() {
      // Close button
      const closeButton = this.element.querySelector('.notification-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.close());
      }

      // Action buttons
      const actionButtons = this.element.querySelectorAll('.notification-actions button');
      actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const action = e.target.getAttribute('data-action');
          this.handleAction(action);
        });
      });

      // Input focus
      if (this.options.focusConfirm) {
        const confirmButton = this.element.querySelector('.notification-button-confirm');
        if (confirmButton) {
          setTimeout(() => confirmButton.focus(), 100);
        }
      } else if (this.options.focusCancel) {
        const cancelButton = this.element.querySelector('.notification-button-cancel');
        if (cancelButton) {
          setTimeout(() => cancelButton.focus(), 100);
        }
      }

      // Input focus
      const input = this.element.querySelector('.notification-input');
      if (input && this.options.focusConfirm) {
        setTimeout(() => input.focus(), 100);
      }
    }

    handleAction(action) {
      if (action === 'confirm') {
        this.confirm();
      } else if (action === 'deny') {
        this.deny();
      }
    }

    confirm() {
      if (this.options.showLoaderOnConfirm) {
        this.showLoader();
      }

      if (this.options.preConfirm) {
        const result = this.options.preConfirm();
        if (result instanceof Promise) {
          result.then((value) => {
            this.resolve({ isConfirmed: true, value });
            this.close();
          }).catch((error) => {
            this.reject(error);
          });
        } else {
          this.resolve({ isConfirmed: true, value: result });
          this.close();
        }
      } else {
        this.resolve({ isConfirmed: true });
        this.close();
      }
    }

    deny() {
      if (this.options.showLoaderOnDeny) {
        this.showLoader();
      }

      if (this.options.preDeny) {
        const result = this.options.preDeny();
        if (result instanceof Promise) {
          result.then((value) => {
            this.resolve({ isDenied: true, value });
            this.close();
          }).catch((error) => {
            this.reject(error);
          });
        } else {
          this.resolve({ isDenied: true, value: result });
          this.close();
        }
      } else {
        this.resolve({ isDenied: true });
        this.close();
      }
    }

    showLoader() {
      const actions = this.element.querySelector('.notification-actions');
      if (actions) {
        actions.innerHTML = this.options.loaderHtml;
      }
    }

    open() {
      if (this.isOpen) return;

      // Call willOpen callback
      if (this.options.willOpen) {
        this.options.willOpen(this.element);
      }

      // Add show classes
      if (this.options.animation) {
        this.element.classList.add(...this.options.showClass.popup.split(' '));
        if (this.backdrop) {
          this.backdrop.classList.add(...this.options.showClass.backdrop.split(' '));
        }
      }

      this.isOpen = true;

      // Start timer
      if (this.options.timer) {
        this.startTimer();
      }

      // Call didOpen callback
      if (this.options.didOpen) {
        this.options.didOpen(this.element);
      }
    }

    close() {
      if (this.isClosing || !this.isOpen) return;

      this.isClosing = true;

      // Call willClose callback
      if (this.options.willClose) {
        this.options.willClose(this.element);
      }

      // Clear timer
      this.clearTimer();

      // Add hide classes
      if (this.options.animation) {
        this.element.classList.remove(...this.options.showClass.popup.split(' '));
        this.element.classList.add(...this.options.hideClass.popup.split(' '));
        
        if (this.backdrop) {
          this.backdrop.classList.remove(...this.options.showClass.backdrop.split(' '));
          this.backdrop.classList.add(...this.options.hideClass.backdrop.split(' '));
        }

        // Remove element after animation
        setTimeout(() => {
          this.destroy();
        }, this.options.animationDuration);
      } else {
        this.destroy();
      }
    }

    startTimer() {
      this.timer = setTimeout(() => {
        this.close();
      }, this.options.timer);

      // Update progress bar
      if (this.options.timerProgressBar) {
        const progressBar = this.element.querySelector('.notification-timer-progress');
        if (progressBar) {
          progressBar.style.animation = `notification-timer-progress ${this.options.timer}ms linear forwards`;
        }
      }
    }

    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    update(options) {
      Object.assign(this.options, options);
      this.buildContent();
    }

    destroy() {
      // Call didClose callback
      if (this.options.didClose) {
        this.options.didClose(this.element);
      }

      // Remove from DOM
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      if (this.backdrop && this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }

      // Remove from manager
      this.manager.notifications.delete(this.id);

      // Call didDestroy callback
      if (this.options.didDestroy) {
        this.options.didDestroy();
      }
    }
  }

  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================

  class ToastManager {
    constructor() {
      this.container = null;
      this.toasts = new Map();
      this.maxToasts = 5;
      
      this.init();
    }

    init() {
      this.createContainer();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      
      document.body.appendChild(this.container);
    }

    show(message, type = 'info', options = {}) {
      const toast = new Toast(this, message, type, options);
      this.toasts.set(toast.id, toast);
      
      if (this.toasts.size > this.maxToasts) {
        const oldestToast = this.toasts.values().next().value;
        oldestToast.close();
      }
      
      return toast;
    }

    success(message, options = {}) {
      return this.show(message, 'success', options);
    }

    error(message, options = {}) {
      return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
      return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
      return this.show(message, 'info', options);
    }

    closeAll() {
      this.toasts.forEach(toast => toast.close());
    }
  }

  class Toast {
    constructor(manager, message, type, options = {}) {
      this.manager = manager;
      this.message = message;
      this.type = type;
      this.options = {
        duration: 3000,
        position: 'top-right',
        showIcon: true,
        showCloseButton: true,
        ...options
      };
      
      this.id = this.generateId();
      this.element = null;
      this.timer = null;
      
      this.create();
      this.show();
    }

    generateId() {
      return 'toast_' + Math.random().toString(36).substr(2, 9);
    }

    create() {
      this.element = document.createElement('div');
      this.element.className = `toast toast-${this.type}`;
      this.element.setAttribute('data-toast-id', this.id);
      
      let content = '';
      
      if (this.options.showIcon) {
        content += `<div class="toast-icon">${this.getIcon()}</div>`;
      }
      
      content += `<div class="toast-content">${this.message}</div>`;
      
      if (this.options.showCloseButton) {
        content += '<button class="toast-close" aria-label="Close">×</button>';
      }
      
      this.element.innerHTML = content;
      
      // Bind events
      const closeButton = this.element.querySelector('.toast-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.close());
      }
      
      // Add to container
      this.manager.container.appendChild(this.element);
    }

    getIcon() {
      const icons = {
        success: '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        error: '<svg viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
        info: '<svg viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
      };
      
      return icons[this.type] || '';
    }

    show() {
      this.element.classList.add('toast-show');
      
      if (this.options.duration > 0) {
        this.timer = setTimeout(() => {
          this.close();
        }, this.options.duration);
      }
    }

    close() {
      this.element.classList.remove('toast-show');
      this.element.classList.add('toast-hide');
      
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      
      setTimeout(() => {
        this.destroy();
      }, 300);
    }

    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      
      this.manager.toasts.delete(this.id);
    }
  }

  // ========================================
  // EXPORT AND INITIALIZE
  // ========================================

  // Create global instances
  const notificationManager = new NotificationManager();
  const toastManager = new ToastManager();

  // Export to global scope
  window.AYdocsNotifications = {
    // Main notification system
    fire: (options) => notificationManager.fire(options),
    success: (title, text, options) => notificationManager.success(title, text, options),
    error: (title, text, options) => notificationManager.error(title, text, options),
    warning: (title, text, options) => notificationManager.warning(title, text, options),
    info: (title, text, options) => notificationManager.info(title, text, options),
    question: (title, text, options) => notificationManager.question(title, text, options),
    loading: (title, text, options) => notificationManager.loading(title, text, options),
    toast: (title, text, type, options) => notificationManager.toast(title, text, type, options),
    closeAll: () => notificationManager.closeAll(),
    update: (id, options) => notificationManager.update(id, options),
    getNotification: (id) => notificationManager.getNotification(id),
    queue: (options) => notificationManager.queue(options),

    // Toast system
    toastSuccess: (message, options) => toastManager.success(message, options),
    toastError: (message, options) => toastManager.error(message, options),
    toastWarning: (message, options) => toastManager.warning(message, options),
    toastInfo: (message, options) => toastManager.info(message, options),
    toastCloseAll: () => toastManager.closeAll(),

    // Constants
    TYPES: NOTIFICATION_TYPES,

    // Managers
    manager: notificationManager,
    toastManager: toastManager
  };

  // Create shorter aliases
  window.Notify = window.AYdocsNotifications;
  window.Swal = window.AYdocsNotifications; // For compatibility

})();
