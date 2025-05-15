
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebComponentWrapper = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Base Component class that extends HTMLElement
   * Provides the foundation for creating web components with plain HTML, JS, and CSS
   */

  class Component extends HTMLElement {
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

    /**
     * Renders repeatable elements from a data array using a template element
     * @param {string} containerSelector - CSS selector for the container element
     * @param {string} templateRefAttribute - The data-repeatable-ref attribute value of the template element
     * @param {Array} dataArray - Array of data objects to render
     * @param {Function} configureElementCallback - Callback to configure each cloned element, receives (element, dataItem)
     * @returns {Array} - Array of created elements
     */
    renderRepeatableElements(containerSelector, templateRefAttribute, dataArray, configureElementCallback) {
      try {
        // Get container
        const container = this.getElement(containerSelector);
        if (!container) {
          console.error(`Container element not found: ${containerSelector}`);
          return [];
        }

        // Find the template element using data-repeatable-ref attribute
        const templateSelector = `[data-repeatable-ref="${templateRefAttribute}"]`;
        const templateElement = this.getElement(templateSelector);

        if (!templateElement) {
          console.error(`Template element not found with ref: ${templateRefAttribute}`);
          return [];
        }

        // Clone the template element to preserve it
        const template = templateElement.cloneNode(true);

        // Clear the container but preserve the structure
        container.innerHTML = '';

        // Create array to store created elements
        const createdElements = [];

        // Create and append elements for each data item
        dataArray.forEach(dataItem => {
          // Clone the template
          const newElement = template.cloneNode(true);

          // Remove the template reference attribute
          newElement.removeAttribute('data-repeatable-ref');

          // Configure the element using the callback
          if (typeof configureElementCallback === 'function') {
            configureElementCallback(newElement, dataItem);
          }

          // Add to container
          container.appendChild(newElement);
          createdElements.push(newElement);
        });

        return createdElements;
      } catch (error) {
        console.error('Error rendering repeatable elements:', error);
        return [];
      }
    }
  }

  /**
   * HTML templating utility
   * Allows for creating HTML templates with interpolation
   */

  /**
   * Creates an HTML template string with interpolation
   * @param {Array<string>} strings - The template string parts
   * @param {...*} values - The values to interpolate
   * @returns {string} - The processed HTML string
   */
  function html(strings, ...values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] || '';
      
      // Process the value based on its type
      let processedValue;
      
      if (value === null || value === undefined) {
        processedValue = '';
      } else if (typeof value === 'object' && value.isEventBinding) {
        // Handle event binding
        processedValue = `data-event-${value.eventName}="${value.handlerName}"`;
      } else if (Array.isArray(value)) {
        // Join arrays
        processedValue = value.join('');
      } else {
        // Convert to string and escape HTML
        processedValue = escapeHTML(String(value));
      }
      
      return result + string + processedValue;
    }, '');
  }

  /**
   * Creates an event binding for use in templates
   * @param {string} eventName - The name of the event (e.g., 'click')
   * @param {string} handlerName - The name of the handler method on the component
   * @returns {Object} - An event binding object
   */
  html.event = function(eventName, handlerName) {
    return {
      isEventBinding: true,
      eventName,
      handlerName
    };
  };

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} str - The string to escape
   * @returns {string} - The escaped string
   */
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * CSS utility for creating component styles
   */

  /**
   * Creates a CSS string from template literals
   * @param {Array<string>} strings - The template string parts
   * @param {...*} values - The values to interpolate
   * @returns {string} - The processed CSS string
   */
  function css(strings, ...values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] || '';
      return result + string + value;
    }, '');
  }

  /**
   * Utility for defining custom elements
   */


  /**
   * Define a custom element
   * @param {string} tagName - The tag name for the custom element
   * @param {Object} options - The component options
   * @param {string|Function} [options.template] - The HTML template
   * @param {string} [options.styles] - The CSS styles
   * @param {boolean} [options.useShadow=false] - Whether to use Shadow DOM
   * @param {Array<string>} [options.observedAttributes=[]] - Attributes to observe
   * @param {Object} [options.methods={}] - Methods to add to the component
   * @param {Object} [options.properties={}] - Properties to add to the component
   * @returns {typeof Component} - The component class
   */
  function define(tagName, options = {}) {
    // Create a new component class that extends the base Component
    class CustomComponent extends Component {}

    // Add static properties
    CustomComponent.template = options.template || '';
    CustomComponent.styles = options.styles || '';
    CustomComponent.useShadow = options.useShadow === true;
    CustomComponent.observedAttributes = options.observedAttributes || [];

    // Add methods to the prototype
    if (options.methods) {
      Object.entries(options.methods).forEach(([name, method]) => {
        CustomComponent.prototype[name] = method;
      });
    }

    // Add property getters and setters
    if (options.properties) {
      Object.entries(options.properties).forEach(([name, config]) => {
        // Define the property
        Object.defineProperty(CustomComponent.prototype, name, {
          get() {
            return this._props[name] !== undefined ? this._props[name] : config.default;
          },
          set(value) {
            const oldValue = this._props[name];
            this._props[name] = value;

            // Reflect to attribute if specified
            if (config.reflect) {
              const attrName = name.replace(/([A-Z])/g, '-$1').toLowerCase();

              if (value === null || value === undefined) {
                this.removeAttribute(attrName);
              } else if (typeof value === 'boolean') {
                if (value) {
                  this.setAttribute(attrName, '');
                } else {
                  this.removeAttribute(attrName);
                }
              } else {
                this.setAttribute(attrName, value);
              }
            }

            // Call observer method if specified
            if (config.observer && typeof this[config.observer] === 'function') {
              this[config.observer](value, oldValue, name);
            }
            
            // Call property changed callback if it exists
            if (typeof this.propertyChanged === 'function' && oldValue !== value) {
              this.propertyChanged(name, oldValue, value);
            }
          },
          configurable: true,
          enumerable: true
        });

        // Add to observed attributes if reflective
        if (config.reflect && !CustomComponent.observedAttributes.includes(name)) {
          const attrName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
          CustomComponent.observedAttributes.push(attrName);
        }
      });
    }

    // Define the custom element
    customElements.define(tagName, CustomComponent);

    return CustomComponent;
  }

  /**
   * Component Loader
   * Loads and parses HTML component files
   */

  /**
   * Loads a component from an HTML file
   * @param {string} url - The URL of the HTML file
   * @returns {Promise<Object>} - The parsed component
   */
  async function loadComponent(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load component from ${url}: ${response.statusText}`);
      }
      
      const html = await response.text();
      return parseComponent(html);
    } catch (error) {
      console.error(`Error loading component: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parses a component from HTML string
   * @param {string} html - The HTML string
   * @returns {Object} - The parsed component
   */
  function parseComponent(html) {
    // Create a temporary document to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract template
    const templateElement = doc.querySelector('template');
    const template = templateElement ? templateElement.innerHTML.trim() : '';
    
    // Extract style
    const styleElement = doc.querySelector('style');
    const style = styleElement ? styleElement.textContent.trim() : '';
    
    // Extract script
    const scriptElement = doc.querySelector('script');
    let script = {};
    
    if (scriptElement) {
      try {
        // Extract the content of the script tag
        const scriptContent = scriptElement.textContent.trim();
        
        // Create a function that will evaluate the script and return the exported object
        const scriptFunction = new Function('exports', `
        const module = { exports: {} };
        const exportObj = {};
        
        // Define export default
        function exportDefault(obj) {
          Object.assign(exportObj, obj);
        }
        
        // Execute the script
        ${scriptContent}
        
        // Return the exported object
        return exportObj;
      `);
        
        // Execute the function to get the exported object
        script = scriptFunction();
      } catch (error) {
        console.error(`Error parsing script: ${error.message}`);
      }
    }
    
    // Extract attributes from the root element
    const rootElement = doc.body.firstElementChild;
    const attributes = {};
    
    if (rootElement) {
      Array.from(rootElement.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          const propName = attr.name.replace('data-', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          attributes[propName] = attr.value;
        }
      });
    }
    
    return {
      template,
      style,
      script,
      attributes
    };
  }

  /**
   * Component Registry
   * Manages component registration and loading
   */


  // Store for registered components
  const registry = new Map();

  /**
   * Register a component
   * @param {string} tagName - The tag name for the custom element
   * @param {Object|string} options - Component options or URL to HTML file
   * @returns {Promise<typeof Component>} - The component class
   */
  async function register(tagName, options) {
    // If options is a string, treat it as a URL and load the component
    if (typeof options === 'string') {
      try {
        const component = await loadComponent(options);
        return registerComponent(tagName, component);
      } catch (error) {
        console.error(`Failed to register component ${tagName}: ${error.message}`);
        throw error;
      }
    } else {
      // If options is an object, register directly
      return registerComponent(tagName, options);
    }
  }

  /**
   * Register a component with the given options
   * @param {string} tagName - The tag name for the custom element
   * @param {Object} options - The component options
   * @returns {typeof Component} - The component class
   */
  function registerComponent(tagName, options) {
    // Create a new component class that extends the base Component
    class CustomComponent extends Component {}

    // Add static properties
    CustomComponent.template = options.template || '';
    CustomComponent.styles = options.style || '';
    CustomComponent.useShadow = options.script?.useShadow === true;
    CustomComponent.observedAttributes = options.script?.observedAttributes || [];

    // Add methods to the prototype
    if (options.script?.methods) {
      Object.entries(options.script.methods).forEach(([name, method]) => {
        CustomComponent.prototype[name] = method;
      });
    }

    // Add lifecycle hooks
    ['init', 'connected', 'disconnected', 'attributeChanged', 'propertyChanged'].forEach(hook => {
      if (typeof options.script?.[hook] === 'function') {
        CustomComponent.prototype[hook] = options.script[hook];
      }
    });

    // Add property getters and setters
    if (options.script?.properties) {
      Object.entries(options.script.properties).forEach(([name, config]) => {
        // Define the property
        Object.defineProperty(CustomComponent.prototype, name, {
          get() {
            return this._props[name] !== undefined ? this._props[name] : config.default;
          },
          set(value) {
            const oldValue = this._props[name];
            this._props[name] = value;

            // Reflect to attribute if specified
            if (config.reflect) {
              const attrName = name.replace(/([A-Z])/g, '-$1').toLowerCase();

              if (value === null || value === undefined) {
                this.removeAttribute(attrName);
              } else if (typeof value === 'boolean') {
                if (value) {
                  this.setAttribute(attrName, '');
                } else {
                  this.removeAttribute(attrName);
                }
              } else {
                this.setAttribute(attrName, value);
              }
            }

            // Call observer method if specified
            if (config.observer && typeof this[config.observer] === 'function') {
              this[config.observer](value, oldValue, name);
            }

            // Call property changed callback if it exists
            if (typeof this.propertyChanged === 'function' && oldValue !== value) {
              this.propertyChanged(name, oldValue, value);
            }
          },
          configurable: true,
          enumerable: true
        });

        // Add to observed attributes if reflective
        if (config.reflect && !CustomComponent.observedAttributes.includes(name)) {
          const attrName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
          CustomComponent.observedAttributes.push(attrName);
        }
      });
    }

    // Define the custom element
    customElements.define(tagName, CustomComponent);

    // Store the component in the registry
    registry.set(tagName, CustomComponent);

    return CustomComponent;
  }

  /**
   * Get a registered component
   * @param {string} tagName - The tag name of the component
   * @returns {typeof Component|undefined} - The component class or undefined if not found
   */
  function getComponent(tagName) {
    return registry.get(tagName);
  }

  /**
   * Check if a component is registered
   * @param {string} tagName - The tag name of the component
   * @returns {boolean} - Whether the component is registered
   */
  function hasComponent(tagName) {
    return registry.has(tagName);
  }

  exports.Component = Component;
  exports.css = css;
  exports.define = define;
  exports.getComponent = getComponent;
  exports.hasComponent = hasComponent;
  exports.html = html;
  exports.loadComponent = loadComponent;
  exports.parseComponent = parseComponent;
  exports.register = register;

}));
//# sourceMappingURL=index.js.map
