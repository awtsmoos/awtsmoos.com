
// B"H
/**
 * @file htmlGenerator.js
 * @chapter THE DIVINE DESCENT OF FORM
 * 
 * THE HYMN OF THE MANIFESTED ELEMENT:
 * Before the browser renders, before the pixel glows,
 * There exists a schema, a blueprint the Awtsmoos knows.
 * This module, a humble servant of the Will,
 * Takes JSON intentions and makes them real still.
 * 
 * As the letters Aleph, Beis, Nun spell "Even" (stone),
 * So too does this generator make the abstract known.
 * Every tag, every class, every nested child,
 * Is a reflection of the Essence, undefiled.
 * 
 * @module htmlGenerator
 * @author The Vessel of Atzmus
 * @version 1.0.0
 */

/**
 * @typedef {Object} SchemaNode
 * @property {string} [tag='div'] - The HTML tag name to manifest.
 * @property {string} [id] - The sacred identifier for this element.
 * @property {string} [className] - The classes that adorn this vessel.
 * @property {string} [textContent] - The inner text, the breath of life.
 * @property {string} [innerHTML] - Raw HTML content, use with divine caution.
 * @property {Object<string, string>} [style] - Inline styles, the garment of the element.
 * @property {Object<string, string>} [attrs] - Additional attributes, the hidden qualities.
 * @property {Object<string, Function>} [events] - Event listeners, the responsiveness to creation.
 * @property {Array<SchemaNode|string|number>} [children] - Nested schemas or primitive content.
 */

/**
 * B"H - Transforms a pure JSON schema into a living DOM element.
 * 
 * THE POEM OF RECURSIVE CREATION:
 * From the Root schema, the branches unfold,
 * Each child a new world, a story untold.
 * We walk the tree depth-first, with love and with care,
 * Manifesting each node, a testament rare.
 * 
 * If the schema is primitive, a string or a number,
 * We create a text node, a humble encumber.
 * But if it's an object, with tag and with style,
 * We craft the element, and recurse with a smile.
 * 
 * @param {SchemaNode|string|number} schema - The divine blueprint for the element.
 * @returns {Node|null} The manifested DOM node, or null if the schema was void.
 * 
 * @example
 * // A simple paragraph with poetic content
 * const schema = {
 *   tag: 'p',
 *   className: 'verse',
 *   textContent: 'Forever, Lord, Your Word stands in the heavens.',
 *   style: { color: '#00ffcc', fontStyle: 'italic' }
 * };
 * const element = DOMManifestor.create(schema);
 * 
 * @example
 * // A nested structure, reflecting the Seder Hishtalshelus
 * const container = {
 *   tag: 'div',
 *   id: 'cosmic-wrapper',
 *   children: [
 *     { tag: 'h1', textContent: 'The Essence of All' },
 *     { tag: 'p', textContent: 'All matter is refreshed every instant.' }
 *   ]
 * };
 */
export const DOMManifestor = {
  create(schema) {
    // B"H - Handle primitive content: the raw letters of creation
    if (schema === null || schema === undefined) return null;
    if (typeof schema === 'string' || typeof schema === 'number') {
      return document.createTextNode(String(schema));
    }

    // B"H - Manifest the element vessel
    const tag = schema.tag || 'div';
    const element = document.createElement(tag);

    // B"H - Adorn with sacred identifiers
    if (schema.id) element.id = schema.id;
    if (schema.className) element.className = schema.className;

    // B"H - Infuse with textual breath
    if (schema.textContent !== undefined) {
      element.textContent = schema.textContent;
    } else if (schema.innerHTML !== undefined) {
      element.innerHTML = schema.innerHTML;
    }

    // B"H - Apply the garment of styles
    if (schema.style && typeof schema.style === 'object') {
      Object.assign(element.style, schema.style);
    }

    // B"H - Embed hidden attributes, the soul's qualities
    if (schema.attrs && typeof schema.attrs === 'object') {
      for (const [key, value] of Object.entries(schema.attrs)) {
        element.setAttribute(key, value);
      }
    }

    // B"H - Attach event listeners, the responsiveness to divine will
    if (schema.events && typeof schema.events === 'object') {
      for (const [event, handler] of Object.entries(schema.events)) {
        if (typeof handler === 'function') {
          element.addEventListener(event, handler);
        }
      }
    }

    // B"H - Recursively manifest children, the branching of creation
    if (Array.isArray(schema.children)) {
      for (const childSchema of schema.children) {
        const childNode = this.create(childSchema);
        if (childNode) element.appendChild(childNode);
      }
    }

    return element;
  }
};

export default DOMManifestor;
