/**
 * CSS utility for creating component styles
 */

/**
 * Creates a CSS string from template literals
 * @param {Array<string>} strings - The template string parts
 * @param {...*} values - The values to interpolate
 * @returns {string} - The processed CSS string
 */
export function css(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] || '';
    return result + string + value;
  }, '');
}
