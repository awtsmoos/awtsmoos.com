
// B"H
/**
 * @file renderer.js
 * @description
 * Public TerminalRenderer API expected by terminal/index.js.
 */

import { TerminalShell } from './shell.js';
import { rememberTerminalSession, forgetTerminalSession } from './sessionRegistry.js';
import { escapeTerminalText, terminalOutputToText } from './utils/outputSanitizer.js';

export const TerminalRenderer = {
    async render(tab, container) {
        if (!tab || !container) {
            throw new Error('TerminalRenderer.render requires a tab and container.');
        }

        const shell = new TerminalShell(tab, container);
        rememberTerminalSession(tab.id, shell);

        await shell.init();
        return shell;
    },

    close(tabId) {
        forgetTerminalSession(tabId);
    },

    renderLine(line) {
        return escapeTerminalText(terminalOutputToText(line));
    },

    renderLines(lines = []) {
        return lines.map((line) => this.renderLine(line)).join('\n');
    }
};
