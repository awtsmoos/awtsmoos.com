
// B"H
/**
 * @file domProbe.js
 * @description
 * Reads physical DOM measurements when debug is enabled.
 */

import { debugEnabled, log, warn } from './VirtualOSLog.js';

/**
 * @function rectData
 * @param {Element} node DOM node.
 * @returns {object} Rect data.
 */
function rectData(node) {
    if (!node) return { exists: false };

    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);

    return {
        exists: true,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        zIndex: style.zIndex,
        position: style.position,
        overflow: style.overflow
    };
}

/**
 * @function probeVirtualOSDom
 * @param {HTMLElement} container Virtual OS wrapper.
 * @param {string} stage Stage label.
 * @returns {object} Probe result.
 */
export function probeVirtualOSDom(container, stage) {
    const root = container?.querySelector('.virtual-os-root');
    const windows = container?.querySelector('.virtual-os-windows');
    const taskbar = container?.querySelector('.virtual-os-taskbar');
    const windowNodes = [...(container?.querySelectorAll('.virtual-window') || [])];

    const result = {
        stage,
        wrapper: rectData(container),
        root: rectData(root),
        windows: rectData(windows),
        taskbar: rectData(taskbar),
        windowCount: windowNodes.length,
        windowRects: windowNodes.map(rectData)
    };

    if (debugEnabled()) log('DOM probe', result);

    if (!result.wrapper.width || !result.wrapper.height) warn('Wrapper has zero size', result.wrapper);
    if (!result.root.width || !result.root.height) warn('Root has zero size', result.root);

    return result;
}
