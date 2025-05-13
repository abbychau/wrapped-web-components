/**
 * Examples of using Wrapped Web Components
 */

import { register } from '../dist/index.esm.js';

// Register components from HTML files
register('my-counter', './components/my-counter.html');
register('light-dom-component', './components/light-dom-component.html');
register('todo-list', './components/todo-list.html');

// JavaScript API example is imported directly in js-api-example.html
