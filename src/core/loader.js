/**
 * Component Loader
 * Loads and parses HTML component files
 */

/**
 * Loads a component from an HTML file
 * @param {string} url - The URL of the HTML file
 * @returns {Promise<Object>} - The parsed component
 */
export async function loadComponent(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load component from ${url}: ${response.statusText}`);
    }
    
    const html = await response.text();
    return parseComponent(html);
  } catch (error) {
    console.error(`Error loading component: ${error.message}`);
    throw error;
  }
}

/**
 * Parses a component from HTML string
 * @param {string} html - The HTML string
 * @returns {Object} - The parsed component
 */
export function parseComponent(html) {
  // Create a temporary document to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract template
  const templateElement = doc.querySelector('template');
  const template = templateElement ? templateElement.innerHTML.trim() : '';
  
  // Extract style
  const styleElement = doc.querySelector('style');
  const style = styleElement ? styleElement.textContent.trim() : '';
  
  // Extract script
  const scriptElement = doc.querySelector('script');
  let script = {};
  
  if (scriptElement) {
    try {
      // Extract the content of the script tag
      const scriptContent = scriptElement.textContent.trim();
      
      // Create a function that will evaluate the script and return the exported object
      const scriptFunction = new Function('exports', `
        const module = { exports: {} };
        const exportObj = {};
        
        // Define export default
        function exportDefault(obj) {
          Object.assign(exportObj, obj);
        }
        
        // Execute the script
        ${scriptContent}
        
        // Return the exported object
        return exportObj;
      `);
      
      // Execute the function to get the exported object
      script = scriptFunction();
    } catch (error) {
      console.error(`Error parsing script: ${error.message}`);
    }
  }
  
  // Extract attributes from the root element
  const rootElement = doc.body.firstElementChild;
  const attributes = {};
  
  if (rootElement) {
    Array.from(rootElement.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        const propName = attr.name.replace('data-', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        attributes[propName] = attr.value;
      }
    });
  }
  
  return {
    template,
    style,
    script,
    attributes
  };
}
