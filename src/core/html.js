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
export function html(strings, ...values) {
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
