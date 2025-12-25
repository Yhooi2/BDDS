/**
 * ViewToggle.js - View Mode Toggle Component for BDDS Dashboard
 *
 * Toggles between "details" and "dynamics" view modes
 */

/**
 * View mode labels
 */
const VIEW_LABELS = {
  details: 'Детали за текущий год',
  dynamics: 'Динамика по годам'
};

/**
 * ViewToggle component
 */
const ViewToggle = {
  // State
  state: {
    mode: 'details' // 'details' | 'dynamics'
  },

  // DOM references
  elements: {
    button: null,
    text: null
  },

  /**
   * Initialize the component
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    this.state.mode = options.mode || window.DATA?.viewMode || 'details';
    this.state.onChange = options.onChange || (() => {});

    // Get DOM elements
    this.elements.button = $('#viewToggle');
    this.elements.text = $('#viewToggleText');

    if (!this.elements.button) {
      console.error('ViewToggle: Button element not found');
      return;
    }

    // Initial render
    this.render();
    this.attachEvents();
  },

  /**
   * Render the toggle
   */
  render() {
    if (this.elements.text) {
      this.elements.text.textContent = VIEW_LABELS[this.state.mode];
    }

    // Update aria label
    if (this.elements.button) {
      const nextMode = this.state.mode === 'details' ? 'dynamics' : 'details';
      this.elements.button.setAttribute(
        'aria-label',
        `Переключить на ${VIEW_LABELS[nextMode]}`
      );
    }
  },

  /**
   * Attach event listeners
   */
  attachEvents() {
    if (this.elements.button) {
      this.elements.button.addEventListener('click', () => this.toggle());
    }
  },

  /**
   * Toggle between modes
   */
  toggle() {
    this.state.mode = this.state.mode === 'details' ? 'dynamics' : 'details';
    this.render();

    // Callback
    if (typeof this.state.onChange === 'function') {
      this.state.onChange(this.state.mode);
    }
  },

  /**
   * Get current mode
   * @returns {string} Current view mode
   */
  getMode() {
    return this.state.mode;
  },

  /**
   * Set mode programmatically
   * @param {string} mode - View mode ('details' | 'dynamics')
   */
  setMode(mode) {
    if (mode === 'details' || mode === 'dynamics') {
      this.state.mode = mode;
      this.render();
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VIEW_LABELS,
    ViewToggle
  };
}
