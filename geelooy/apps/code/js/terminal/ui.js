
// B"H
/**
 * @file ui.js
 * @description
 * Terminal DOM painter.
 *
 * It creates the shell body, restores output, paints prompts, and refuses
 * to let command HTML tear holes through the page. The Awtsmoos speaks
 * through every line, but every line must enter the terminal as text.
 */

import { State } from '../state.js';
import { escapeTerminalText, terminalOutputToText } from './utils/outputSanitizer.js';

export class TerminalUI {
    /**
     * @constructor
     * @param {HTMLElement} container Terminal wrapper.
     * @param {object} state Persistent terminal state.
     */
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.outputEl = null;
        this.inputEl = null;
        this.dirEl = null;
    }

    /**
     * @function renderStructure
     * @returns {void}
     */
    renderStructure() {
        this.container.innerHTML = `
            <div class="terminal-shell">
                <div class="terminal-output"></div>
                <div class="terminal-directory-line"></div>
                <div class="terminal-input-row">
                    <span class="terminal-prompt">$</span>
                    <input class="terminal-input" autocomplete="off" spellcheck="false" />
                </div>
            </div>
        `;

        this.outputEl = this.container.querySelector('.terminal-output');
        this.inputEl = this.container.querySelector('.terminal-input');
        this.dirEl = this.container.querySelector('.terminal-directory-line');
    }

    /**
     * @function restoreOutput
     * @returns {void}
     */
    restoreOutput() {
        this.outputEl.innerHTML = '';

        for (const item of this.state.output) {
            if (item.type === 'block') this.appendHistoryBlock(item.path, item.cmd);
            else this.appendLine(item.text, item.className);
        }
    }

    /**
     * @function renderPrompt
     * @param {object} cwd Current working directory object.
     * @returns {void}
     */
    renderPrompt(cwd) {
        if (!this.dirEl) return;

        const ws = State.workspaces.find((w) => String(w.id) === String(cwd.workspaceId));
        this.dirEl.textContent = cwd.kind === 'root'
            ? 'Workspaces'
            : `${ws?.name || cwd.name || 'Workspace'}:${cwd.path || '/'}`;
    }

    /**
     * @function appendHistoryBlock
     * @param {string} path Prompt path.
     * @param {string} cmd Command text.
     * @returns {void}
     */
    appendHistoryBlock(path, cmd) {
        const div = document.createElement('div');
        div.className = 'terminal-history-block';
        div.innerHTML = `
            <span class="terminal-history-path">${escapeTerminalText(path)}</span>
            <span class="terminal-history-dollar">$</span>
            <span class="terminal-history-command">${escapeTerminalText(cmd)}</span>
        `;

        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    /**
     * @function appendLine
     * @param {unknown} text Output text.
     * @param {string} className Optional style class.
     * @returns {void}
     */
    appendLine(text, className = '') {
        const div = document.createElement('div');
        div.className = `terminal-line ${className || ''}`;
        div.innerHTML = escapeTerminalText(terminalOutputToText(text));

        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    /**
     * @function clearScreen
     * @returns {void}
     */
    clearScreen() {
        if (this.outputEl) this.outputEl.innerHTML = '';
    }

    /**
     * @function focus
     * @returns {void}
     */
    focus() {
        setTimeout(() => this.inputEl?.focus(), 10);
    }

    /**
     * @function scrollToBottom
     * @returns {void}
     */
    scrollToBottom() {
        if (this.outputEl) this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
}
