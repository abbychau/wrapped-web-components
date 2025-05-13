/**
 * Example of using the JavaScript API for defining components
 */

import { define, html, css } from '../dist/index.esm.js';

// Define a color picker component using the JavaScript API
define('color-picker', {
  // HTML template with interpolation
  template: html`
    <div class="color-picker">
      <h3>Color Picker</h3>
      <div class="color-display" id="color-display"></div>
      <div class="color-controls">
        <div class="color-slider">
          <label for="hue">Hue:</label>
          <input type="range" id="hue" min="0" max="360" value="180" ${html.event('input', 'updateColor')}/>
        </div>
        <div class="color-slider">
          <label for="saturation">Saturation:</label>
          <input type="range" id="saturation" min="0" max="100" value="50" ${html.event('input', 'updateColor')}/>
        </div>
        <div class="color-slider">
          <label for="lightness">Lightness:</label>
          <input type="range" id="lightness" min="0" max="100" value="50" ${html.event('input', 'updateColor')}/>
        </div>
      </div>
      <div class="color-value">
        <span>Current Color: </span>
        <code id="color-code">hsl(180, 50%, 50%)</code>
      </div>
    </div>
  `,

  // CSS styles
  styles: css`
    .color-picker {
      padding: 15px;
      background-color: #f8f8f8;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    .color-display {
      height: 80px;
      border-radius: 4px;
      margin-bottom: 15px;
      background-color: hsl(180, 50%, 50%);
      border: 1px solid #ddd;
    }

    .color-controls {
      margin-bottom: 15px;
    }

    .color-slider {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }

    .color-slider label {
      width: 100px;
      font-weight: bold;
    }

    .color-slider input {
      flex: 1;
    }

    .color-value {
      font-size: 14px;
      margin-top: 10px;
    }

    code {
      background-color: #eee;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
  `,

  // Component properties
  properties: {
    hue: {
      default: 180,
      reflect: true
    },
    saturation: {
      default: 50,
      reflect: true
    },
    lightness: {
      default: 50,
      reflect: true
    }
  },

  // Component methods
  methods: {
    updateColor() {
      const hueInput = this.shadowRoot.querySelector('#hue');
      const saturationInput = this.shadowRoot.querySelector('#saturation');
      const lightnessInput = this.shadowRoot.querySelector('#lightness');
      
      this.hue = parseInt(hueInput.value);
      this.saturation = parseInt(saturationInput.value);
      this.lightness = parseInt(lightnessInput.value);
      
      this.updateColorDisplay();
    },
    
    updateColorDisplay() {
      const colorDisplay = this.shadowRoot.querySelector('#color-display');
      const colorCode = this.shadowRoot.querySelector('#color-code');
      const colorValue = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
      
      colorDisplay.style.backgroundColor = colorValue;
      colorCode.textContent = colorValue;
    },

    // Lifecycle hooks
    init() {
      console.log('Color picker initialized');
    },

    connected() {
      console.log('Color picker connected to DOM');
      this.updateColorDisplay();
    },

    disconnected() {
      console.log('Color picker disconnected from DOM');
    },

    propertyChanged(name, oldValue, newValue) {
      console.log(`Property ${name} changed from ${oldValue} to ${newValue}`);
      if (['hue', 'saturation', 'lightness'].includes(name)) {
        this.updateColorDisplay();
      }
    }
  }
});
