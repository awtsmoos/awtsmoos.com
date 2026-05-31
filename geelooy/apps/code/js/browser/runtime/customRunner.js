// B"H
/**
 * @file customRunner.js
 * @description
 * Chapter 14: The Awtsmoos opened a hidden forge. HTML entered as clay, JS
 * entered as lightning, and the iframe became a virtual browser laboratory.
 */

import { blankPage } from './address.js';
import { appendConsole, describeError } from './console.js';

/** @param {HTMLIFrameElement} frame Target frame. @param {string} html Markup. @returns {void} */
export function runCustomHtml(frame, html) {
    if (!frame) return;
    frame.removeAttribute('src');
    frame.srcdoc = String(html || blankPage());
}

/** @param {HTMLIFrameElement} frame Target frame. @param {HTMLElement} lines Console. @param {string} js Code. @returns {void} */
export function runCustomJs(frame, lines, js) {
    try {
        const win = frame?.contentWindow;
        if (!win) throw new Error('The preview frame is not reachable yet.');
        const result = win.eval(String(js || ''));
        appendConsole(lines, 'eval', result === undefined ? 'undefined' : String(result));
    } catch (error) {
        appendConsole(lines, 'error', describeError(error));
    }
}

/** @param {object} state Runtime state. @param {HTMLTextAreaElement} htmlBox HTML box. @param {HTMLTextAreaElement} jsBox JS box. @returns {void} */
export function rememberCustomCode(state, htmlBox, jsBox) {
    state.customHtml = htmlBox ? htmlBox.value : state.customHtml;
    state.customJs = jsBox ? jsBox.value : state.customJs;
}
