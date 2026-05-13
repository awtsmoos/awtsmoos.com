
// B"H
/**
 * @file chromeMount.js
 * @description
 * Mounts the desktop shell and returns its anchors.
 */

import { HTML } from '../../../html-generator.js';
import { chromeBlueprint } from '../blueprints/chromeBlueprint.js';
import { log } from '../../diagnostics/VirtualOSLog.js';

/**
 * @function mountChrome
 * @param {HTMLElement} container Virtual OS wrapper.
 * @returns {object} DOM anchors.
 */
export function mountChrome(container) {
    const root = HTML(chromeBlueprint());
    container.replaceChildren(root);

    const anchors = {
        root,
        windows: root.querySelector('.virtual-os-windows'),
        start: root.querySelector('.virtual-os-start'),
        tasks: root.querySelector('.virtual-os-tasks'),
        menu: root.querySelector('.virtual-os-start-menu')
    };

    log('Chrome anchors', {
        root: Boolean(anchors.root),
        windows: Boolean(anchors.windows),
        start: Boolean(anchors.start),
        tasks: Boolean(anchors.tasks),
        menu: Boolean(anchors.menu)
    });

    return anchors;
}
