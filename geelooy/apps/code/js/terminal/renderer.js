
// B"H
/**
 * @file renderer.js
 * @description
 * Public TerminalRenderer API expected by /js/terminal/index.js.
 *
 * The earlier file accidentally became only a line-render helper. But
 * terminal/index.js calls render(tab, container) and close(tabId). This
 * file restores that contract forever while still keeping the text
 * purification helpers.
 */

import { TerminalShell } from './shell.js';
import {
    rememberTerminalSession,
    forgetTerminalSession
} from './sessionRegistry.js';
import {
    escapeTerminalText,
    terminalOutputToText
} from './utils/outputSanitizer.js';

export const TerminalRenderer = {
    /**
     * @function render
     * @param {object} tab Terminal tab.
     * @param {HTMLElement} container Terminal wrapper.
     * @returns {Promise<object>} Live shell.
     */
    async render(tab, container) {
        if (!tab || !container) {
            throw new Error('TerminalRenderer.render requires a tab and container.');
        }

        const shell = new TerminalShell(tab, container);
        rememberTerminalSession(tab.id, shell);

        await shell.init();
        return shell;
    },

    /**
     * @function close
     * @param {number|string} tabId Terminal tab id.
     * @returns {void}
     */
    close(tabId) {
        forgetTerminalSession(tabId);
    },

    /**
     * @function renderLine
     * @param {unknown} line Output line.
     * @returns {string} Safe HTML text.
     */
    renderLine(line) {
        return escapeTerminalText(terminalOutputToText(line));
    },

    /**
     * @function renderLines
     * @param {unknown[]} lines Output lines.
     * @returns {string} Safe joined HTML.
     */
    renderLines(lines = []) {
        return lines.map((line) => this.renderLine(line)).join('\n');
    }
};
