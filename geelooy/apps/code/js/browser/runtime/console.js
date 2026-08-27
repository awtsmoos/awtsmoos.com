// B"H
/**
 * @file console.js
 * @description
 * Chapter 13: Every log became a footprint in wet cosmic clay. The Awtsmoos
 * allowed the virtual browser to remember what the little sky had spoken.
 */

import { H } from './dom.js';

/** @param {HTMLElement} lines Console lines element. @param {string} type Kind. @param {string} text Message. @returns {void} */
export function appendConsole(lines, type, text) {
    if (!lines) return;
    lines.appendChild(H({
        tag: 'div',
        className: `browser-runtime-console-line ${type || 'log'}`,
        text: `[${type || 'log'}] ${text}`
    }));
    lines.scrollTop = lines.scrollHeight;
}

/** @param {unknown} error Error-like value. @returns {string} Human text. */
export function describeError(error) {
    return error && error.message ? error.message : String(error);
}
