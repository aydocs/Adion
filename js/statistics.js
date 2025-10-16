/**
 * Adion Framework - Real-time Statistics System
 * Advanced statistics tracking and display
 */

(function() {
  'use strict';

  // ========================================
  // STATISTICS MANAGER
  // ========================================

  class StatisticsManager {
    constructor() {
      this.stats = new Map();
      this.observers = new Map();
      this.interval = null;
      this.updateFrequency = 1000; // 1 second
      this.isRunning = false;
      
      this.init();
    }

    init() {
      this.initializeDefaultStats();
      this.bindEvents();
    }

    initializeDefaultStats() {
      // Page views
      this.addStat('pageViews', {
        name: 'Page Views',
        value: 0,
        type: 'counter',
        format: 'number',
        icon: '👁️',
        color: '#6366f1',
        increment: 1
      });

      // Unique visitors
      this.addStat('uniqueVisitors', {
        name: 'Unique Visitors',
        value: 0,
        type: 'counter',
        format: 'number',
        icon: '👤',
        color: '#8b5cf6',
        increment: Math.random() > 0.7 ? 1 : 0
      });

      // Bounce rate
      this.addStat('bounceRate', {
        name: 'Bounce Rate',
        value: 35.2,
        type: 'percentage',
        format: 'percentage',
        icon: '📊',
        color: '#f59e0b',
        min: 20,
        max: 60,
        variance: 2
      });

      // Average session duration
      this.addStat('avgSessionDuration', {
        name: 'Avg. Session Duration',
        value: 180,
        type: 'duration',
        format: 'duration',
        icon: '⏱️',
        color: '#10b981',
        min: 60,
        max: 600,
        variance: 30
      });

      // Conversion rate
      this.addStat('conversionRate', {
        name: 'Conversion Rate',
        value: 2.8,
        type: 'percentage',
        format: 'percentage',
        icon: '🎯',
        color: '#ef4444',
        min: 1,
        max: 5,
        variance: 0.5
      });

      // Revenue
      this.addStat('revenue', {
        name: 'Revenue',
        value: 12500,
        type: 'currency',
        format: 'currency',
        icon: '💰',
        color: '#059669',
        min: 10000,
        max: 20000,
        variance: 500
      });

      // Active users
      this.addStat('activeUsers', {
        name: 'Active Users',
        value: 42,
        type: 'counter',
        format: 'number',
        icon: '🔥',
        color: '#dc2626',
        min: 20,
        max: 100,
        variance: 5
      });

      // Server response time
      this.addStat('serverResponseTime', {
        name: 'Server Response Time',
        value: 120,
        type: 'duration',
        format: 'duration',
        icon: '⚡',
        color: '#7c3aed',
        min: 50,
        max: 300,
        variance: 20
      });
    }

    addStat(id, config) {
      const stat = {
        id,
        name: config.name,
        value: config.value,
        previousValue: config.value,
        type: config.type,
        format: config.format,
        icon: config.icon,
        color: config.color,
        min: config.min || 0,
        max: config.max || 1000,
        variance: config.variance || 1,
        increment: config.increment || 0,
        trend: 'stable',
        change: 0,
        changePercentage: 0,
        lastUpdated: Date.now(),
        ...config
      };
      
      this.stats.set(id, stat);
      this.notifyObservers(id, stat);
    }

    getStat(id) {
      return this.stats.get(id);
    }

    getAllStats() {
      return Array.from(this.stats.values());
    }

    updateStat(id, value) {
      const stat = this.stats.get(id);
      if (!stat) return;

      stat.previousValue = stat.value;
      stat.value = value;
      stat.change = stat.value - stat.previousValue;
      stat.changePercentage = stat.previousValue !== 0 ? 
        ((stat.change / stat.previousValue) * 100) : 0;
      stat.trend = this.calculateTrend(stat);
      stat.lastUpdated = Date.now();

      this.notifyObservers(id, stat);
    }

    incrementStat(id, amount = 1) {
      const stat = this.stats.get(id);
      if (!stat) return;

      this.updateStat(id, stat.value + amount);
    }

    calculateTrend(stat) {
      if (stat.change > 0) return 'up';
      if (stat.change < 0) return 'down';
      return 'stable';
    }

    generateRandomValue(stat) {
      const { min, max, variance, value } = stat;
      
      if (stat.type === 'counter' && stat.increment > 0) {
        return value + (Math.random() > 0.3 ? stat.increment : 0);
      }
      
      const change = (Math.random() - 0.5) * variance * 2;
      const newValue = value + change;
      
      return Math.max(min, Math.min(max, newValue));
    }

    startRealTimeUpdates() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.updateAllStats();
      }, this.updateFrequency);
    }

    stopRealTimeUpdates() {
      if (!this.isRunning) return;
      
      this.isRunning = false;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }

    updateAllStats() {
      this.stats.forEach((stat, id) => {
        const newValue = this.generateRandomValue(stat);
        this.updateStat(id, newValue);
      });
    }

    subscribe(id, callback) {
      if (!this.observers.has(id)) {
        this.observers.set(id, new Set());
      }
      this.observers.get(id).add(callback);
    }

    unsubscribe(id, callback) {
      const observers = this.observers.get(id);
      if (observers) {
        observers.delete(callback);
      }
    }

    notifyObservers(id, stat) {
      const observers = this.observers.get(id);
      if (observers) {
        observers.forEach(callback => callback(stat));
      }
    }

    bindEvents() {
      // Track page views
      this.incrementStat('pageViews');
      
      // Track unique visitors (simulate)
      if (Math.random() > 0.8) {
        this.incrementStat('uniqueVisitors');
      }
    }

    formatValue(stat) {
      switch (stat.format) {
        case 'number':
          return stat.value.toLocaleString();
        case 'percentage':
          return `${stat.value.toFixed(1)}%`;
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(stat.value);
        case 'duration':
          return this.formatDuration(stat.value);
        default:
          return stat.value.toString();
      }
    }

    formatDuration(seconds) {
      if (seconds < 60) {
        return `${Math.round(seconds)}s`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
    }

    exportStats() {
      const stats = Array.from(this.stats.values());
      return JSON.stringify(stats, null, 2);
    }

    importStats(data) {
      try {
        const stats = JSON.parse(data);
        stats.forEach(stat => {
          this.addStat(stat.id, stat);
        });
      } catch (error) {
        console.error('Failed to import stats:', error);
      }
    }
  }

  // ========================================
  // STATISTICS DISPLAY COMPONENT
  // ========================================

  class StatisticsDisplay {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        stats: [],
        layout: 'grid',
        showTrend: true,
        showChange: true,
        showIcon: true,
        showChart: false,
        animation: true,
        ...options
      };
      
      this.statManager = window.AYdocsStats?.manager || new StatisticsManager();
      this.statCards = new Map();
      
      this.init();
    }

    init() {
      if (!this.element) return;
      
      this.buildDisplay();
      this.bindEvents();
      this.startUpdates();
    }

    buildDisplay() {
      this.element.className = `statistics-display statistics-${this.options.layout}`;
      
      if (this.options.layout === 'grid') {
        this.buildGridLayout();
      } else if (this.options.layout === 'list') {
        this.buildListLayout();
      } else if (this.options.layout === 'dashboard') {
        this.buildDashboardLayout();
      }
    }

    buildGridLayout() {
      this.element.innerHTML = '';
      
      this.options.stats.forEach(statId => {
        const stat = this.statManager.getStat(statId);
        if (!stat) return;
        
        const card = this.createStatCard(stat);
        this.element.appendChild(card);
        this.statCards.set(statId, card);
      });
    }

    buildListLayout() {
      this.element.innerHTML = '<ul class="statistics-list"></ul>';
      const list = this.element.querySelector('.statistics-list');
      
      this.options.stats.forEach(statId => {
        const stat = this.statManager.getStat(statId);
        if (!stat) return;
        
        const item = this.createStatListItem(stat);
        list.appendChild(item);
        this.statCards.set(statId, item);
      });
    }

    buildDashboardLayout() {
      this.element.innerHTML = `
        <div class="statistics-dashboard">
          <div class="statistics-header">
            <h3 class="statistics-title">Real-time Statistics</h3>
            <div class="statistics-controls">
              <button class="statistics-refresh-btn" title="Refresh">
                <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
              <button class="statistics-export-btn" title="Export">
                <svg viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </button>
            </div>
          </div>
          <div class="statistics-grid"></div>
        </div>
      `;
      
      const grid = this.element.querySelector('.statistics-grid');
      
      this.options.stats.forEach(statId => {
        const stat = this.statManager.getStat(statId);
        if (!stat) return;
        
        const card = this.createStatCard(stat, true);
        grid.appendChild(card);
        this.statCards.set(statId, card);
      });
      
      this.bindDashboardEvents();
    }

    createStatCard(stat, isDashboard = false) {
      const card = document.createElement('div');
      card.className = `stat-card ${isDashboard ? 'stat-card-dashboard' : ''}`;
      card.setAttribute('data-stat-id', stat.id);
      
      const trendIcon = this.getTrendIcon(stat.trend);
      const changeClass = stat.change > 0 ? 'positive' : stat.change < 0 ? 'negative' : 'neutral';
      
      card.innerHTML = `
        <div class="stat-card-header">
          ${this.options.showIcon ? `<div class="stat-icon" style="color: ${stat.color}">${stat.icon}</div>` : ''}
          <div class="stat-info">
            <h4 class="stat-name">${stat.name}</h4>
            <div class="stat-value" style="color: ${stat.color}">${this.statManager.formatValue(stat)}</div>
          </div>
        </div>
        ${this.options.showChange || this.options.showTrend ? `
          <div class="stat-card-footer">
            ${this.options.showChange ? `
              <div class="stat-change ${changeClass}">
                <span class="stat-change-icon">${trendIcon}</span>
                <span class="stat-change-value">${Math.abs(stat.changePercentage).toFixed(1)}%</span>
              </div>
            ` : ''}
            ${this.options.showTrend ? `
              <div class="stat-trend ${stat.trend}">
                <span class="stat-trend-text">${stat.trend}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        ${this.options.showChart ? `<div class="stat-chart" data-stat-id="${stat.id}"></div>` : ''}
      `;
      
      return card;
    }

    createStatListItem(stat) {
      const item = document.createElement('li');
      item.className = 'stat-list-item';
      item.setAttribute('data-stat-id', stat.id);
      
      const trendIcon = this.getTrendIcon(stat.trend);
      const changeClass = stat.change > 0 ? 'positive' : stat.change < 0 ? 'negative' : 'neutral';
      
      item.innerHTML = `
        <div class="stat-list-icon" style="color: ${stat.color}">${stat.icon}</div>
        <div class="stat-list-content">
          <div class="stat-list-name">${stat.name}</div>
          <div class="stat-list-value" style="color: ${stat.color}">${this.statManager.formatValue(stat)}</div>
        </div>
        ${this.options.showChange ? `
          <div class="stat-list-change ${changeClass}">
            <span class="stat-change-icon">${trendIcon}</span>
            <span class="stat-change-value">${Math.abs(stat.changePercentage).toFixed(1)}%</span>
          </div>
        ` : ''}
      `;
      
      return item;
    }

    getTrendIcon(trend) {
      switch (trend) {
        case 'up': return '↗️';
        case 'down': return '↘️';
        default: return '→';
      }
    }

    updateStatCard(stat) {
      const card = this.statCards.get(stat.id);
      if (!card) return;
      
      const valueElement = card.querySelector('.stat-value, .stat-list-value');
      const changeElement = card.querySelector('.stat-change, .stat-list-change');
      const trendElement = card.querySelector('.stat-trend');
      
      if (valueElement) {
        if (this.options.animation) {
          valueElement.style.transform = 'scale(1.1)';
          setTimeout(() => {
            valueElement.style.transform = 'scale(1)';
          }, 200);
        }
        valueElement.textContent = this.statManager.formatValue(stat);
      }
      
      if (changeElement) {
        const changeClass = stat.change > 0 ? 'positive' : stat.change < 0 ? 'negative' : 'neutral';
        changeElement.className = changeElement.className.replace(/positive|negative|neutral/g, changeClass);
        
        const changeValue = changeElement.querySelector('.stat-change-value');
        if (changeValue) {
          changeValue.textContent = `${Math.abs(stat.changePercentage).toFixed(1)}%`;
        }
        
        const changeIcon = changeElement.querySelector('.stat-change-icon');
        if (changeIcon) {
          changeIcon.textContent = this.getTrendIcon(stat.trend);
        }
      }
      
      if (trendElement) {
        trendElement.className = `stat-trend ${stat.trend}`;
        const trendText = trendElement.querySelector('.stat-trend-text');
        if (trendText) {
          trendText.textContent = stat.trend;
        }
      }
    }

    bindEvents() {
      this.options.stats.forEach(statId => {
        this.statManager.subscribe(statId, (stat) => {
          this.updateStatCard(stat);
        });
      });
    }

    bindDashboardEvents() {
      const refreshBtn = this.element.querySelector('.statistics-refresh-btn');
      const exportBtn = this.element.querySelector('.statistics-export-btn');
      
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.statManager.updateAllStats();
        });
      }
      
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const data = this.statManager.exportStats();
          this.downloadFile(data, 'statistics.json', 'application/json');
        });
      }
    }

    startUpdates() {
      this.statManager.startRealTimeUpdates();
    }

    stopUpdates() {
      this.statManager.stopRealTimeUpdates();
    }

    downloadFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    destroy() {
      this.stopUpdates();
      this.statCards.clear();
    }
  }

  // ========================================
  // STATISTICS CHART COMPONENT
  // ========================================

  class StatisticsChart {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        statId: null,
        type: 'line',
        duration: 30000, // 30 seconds
        maxDataPoints: 30,
        ...options
      };
      
      this.data = [];
      this.statManager = window.AYdocsStats?.manager || new StatisticsManager();
      
      this.init();
    }

    init() {
      if (!this.element || !this.options.statId) return;
      
      this.createChart();
      this.bindEvents();
      this.startDataCollection();
    }

    createChart() {
      this.element.innerHTML = `
        <div class="stat-chart-container">
          <div class="stat-chart-header">
            <h4 class="stat-chart-title">${this.options.statId} Trend</h4>
            <div class="stat-chart-controls">
              <button class="stat-chart-pause-btn" title="Pause/Resume">
                <svg viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              </button>
            </div>
          </div>
          <div class="stat-chart-canvas">
            <svg class="stat-chart-svg" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:var(--color-primary);stop-opacity:0" />
                </linearGradient>
              </defs>
              <g class="chart-grid"></g>
              <g class="chart-area"></g>
              <g class="chart-line"></g>
              <g class="chart-points"></g>
            </svg>
          </div>
        </div>
      `;
      
      this.svg = this.element.querySelector('.stat-chart-svg');
      this.grid = this.element.querySelector('.chart-grid');
      this.area = this.element.querySelector('.chart-area');
      this.line = this.element.querySelector('.chart-line');
      this.points = this.element.querySelector('.chart-points');
      
      this.setupChart();
    }

    setupChart() {
      this.width = 400;
      this.height = 200;
      this.padding = { top: 20, right: 20, bottom: 30, left: 40 };
      
      this.drawGrid();
    }

    drawGrid() {
      const gridLines = 5;
      const stepY = (this.height - this.padding.top - this.padding.bottom) / gridLines;
      
      for (let i = 0; i <= gridLines; i++) {
        const y = this.padding.top + (i * stepY);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', this.padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', this.width - this.padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'var(--color-border)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.3');
        this.grid.appendChild(line);
      }
    }

    bindEvents() {
      const pauseBtn = this.element.querySelector('.stat-chart-pause-btn');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          this.togglePause();
        });
      }
      
      this.statManager.subscribe(this.options.statId, (stat) => {
        this.addDataPoint(stat.value);
      });
    }

    addDataPoint(value) {
      const timestamp = Date.now();
      this.data.push({ value, timestamp });
      
      // Keep only recent data points
      if (this.data.length > this.options.maxDataPoints) {
        this.data.shift();
      }
      
      this.updateChart();
    }

    updateChart() {
      if (this.data.length < 2) return;
      
      const values = this.data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const valueRange = maxValue - minValue || 1;
      
      const chartWidth = this.width - this.padding.left - this.padding.right;
      const chartHeight = this.height - this.padding.top - this.padding.bottom;
      
      // Clear previous drawings
      this.area.innerHTML = '';
      this.line.innerHTML = '';
      this.points.innerHTML = '';
      
      // Create path data
      let pathData = '';
      let areaData = '';
      
      this.data.forEach((point, index) => {
        const x = this.padding.left + (index / (this.data.length - 1)) * chartWidth;
        const y = this.padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
          pathData += `M ${x} ${y}`;
          areaData += `M ${x} ${this.padding.top + chartHeight} L ${x} ${y}`;
        } else {
          pathData += ` L ${x} ${y}`;
          areaData += ` L ${x} ${y}`;
        }
      });
      
      // Close area path
      areaData += ` L ${this.padding.left + chartWidth} ${this.padding.top + chartHeight} Z`;
      
      // Draw area
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      areaPath.setAttribute('d', areaData);
      areaPath.setAttribute('fill', 'url(#chartGradient)');
      this.area.appendChild(areaPath);
      
      // Draw line
      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      linePath.setAttribute('d', pathData);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', 'var(--color-primary)');
      linePath.setAttribute('stroke-width', '2');
      this.line.appendChild(linePath);
      
      // Draw points
      this.data.forEach((point, index) => {
        const x = this.padding.left + (index / (this.data.length - 1)) * chartWidth;
        const y = this.padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', 'var(--color-primary)');
        circle.setAttribute('stroke', 'var(--color-background)');
        circle.setAttribute('stroke-width', '2');
        this.points.appendChild(circle);
      });
    }

    startDataCollection() {
      // Start collecting data points
      this.collectionInterval = setInterval(() => {
        const stat = this.statManager.getStat(this.options.statId);
        if (stat) {
          this.addDataPoint(stat.value);
        }
      }, 1000);
    }

    togglePause() {
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
        this.collectionInterval = null;
      } else {
        this.startDataCollection();
      }
    }

    destroy() {
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
      }
    }
  }

  // ========================================
  // INITIALIZE AND EXPORT
  // ========================================

  // Create global statistics manager
  const statisticsManager = new StatisticsManager();

  // Export to global scope
  window.AYdocsStats = {
    manager: statisticsManager,
    StatisticsDisplay,
    StatisticsChart,
    
    // Convenience methods
    createDisplay: (element, options) => new StatisticsDisplay(element, options),
    createChart: (element, options) => new StatisticsChart(element, options),
    
    // Direct access to manager methods
    addStat: (id, config) => statisticsManager.addStat(id, config),
    getStat: (id) => statisticsManager.getStat(id),
    getAllStats: () => statisticsManager.getAllStats(),
    updateStat: (id, value) => statisticsManager.updateStat(id, value),
    incrementStat: (id, amount) => statisticsManager.incrementStat(id, amount),
    startUpdates: () => statisticsManager.startRealTimeUpdates(),
    stopUpdates: () => statisticsManager.stopRealTimeUpdates()
  };

  // Start real-time updates
  statisticsManager.startRealTimeUpdates();

})();
