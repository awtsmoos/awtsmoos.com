
// B"H
/**
 * @file chromeMount.js
 * @description
 * Mounts the desktop chrome and returns anchors.
 */

import { H } from '../h.js';
import { chromeBlueprint } from '../blueprints/chromeBlueprint.js';
import { always } from '../../diagnostics/VirtualOSLog.js';

/**
 * @function mountChrome
 * @param {HTMLElement} container Virtual OS wrapper.
 * @returns {object} DOM anchors.
 */
export function mountChrome(container) {
    const root = H(chromeBlueprint());
    container.replaceChildren(root);

    const anchors = {
        root,
        desktop: root.querySelector('.virtual-os-desktop'),
        windows: root.querySelector('.virtual-os-windows'),
        start: root.querySelector('.virtual-os-start'),
        tasks: root.querySelector('.virtual-os-tasks'),
        menu: root.querySelector('.virtual-os-start-menu')
    };

    always('Chrome anchors', Object.fromEntries(
        Object.entries(anchors).map(([key, value]) => [key, Boolean(value)])
    ));

    return anchors;
}
