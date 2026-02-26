
// B"H
/**
 * @file ui.js
 * @brief The Physical Architect of the Terminal.
 * This class is responsible for all direct DOM manipulation, creating the
 * structure and rendering the output, keeping the shell logic pure.
 */

import { State } from '../state.js';

export class TerminalUI {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.outputEl = null;
        this.inputEl = null;
        this.dirEl = null;
    }

    renderStructure() {
        this.container.innerHTML = `
            <div class="terminal-instance-wrapper">
                <div class="terminal-output"></div>
                <div class="terminal-input-area">
                    <div class="terminal-directory-line"></div>
                    <div class="terminal-input-row">
                        <span class="terminal-prompt-char">$</span>
                        <input type="text" class="terminal-input" spellcheck="false" autocomplete="off">
                    </div>
                </div>
            </div>`;
        this.outputEl = this.container.querySelector('.terminal-output');
        this.inputEl = this.container.querySelector('.terminal-input');
        this.dirEl = this.container.querySelector('.terminal-directory-line');
    }

    restoreOutput() {
        this.outputEl.innerHTML = '';
        this.state.output.forEach(item => {
            if (item.type === 'block') this.appendHistoryBlock(item.path, item.cmd);
            else this.appendLine(item.text, item.className);
        });
    }

    renderPrompt(cwd) {
        if (!this.dirEl) return;
        const ws = State.workspaces.find(w => w.id === cwd.workspaceId);
        this.dirEl.textContent = cwd.kind === 'root' ? "Workspaces" : `${ws?.name || '?'}:${cwd.path}`;
    }

    appendHistoryBlock(path, cmd) {
        const div = document.createElement('div');
        div.className = 'terminal-history-block';
        div.innerHTML = `
            <div class="terminal-history-header">
                <span class="terminal-history-path">${path}</span>
                <span class="terminal-prompt-char">$</span>
                <span class="terminal-history-cmd">${cmd}</span>
            </div>`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }
    
    appendLine(text, className) {
        const div = document.createElement('div');
        div.className = `terminal-line ${className || ''}`;
        div.innerHTML = text;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    }

    clearScreen() {
        if (this.outputEl) this.outputEl.innerHTML = '';
    }

    focus() {
        setTimeout(() => this.inputEl?.focus(), 10);
    }
    
    scrollToBottom() {
        if (this.outputEl) {
            this.outputEl.scrollTop = this.outputEl.scrollHeight;
        }
    }
}
