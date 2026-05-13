
// B"H
/**
 * @file consoleBridge.js
 * @description
 * Lightweight console display for Virtual Browser.
 */

import { H } from '../../ui/h.js';

/**
 * @function appendConsoleLine
 * @param {HTMLElement} host Console lines host.
 * @param {string} type Log type.
 * @param {string} text Log text.
 * @returns {void}
 */
export function appendConsoleLine(host, type, text) {
    host.appendChild(H({
        tag: 'div',
        className: `vos-browser-console-line ${type || 'log'}`,
        text: `[${type || 'log'}] ${text}`
    }));

    host.scrollTop = host.scrollHeight;
}

/**
 * @function installBrowserConsoleBridge
 * @param {HTMLIFrameElement} frame Browser frame.
 * @param {HTMLElement} lines Console lines host.
 * @returns {void}
 */
export function installBrowserConsoleBridge(frame, lines) {
    appendConsoleLine(lines, 'info', 'Console bridge attached.');

    frame.addEventListener('load', () => {
        appendConsoleLine(lines, 'info', 'Frame loaded.');
    });
}
