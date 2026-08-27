
// B"H
/**
 * @file ui.js
 * @description
 * Terminal DOM painter.
 */

import { State } from '../state.js';
import { escapeTerminalText, terminalOutputToText } from './utils/outputSanitizer.js';

export class TerminalUI {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.outputEl = null;
        this.inputEl = null;
        this.dirEl = null;
    }

    renderStructure() {
        this.container.replaceChildren();

        const root = document.createElement('div');
        root.className = 'terminal-shell';

        this.outputEl = document.createElement('div');
        this.outputEl.className = 'terminal-output';

        this.dirEl = document.createElement('div');
        this.dirEl.className = 'terminal-directory-line';

        const row = document.createElement('div');
        row.className = 'terminal-input-row';

        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = '$';

        this.inputEl = document.createElement('input');
        this.inputEl.className = 'terminal-input';
        this.inputEl.setAttribute('autocomplete', 'off');
        this.inputEl.setAttribute('spellcheck', 'false');

        row.append(prompt, this.inputEl);
        root.append(this.outputEl, this.dirEl, row);
        this.container.appendChild(root);
    }

    restoreOutput() {
        this.outputEl.replaceChildren();

        for (const item of this.state.output) {
            if (item.type === 'block') this.appendHistoryBlock(item.path, item.cmd);
            else this.appendLine(item.text, item.className);
        }
    }

    renderPrompt(cwd) {
        if (!this.dirEl) return;

        const ws = State.workspaces.find((w) => String(w.id) === String(cwd.workspaceId));
        this.dirEl.textContent = cwd.kind === 'root'
            ? 'Workspaces'
            : `${ws?.name || cwd.name || 'Workspace'}:${cwd.path || '/'}`;
    }

    appendHistoryBlock(path, cmd) {
        const div = document.createElement('div');
        div.className = 'terminal-history-block';

        const pathEl = document.createElement('span');
        pathEl.className = 'terminal-history-path';
        pathEl.textContent = path;

        const dollar = document.createElement('span');
        dollar.className = 'terminal-history-dollar';
        dollar.textContent = '$';

        const command = document.createElement('span');
        command.className = 'terminal-history-command';
        command.textContent = cmd;

        div.append(pathEl, dollar, command);
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    appendLine(text, className = '') {
        const div = document.createElement('div');
        div.className = `terminal-line ${className || ''}`;
        div.innerHTML = escapeTerminalText(terminalOutputToText(text));

        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    clearScreen() {
        if (this.outputEl) this.outputEl.replaceChildren();
    }

    focus() {
        setTimeout(() => this.inputEl?.focus(), 10);
    }

    scrollToBottom() {
        if (this.outputEl) this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
}
