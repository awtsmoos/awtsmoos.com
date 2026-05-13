
// B"H
/**
 * @file chromeMount.js
 * @description
 * Mounts the desktop chrome through the dynamic HTML generator.
 */

import { HTML } from '../../html-generator.js';
import { chromeBlueprint } from './chromeBlueprint.js';
import { log } from '../diagnostics/VirtualOSLog.js';

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

    log('Chrome mounted', {
        hasRoot: Boolean(anchors.root),
        hasWindows: Boolean(anchors.windows),
        hasStart: Boolean(anchors.start),
        hasTasks: Boolean(anchors.tasks),
        hasMenu: Boolean(anchors.menu)
    });

    return anchors;
}
