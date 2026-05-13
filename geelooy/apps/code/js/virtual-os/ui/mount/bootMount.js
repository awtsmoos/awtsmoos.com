
// B"H
/**
 * @file bootMount.js
 * @description
 * Mounts boot diagnostics with the dynamic HTML generator.
 */

import { HTML } from '../../../html-generator.js';
import { bootBlueprint } from '../blueprints/bootBlueprint.js';

/**
 * @function mountBootScreen
 * @param {HTMLElement} container Virtual OS wrapper.
 * @param {string} message Diagnostic message.
 * @returns {void}
 */
export function mountBootScreen(container, message) {
    container.replaceChildren(HTML(bootBlueprint(message)));
}
