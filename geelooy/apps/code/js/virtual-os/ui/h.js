
// B"H
/**
 * @file h.js
 * @description
 * One small bridge into the dynamic HTML generator.
 */

import { HTML } from '../../html-generator.js';

/**
 * @function H
 * @param {object} schema Generator schema.
 * @returns {HTMLElement} Generated node.
 */
export function H(schema) {
    return HTML(schema);
}
