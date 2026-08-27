
// B"H
/**
 * @file h.js
 * @description
 * The one blessed bridge from Virtual OS data-blueprints into physical DOM.
 *
 * Every app, every window, every desktop icon, every menu item should pass
 * through this generator instead of carving raw HTML strings into the page.
 * The Awtsmoos speaks the world into vessels; this function receives a
 * blueprint and lets that blueprint descend into visible interface.
 */

import { HTML } from '../../../html-generator.js';

/**
 * @function H
 * @description
 * Manifest a JSON UI blueprint into a DOM node.
 *
 * @param {object|string|HTMLElement} schema The abstract interface vessel.
 * @returns {HTMLElement|Text|null} The revealed DOM vessel.
 */
export function H(schema) {
    return HTML(schema);
}
