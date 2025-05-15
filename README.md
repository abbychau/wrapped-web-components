<div align="center">
  <img src="https://raw.githubusercontent.com/abbychau/wrapped-web-components/main/docs/assets/wwc-logo.svg" alt="WWC Logo" width="150">
  <h1>Wrapped Web Components (WWC)</h1>
  <p><em>Include it with CDN, you no longer need to setup a CI/CD pipeline just for a simple webapp.</em></p>
  <p>
    <a href="https://abbychau.github.io/wrapped-web-components/">View Demo</a> •
    <a href="https://www.npmjs.com/package/wrapped-web-components">NPM Package</a>
  </p>
</div>

A lightweight JavaScript library that simplifies web component creation by allowing developers to use plain HTML, JS, and CSS instead of dealing with template.innerHTML and other low-level Web Component APIs.

**New Feature**: Now supports defining components in separate HTML files with native HTML, CSS, and JS syntax!

## Why Wrapped Web Components?

While modern web frameworks (e.g. React, Vue, Angular) excel for complex applications, they're often overkill for simpler projects or when you just need a few interactive components on a page. jQuery-template and other lightweight alternatives (e.g. htmx) exist, but they often lack proper component encapsulation and can become difficult to manage as your project grows.

Moreover, large frameworks are UNABLE to be included in a `script` tag, which means you need to set up a build process, package manager, and other dependencies just to get started. This can be overwhelming for small projects or for developers who prefer a more straightforward approach.

Additionally, while Web Components provide a native way to create reusable components, they can be cumbersome to work with. Most importantly, you need to write a lot of boilerplate code to define a component, including setting up the `template`, `shadowRoot`, and other low-level APIs. This can be tedious and error-prone, especially for developers who are new to Web Components.

Svelte did a great job of solving this problem by providing a simple syntax for defining components; Google Lit also did a great job of creating Web Components using JSX; but they still requires a build step and a package manager. This means you can't just include it in your HTML file and start using it right away.

Here comes **Wrapped Web Components** (WWC). WWC is a lightweight library that allows you to create Web Components using **NATIVE** HTML, CSS, and JavaScript. You just need to register the components in a `script` tag, and put the component files in the same directory as your HTML file. There is nearly no learning curve to write a component. They are just like a regular HTML (or Svelte if you are familiar with it) file, but with a few extra features.

## Features

- 🚀 **No Need to Compile** - Use directly in your HTML without any build steps or compilation process.
- 📦 **No Need to npm Install** - Load directly from CDN or include the script file - no package manager required (though you can still use npm if you prefer).
- 📄 **Separated Component Files** - Define components in separate HTML files with native syntax for better organization and maintainability.
- 🌟 **Simple Hooks** - Intuitive lifecycle hooks: `init`, `connected`, `disconnected`, `attributeChanged`, and `propertyChanged`.
- 🧩 **Light DOM by Default** - Uses Light DOM by default for better CSS integration, with option to enable Shadow DOM when encapsulation is needed.
- 🖌️ **CDN Friendly** - Load components from a CDN without any additional setup. Just include the script tag and you're good to go!

## Installation

### NPM (only if you prefer to host WWC)
```bash
npm install wrapped-web-components
```

### CDN
The easiest way to use the library is directly from a CDN:

#### UMD Build (Global Variable)
```html
<script src="https://unpkg.com/wrapped-web-components/dist/index.js"></script>
<script>
  // The library is available as a global variable
  const { define, html, css, register } = WebComponentWrapper;
</script>
```

#### ES Module
```html
<script type="module">
  import { define, html, css, register } from 'https://unpkg.com/wrapped-web-components/dist/index.esm.js';
</script>
```

Alternative: 
- `https://cdn.jsdelivr.net/npm/wrapped-web-components/dist/index.esm.js`
- `https://cdn.jsdelivr.net/npm/wrapped-web-components/dist/index.js`

Can be useful if unpkg is down or not updated, also recommended

## Usage

### Method 1: Using Native HTML Files (Recommended)

Create a component in a separate HTML file with native HTML, CSS, and JS:

**my-counter.html**
```html
<template>
  <div class="counter">
    <h3>Counter: <span id="count-value">0</span></h3>
    <button id="increment-btn">Increment</button>
    <button id="decrement-btn">Decrement</button>
  </div>
</template>

<style>
  .counter {
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }

  button {
    margin-right: 5px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>

<script>
  // Export component configuration
  exportDefault({
    // Properties
    properties: {
      count: {
        default: 0,
        reflect: true
      }
    },

    // Methods
    methods: {
      increment() {
        this.count++;
        this.updateCounter();
      },

      decrement() {
        this.count--;
        this.updateCounter();
      },
      
      updateCounter() {
        const countElement = this.getElement('#count-value');
        if (countElement) {
          countElement.textContent = this.count;
        }
      }
    },

    // Lifecycle hooks
    init() {
      // Add event listeners
      const incrementBtn = this.getElement('#increment-btn');
      const decrementBtn = this.getElement('#decrement-btn');

      if (incrementBtn) {
        incrementBtn.addEventListener('click', () => this.increment());
      }

      if (decrementBtn) {
        decrementBtn.addEventListener('click', () => this.decrement());
      }

      // Initialize counter display
      this.updateCounter();
    }
  });
</script>
```

