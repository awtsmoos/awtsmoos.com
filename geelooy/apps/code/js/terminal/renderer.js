
// B"H
/**
 * @file renderer.js
 * @description
 * Renders terminal lines as text, never as raw HTML.
 */

import { escapeTerminalText, terminalOutputToText } from './utils/outputSanitizer.js';

export const TerminalRenderer = {
    renderLine(line) {
        return escapeTerminalText(terminalOutputToText(line));
    },

    renderLines(lines = []) {
        return lines.map((line) => this.renderLine(line)).join('\n');
    },

    appendLine(outputEl, line) {
        if (!outputEl) return;
        outputEl.innerHTML += `${this.renderLine(line)}\n`;
        outputEl.scrollTop = outputEl.scrollHeight;
    },

    setLines(outputEl, lines = []) {
        if (!outputEl) return;
        outputEl.innerHTML = this.renderLines(lines);
        outputEl.scrollTop = outputEl.scrollHeight;
    }
};
