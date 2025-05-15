import { register } from 'wrapped-web-components';

// Register components from HTML files
register('my-counter', './components/my-counter.html');
register('light-dom-component', './components/light-dom-component.html');
register('todo-list', './components/todo-list.html');

// Register nested components
register('fancy-button', './components/nested/fancy-button.html');
register('nested-container', './components/nested/nested-container.html');
