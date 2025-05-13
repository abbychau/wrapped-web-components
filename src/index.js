/**
 * Web Component Wrapper
 * A library that simplifies web component creation with plain HTML, JS, and CSS
 */

import { Component } from './core/component.js';
import { html } from './core/html.js';
import { css } from './core/css.js';
import { define } from './core/define.js';
import { register, getComponent, hasComponent } from './core/registry.js';
import { loadComponent, parseComponent } from './core/loader.js';

// Legacy API
export {
  Component,
  html,
  css,
  define
};

// New API for better DX
export {
  register,
  getComponent,
  hasComponent,
  loadComponent,
  parseComponent
};
