/**
 * Base Component class that extends HTMLElement
 * Provides the foundation for creating web components with plain HTML, JS, and CSS
 */

export class Component extends HTMLElement {
  constructor() {
    super();

    // Create shadow DOM only if explicitly requested
    if (this.constructor.useShadow === true) {
      this.attachShadow({ mode: 'open' });
    }

    // Store for component properties
    this._props = {};

    // Initialize component
    this._initialize();
  }

  /**
   * Initialize the component
   * @private
   */
  _initialize() {
    // Apply styles if defined
    if (this.constructor.styles) {
      this._applyStyles();
    }

    // Apply template if defined
    if (this.constructor.template) {
      this._applyTemplate();
    }

    // Call the component's init method if it exists
    if (typeof this.init === 'function') {
      this.init();
    }
  }

  /**
   * Apply styles to the component
   * @private
   */
  _applyStyles() {
    const styles = this.constructor.styles;

    if (this.shadowRoot) {
      // If using shadow DOM, add styles to the shadow root
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      this.shadowRoot.appendChild(styleElement);
    } else {
      // If not using shadow DOM, add scoped styles
      const styleElement = document.createElement('style');

      // Add a unique attribute to the component
      const scopeAttr = `data-${this.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;
      this.setAttribute(scopeAttr, '');

      // Process CSS to scope all selectors with the unique attribute
      let scopedStyles = '';

      // Split the CSS into rule blocks
      const cssRules = styles.split('}');

      for (let rule of cssRules) {
        if (!rule.trim()) continue;

        // Find the position of the opening brace
        const braceIndex = rule.indexOf('{');
        if (braceIndex === -1) continue;

        // Extract selector and declarations
        const selector = rule.substring(0, braceIndex).trim();
        const declarations = rule.substring(braceIndex + 1).trim();

        // Skip @-rules like @media, @keyframes, etc.
        if (selector.startsWith('@')) {
          scopedStyles += `${rule}}`;
          continue;
        }

        // Add scope to each selector
        const scopedSelector = selector
          .split(',')
          .map(s => `[${scopeAttr}] ${s.trim()}`)
          .join(', ');

        // Combine the scoped selector with the declarations
        scopedStyles += `${scopedSelector} {${declarations}}`;
      }

      styleElement.textContent = scopedStyles;
      document.head.appendChild(styleElement);
    }
  }

  /**
   * Apply template to the component
   * @private
   */
  _applyTemplate() {
    const template = this.constructor.template;

    // Get the container (shadow root or the element itself)
    const container = this.shadowRoot || this;

    // If template is a function, call it with the component as context
    if (typeof template === 'function') {
      container.innerHTML = template.call(this);
    } else {
      container.innerHTML = template;
    }

    // Process any event bindings in the template
    this._processEventBindings(container);
  }

  /**
   * Process event bindings in the template
   * @private
   * @param {Element} container - The container element (shadow root or the element itself)
   */
  _processEventBindings(container) {
    // Get all elements in the container
    const allElements = container.querySelectorAll('*');

    // Iterate through all elements to find those with data-event attributes
    Array.from(allElements).forEach(element => {
      // Get all attributes
      const attributes = Array.from(element.attributes);

      // Find event binding attributes
      const eventAttrs = attributes.filter(attr => attr.name.startsWith('data-event-'));

      eventAttrs.forEach(attr => {
        // Extract event name and handler name
        const eventName = attr.name.replace('data-event-', '');
        const handlerName = attr.value;

        // Check if the handler exists on the component
        if (typeof this[handlerName] === 'function') {
          // Add event listener
          element.addEventListener(eventName, this[handlerName].bind(this));
        } else {
          console.warn(`Handler "${handlerName}" not found for event "${eventName}"`);
        }

        // Remove the attribute
        element.removeAttribute(attr.name);
      });
    });
  }

  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback() {
    if (typeof this.connected === 'function') {
      this.connected();
    }
  }

  /**
   * Called when the element is disconnected from the DOM
   */
  disconnectedCallback() {
    if (typeof this.disconnected === 'function') {
      this.disconnected();
    }
  }

  /**
   * Called when an observed attribute changes
   * @param {string} name - The name of the attribute
   * @param {string} oldValue - The old value of the attribute
   * @param {string} newValue - The new value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Update the corresponding property
    if (oldValue !== newValue) {
      // Convert attribute name to property name (kebab-case to camelCase)
      const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

      // Update the property
      this[propName] = this._parseAttributeValue(newValue);

      // Call the attribute changed method if it exists
      if (typeof this.attributeChanged === 'function') {
        this.attributeChanged(name, oldValue, newValue);
      }
    }
  }

  /**
   * Parse attribute value to the appropriate type
   * @private
   * @param {string} value - The attribute value
   * @returns {*} - The parsed value
   */
  _parseAttributeValue(value) {
    // If value is null or undefined, return it as is
    if (value === null || value === undefined) {
      return value;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, return the value as a string
      return value;
    }
  }

  /**
   * Query an element that works with both Shadow DOM and Light DOM
   * @param {string} selector - CSS selector to query
   * @returns {Element|null} - The first element matching the selector or null
   */
  getElement(selector) {
    return this.shadowRoot
      ? this.shadowRoot.querySelector(selector)
      : this.querySelector(selector);
  }

  /**
   * Query all elements that work with both Shadow DOM and Light DOM
   * @param {string} selector - CSS selector to query
   * @returns {NodeList} - All elements matching the selector
   */
  getAllElements(selector) {
    return this.shadowRoot
      ? this.shadowRoot.querySelectorAll(selector)
      : this.querySelectorAll(selector);
  }

  /**
   * Update the component with new properties
   * @param {Object} props - The properties to update
   */
  update(props = {}) {
    // Update properties
    Object.entries(props).forEach(([key, value]) => {
      this[key] = value;
    });

    // Re-render the component
    if (this.constructor.template) {
      this._applyTemplate();
    }
  }
}
