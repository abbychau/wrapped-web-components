/**
 * Component Registry
 * Manages component registration and loading
 */

import { Component } from './component.js';
import { loadComponent, parseComponent } from './loader.js';

// Store for registered components
const registry = new Map();

/**
 * Register a component
 * @param {string} tagName - The tag name for the custom element
 * @param {Object|string} options - Component options or URL to HTML file
 * @returns {Promise<typeof Component>} - The component class
 */
export async function register(tagName, options) {
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
export function getComponent(tagName) {
  return registry.get(tagName);
}

/**
 * Check if a component is registered
 * @param {string} tagName - The tag name of the component
 * @returns {boolean} - Whether the component is registered
 */
export function hasComponent(tagName) {
  return registry.has(tagName);
}
