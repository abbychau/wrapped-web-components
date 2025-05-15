/**
 * Utility for defining custom elements
 */

import { Component } from './component.js';

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
export function define(tagName, options = {}) {
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
