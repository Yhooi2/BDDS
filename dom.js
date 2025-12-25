/**
 * dom.js - DOM utilities for BDDS Dashboard
 *
 * Helper functions for DOM manipulation and SVG creation
 */

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Found element or null
 */
function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query selector all shorthand
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList} List of found elements
 */
function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Create HTML element with optional class and content
 * @param {string} tag - HTML tag name
 * @param {string|string[]} className - CSS class(es)
 * @param {string|Element|Element[]} content - Text content or child elements
 * @param {Object} attrs - Additional attributes
 * @returns {HTMLElement} Created element
 */
function createElement(tag, className = '', content = '', attrs = {}) {
  const element = document.createElement(tag);

  // Handle class names
  if (className) {
    if (Array.isArray(className)) {
      element.classList.add(...className.filter(Boolean));
    } else {
      element.className = className;
    }
  }

  // Handle content
  if (content) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (child) element.appendChild(child);
      });
    } else if (content instanceof Element) {
      element.appendChild(content);
    }
  }

  // Handle attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'data') {
      // Handle data attributes
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      // Handle style object
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Handle event listeners
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  return element;
}

/**
 * SVG namespace
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create SVG element with attributes
 * @param {string} tag - SVG tag name
 * @param {Object} attrs - SVG attributes
 * @returns {SVGElement} Created SVG element
 */
function createSVGElement(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });

  return element;
}

/**
 * Create an SVG container
 * @param {number} width - ViewBox width
 * @param {number} height - ViewBox height
 * @param {string} className - CSS class
 * @returns {SVGElement} SVG element
 */
function createSVG(width, height, className = '') {
  const svg = createSVGElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: className,
    preserveAspectRatio: 'xMidYMid meet'
  });
  return svg;
}

/**
 * Create SVG text element
 * @param {string} text - Text content
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} attrs - Additional attributes
 * @returns {SVGTextElement} SVG text element
 */
function createSVGText(text, x, y, attrs = {}) {
  const textElement = createSVGElement('text', { x, y, ...attrs });
  textElement.textContent = text;
  return textElement;
}

/**
 * Create SVG rect element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {Object} attrs - Additional attributes (rx, ry, fill, etc.)
 * @returns {SVGRectElement} SVG rect element
 */
function createSVGRect(x, y, width, height, attrs = {}) {
  return createSVGElement('rect', { x, y, width, height, ...attrs });
}

/**
 * Create SVG line element
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {Object} attrs - Additional attributes
 * @returns {SVGLineElement} SVG line element
 */
function createSVGLine(x1, y1, x2, y2, attrs = {}) {
  return createSVGElement('line', { x1, y1, x2, y2, ...attrs });
}

/**
 * Create SVG group element
 * @param {string} className - CSS class
 * @param {SVGElement[]} children - Child elements
 * @returns {SVGGElement} SVG group element
 */
function createSVGGroup(className = '', children = []) {
  const group = createSVGElement('g', { class: className });
  children.forEach(child => {
    if (child) group.appendChild(child);
  });
  return group;
}

/**
 * Clear all children from an element
 * @param {Element} element - Element to clear
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {Function} Cleanup function
 */
function addEvent(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

/**
 * Toggle class on element
 * @param {Element} element - Target element
 * @param {string} className - Class to toggle
 * @param {boolean} force - Force add/remove
 */
function toggleClass(element, className, force) {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
}

/**
 * Check if element has class
 * @param {Element} element - Target element
 * @param {string} className - Class to check
 * @returns {boolean} True if element has class
 */
function hasClass(element, className) {
  return element.classList.contains(className);
}

/**
 * Set multiple attributes on element
 * @param {Element} element - Target element
 * @param {Object} attrs - Attributes to set
 */
function setAttrs(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

/**
 * Get data attribute value
 * @param {Element} element - Target element
 * @param {string} key - Data attribute key (without 'data-' prefix)
 * @returns {string|undefined} Attribute value
 */
function getData(element, key) {
  return element.dataset[key];
}

/**
 * Set data attribute value
 * @param {Element} element - Target element
 * @param {string} key - Data attribute key
 * @param {string} value - Attribute value
 */
function setData(element, key, value) {
  element.dataset[key] = value;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $,
    $$,
    createElement,
    SVG_NS,
    createSVGElement,
    createSVG,
    createSVGText,
    createSVGRect,
    createSVGLine,
    createSVGGroup,
    clearElement,
    addEvent,
    toggleClass,
    hasClass,
    setAttrs,
    getData,
    setData
  };
}
