<div align="center">
  <img src="examples/assets/wwc-logo.svg" alt="WWC Logo" width="150">
  <h1>Wrapped Web Components (WWC)</h1>
  <p>
    <a href="https://abbychau.github.io/wrapped-web-components/">View Demo</a> •
    <a href="https://www.npmjs.com/package/wrapped-web-components">NPM Package</a>
  </p>
</div>

A lightweight JavaScript library that simplifies web component creation by allowing developers to use plain HTML, JS, and CSS instead of dealing with template.innerHTML and other low-level Web Component APIs.

**New Feature**: Now supports defining components in separate HTML files with native HTML, CSS, and JS syntax!

## Features

- 🌟 Simple API for defining custom elements
- 📝 Write components using plain HTML templates
- 📄 Define components in separate HTML files with native syntax
- 🎨 Add styles with CSS template literals
- 🔄 Automatic property-to-attribute reflection
- 🧩 Works with or without Shadow DOM
- 🔌 Event binding directly in templates
- 🔄 Lifecycle hooks for component management

## Installation

### NPM
```bash
npm install wrapped-web-components
```

### CDN
You can also use the library directly from a CDN:

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

MIT
