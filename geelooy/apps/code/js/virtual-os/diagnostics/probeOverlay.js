
// B"H
/**
 * @file probeOverlay.js
 * @description
 * Small visible diagnostic badge so a blank screen reveals its measurements.
 */

import { HTML } from '../../html-generator.js';

/**
 * @function mountProbeOverlay
 * @param {HTMLElement} root Virtual OS root.
 * @param {object} probe Probe data.
 * @returns {void}
 */
export function mountProbeOverlay(root, probe) {
    if (!root) return;

    const old = root.querySelector('.vos-visibility-probe');
    if (old) old.remove();

    root.appendChild(HTML({
        tag: 'div',
        className: 'vos-visibility-probe',
        children: [
            { tag: 'div', text: 'B"H VISIBILITY PROBE' },
            { tag: 'div', text: `root: ${Math.round(probe.root.width)}x${Math.round(probe.root.height)}` },
            { tag: 'div', text: `windows: ${probe.windowCount}` },
            { tag: 'div', text: `taskbar: ${Math.round(probe.taskbar.width)}x${Math.round(probe.taskbar.height)}` }
        ]
    }));
}
