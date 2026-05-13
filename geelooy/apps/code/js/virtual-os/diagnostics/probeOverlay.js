
// B"H
/**
 * @file probeOverlay.js
 * @description
 * Optional visible diagnostic badge.
 */

import { H } from '../ui/h.js';
import { debugEnabled } from './VirtualOSLog.js';

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

    if (!debugEnabled()) {
        root.classList.add('vos-debug-off');
        return;
    }

    root.classList.remove('vos-debug-off');

    root.appendChild(H({
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
