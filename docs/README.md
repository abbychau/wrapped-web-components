# Wrapped Web Components Documentation

This directory contains the documentation and examples for the Wrapped Web Components library, which are hosted on GitHub Pages.

## Local Development

To test the documentation locally, you can use the following npm commands:

### View Documentation

```bash
npm run docs
```

This will start a local server and open the documentation in your browser.

### Develop Documentation with Live Library Updates

```bash
npm run docs:dev
```

This will start both the library development server (with watch mode) and the documentation server, allowing you to see changes to the library reflected in the documentation.

### Update Documentation with Latest Build

```bash
npm run docs:update
```

This will build the library and copy the latest build files to the docs/dist directory, which is used when viewing the documentation locally.

## Structure

- `index.html` - Main documentation page
- `examples.html` - Native HTML examples
- `js-api-example.html` - JavaScript API examples
- `components/` - Component HTML files used in examples
- `assets/` - Images and other assets
- `dist/` - Local copy of the library for development (not committed to git)

## GitHub Pages

The documentation is automatically served from this directory via GitHub Pages. When pushing changes to the main branch, the documentation will be updated on the GitHub Pages site.