Then register the component:

```javascript
import { register } from 'wrapped-web-components';

// Register component from HTML file
register('my-counter', './components/my-counter.html');
```

### Method 2: Using JavaScript API

```javascript
import { define, html, css } from 'wrapped-web-components';

define('my-counter', {
  // HTML template with interpolation
  template: html`
    <div class="counter">
      <h3>Counter: <span>${'count'}</span></h3>
      <button ${html.event('click', 'increment')}>Increment</button>
      <button ${html.event('click', 'decrement')}>Decrement</button>
    </div>
  `,

  // CSS styles
  styles: css`
    .counter {
      padding: 15px;
      background-color: #f0f0f0;
      border-radius: 4px;
    }

    button {
      margin-right: 5px;
      padding: 5px 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `,

  // Component properties
  properties: {
    count: {
      default: 0,
      reflect: true // Reflect to attribute
    }
  },

  // Component methods
  methods: {
    increment() {
      this.count++;
      this.update();
    },

    decrement() {
      this.count--;
      this.update();
    },

    // Lifecycle hooks
    init() {
      console.log('Component initialized');
    },

    connected() {
      console.log('Component connected to DOM');
    },

    disconnected() {
      console.log('Component disconnected from DOM');
    },

    propertyChanged(name, oldValue, newValue) {
      console.log(`Property ${name} changed from ${oldValue} to ${newValue}`);
    }
  }
});
```

### Component with Shadow DOM

```javascript
define('shadow-dom-component', {
  template: html`
    <div class="container">
      <h3>Shadow DOM Component</h3>
      <p>This component uses Shadow DOM for style encapsulation.</p>
      <button ${html.event('click', 'handleClick')}>Click me</button>
    </div>
  `,

  styles: css`
    .container {
      padding: 15px;
      background-color: #e6f7ff;
      border: 1px solid #91d5ff;
    }
  `,

  methods: {
    handleClick() {
      alert('Button clicked!');
    }
  }
});
```

## API Reference

### Native HTML Components API

#### `register(tagName, urlOrOptions)`

Registers a new custom element from an HTML file or options object.

- `tagName` (string): The tag name for the custom element
- `urlOrOptions` (string|object): URL to an HTML file or configuration options

```javascript
// Register from HTML file
register('my-counter', './components/my-counter.html');

// Register from options object
register('my-counter', { template, style, script });
```

#### HTML Component File Structure

```html
<template>
  <!-- HTML template goes here -->
</template>

<style>
  /* CSS styles go here */
</style>

<script>
  // Export component configuration
  exportDefault({
    // Component configuration
    useShadow: true, // Optional: only needed if you want Shadow DOM (Light DOM is default)
    properties: { /* ... */ },
    methods: { /* ... */ },

    // Lifecycle hooks
    init() { /* ... */ },
    connected() { /* ... */ },
    disconnected() { /* ... */ }
  });
</script>
```

### JavaScript API

#### `define(tagName, options)`

Defines a new custom element.

- `tagName` (string): The tag name for the custom element
- `options` (object): Configuration options for the component
  - `template` (string|function): HTML template for the component
  - `styles` (string): CSS styles for the component
  - `useShadow` (boolean): Whether to use Shadow DOM (default: false)
  - `observedAttributes` (array): Attributes to observe for changes
  - `properties` (object): Component properties with configuration
  - `methods` (object): Methods to add to the component

#### `html` Template Tag

Creates an HTML template string with interpolation.

```javascript
html`<div>${'propertyName'}</div>`
```

#### `html.event(eventName, handlerName)`

Creates an event binding for use in templates.

```javascript
html`<button ${html.event('click', 'handleClick')}>Click me</button>`
```

#### `css` Template Tag

Creates a CSS string from template literals.

```javascript
css`
  .container {
    color: ${themeColor};
  }
`
```

## Lifecycle Hooks

- `init()`: Called when the component is initialized
- `connected()`: Called when the component is connected to the DOM
- `disconnected()`: Called when the component is disconnected from the DOM
- `propertyChanged(name, oldValue, newValue)`: Called when a property changes
- `attributeChanged(name, oldValue, newValue)`: Called when an observed attribute changes

## Core Helper Methods

The library provides built-in helper methods that work with both Shadow DOM and Light DOM:

- `getElement(selector)`: Queries a single element using the provided selector
- `getAllElements(selector)`: Queries all elements matching the provided selector

Example usage:
```javascript
// Works with both Shadow DOM and Light DOM
const button = this.getElement('#my-button');
const items = this.getAllElements('.item');
```

## License

Wrapped Web Components (WWC) is released under the MIT License.

---

**Start building with WWC today!** Check out the [demo](https://abbychau.github.io/wrapped-web-components/) for more examples and documentation.
