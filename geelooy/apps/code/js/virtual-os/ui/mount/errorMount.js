
// B"H
/**
 * @file errorMount.js
 * @description
 * Mounts app errors without string HTML.
 */

import { HTML } from '../../../html-generator.js';

/**
 * @function mountAppError
 * @param {HTMLElement} mount App mount node.
 * @param {string} title Error title.
 * @param {unknown} thrown Error object.
 * @returns {void}
 */
export function mountAppError(mount, title, thrown) {
    mount.replaceChildren(HTML({
        tag: 'div',
        className: 'vos-app-error',
        children: [
            { tag: 'div', className: 'vos-app-error-title', text: title },
            { tag: 'pre', className: 'vos-app-error-stack', text: thrown?.stack || thrown?.message || String(thrown) }
        ]
    }));
}
