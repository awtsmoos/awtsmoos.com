
// B"H
// FILE: js/terminal/shell.js

import { TerminalCommands } from './commands.js';
import { TerminalCompleter } from './completer.js';
import { State } from '../state.js';

/**
 * @class TerminalShell
 * @description The Merkava (Chariot) for user intent. 
 * Re-forged to handle the holy cycling of Tab completion.
 * As the Awtsmoos presents multiple paths to rectification, 
 * this shell allows the user to cycle through those matches.
 */
export class TerminalShell {
    constructor(tab, container) {
        this.tab = tab;
        this.container = container;
        this.state = tab.terminalState || {};
        
        if (!this.state.cwd) {
            this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        }
        
        if (!this.state.output) this.state.output = [];
        if (!this.state.history) this.state.history = [];
        
        this.cmdHistory = this.state.history;
        this.historyIndex = this.cmdHistory.length;

        // B"H - Completion State Vessels
        this.lastMatches = [];
        this.matchIndex = -1;
        this.originalInputBeforeTab = "";
    }

    get cwd() { return this.state.cwd; }
    set cwd(val) { 
        this.state.cwd = val; 
        this.renderPrompt(); 
        const name = val.kind === 'root' ? 'Terminal' : `Term: ${val.name}`;
        this.tab.item.name = name;
        this.tab.item.path = val.path;
    }

    init() {
        this.renderStructure();
        this.restoreOutput();
        this.renderPrompt();
        this.bindEvents();
        this.focus();
        
        if (this.state.output.length === 0) {
            this.print(`B"H`, "cmd-info");
            this.print(`Awtsmoos Deep-Shell v4.5\nReality is speech. Press [Tab] to cycle completions.`, "cmd-info");
        }
    }

    renderStructure() {
        this.container.innerHTML = `
            <div id="terminal-wrapper">
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

    renderPrompt() {
        const ws = State.workspaces.find(w => w.id === this.cwd.workspaceId);
        this.dirEl.textContent = this.cwd.kind === 'root' ? "Workspaces" : `${ws?.name || '?'}:${this.cwd.path}`;
    }

    bindEvents() {
        this.container.onclick = () => this.inputEl.focus();
        this.inputEl.onkeydown = async (e) => {
            if (e.key === 'Enter') {
                const cmd = this.inputEl.value.trim();
                this.inputEl.value = '';
                this.matchIndex = -1; // Reset completion cycle
                if (cmd) {
                    this.cmdHistory.push(cmd);
                    this.historyIndex = this.cmdHistory.length;
                    await this.execute(cmd);
                } else this.printPromptLine("");
            } else if (e.key === 'Tab') {
                e.preventDefault();
                await this._handleTab();
            } else if (e.key === 'ArrowUp' && this.historyIndex > 0) {
                this.inputEl.value = this.cmdHistory[--this.historyIndex];
            } else if (e.key === 'ArrowDown') {
                this.inputEl.value = this.historyIndex < this.cmdHistory.length - 1 ? this.cmdHistory[++this.historyIndex] : "";
            } else {
                // Any other key clears the completion cycle
                this.matchIndex = -1;
            }
        };
    }

    /**
     * @async
     * @method _handleTab
     * @description B"H. The ritual of Cycling Tab Completion.
     * If multiple potential completions exist, pressing Tab repeatedly
     * cycles through them, replacing the current partial word with each match.
     */
    async _handleTab() {
        const currentVal = this.inputEl.value;
        if (!currentVal && this.matchIndex === -1) return;

        // If we are already in a completion cycle, just move to the next match
        if (this.matchIndex !== -1 && this.lastMatches.length > 0) {
            this.matchIndex = (this.matchIndex + 1) % this.lastMatches.length;
            this._applyCompletion(this.lastMatches[this.matchIndex]);
            return;
        }

        // B"H - Start a new completion search
        this.originalInputBeforeTab = currentVal;
        const matches = await TerminalCompleter.getMatches(this, currentVal);

        if (matches && matches.length > 0) {
            this.lastMatches = matches;
            this.matchIndex = 0;
            this._applyCompletion(matches[0]);
            
            // If there's only one, we don't need a cycle, but it doesn't hurt.
            // If there are many, we might want to log them to the user (Linux style)?
            // For now, silent cycling is smoother for browser UI.
        }
    }

    /**
     * @method _applyCompletion
     * @description B"H. Physically updates the input field with the chosen completion.
     */
    _applyCompletion(match) {
        const parts = this.originalInputBeforeTab.split(' ');
        parts[parts.length - 1] = match;
        this.inputEl.value = parts.join(' ');
    }

    focus() { setTimeout(() => this.inputEl.focus(), 10); }

    printPromptLine(cmd) {
        const path = this.dirEl.textContent;
        this.state.output.push({ type: 'block', path, cmd });
        this.appendHistoryBlock(path, cmd);
    }

    appendHistoryBlock(path, cmd) {
        const div = document.createElement('div');
        div.className = 'terminal-history-block';
        div.innerHTML = `<div class="terminal-history-header"><span class="terminal-history-path">${path}</span> <span class="terminal-prompt-char">$</span> <span class="terminal-history-cmd">${cmd}</span></div>`;
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    print(text, className = '') {
        this.state.output.push({ type: 'line', text, className });
        this.appendLine(text, className);
    }
    
    appendLine(text, className) {
        const div = document.createElement('div');
        div.className = `terminal-line ${className}`;
        div.innerHTML = text; 
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    clearScreen() { this.state.output = []; this.outputEl.innerHTML = ''; }

    async execute(input) {
        this.printPromptLine(input);
        if (input.startsWith('#')) return;

        let cmdStr = input, redirect = null;
        if (input.includes(' > ')) {
            const p = input.split(' > ');
            cmdStr = p[0].trim(); redirect = p[1].trim().replace(/^"|"$/g, '');
        }
        
        const args = this.parseArgs(cmdStr);
        const cmd = args.shift();

        if (TerminalCommands[cmd]) {
            try {
                const res = await TerminalCommands[cmd](this, args);
                if (res !== null && res !== undefined) {
                    if (redirect) await this.writeToFile(redirect, res);
                    else this.print(res);
                }
            } catch (e) { 
                this.print(`Error: ${e.message}`, 'cmd-error'); 
            }
        } else this.print(`Command not found: ${cmd}`, 'cmd-error');
    }

    async writeToFile(name, content) {
        try {
            const { FileSystemProvider } = await import('../fs-provider.js');
            let item;
            try { item = await this.resolveItem(name); }
            catch(e) { await FileSystemProvider.create(this.cwd, name, 'file'); item = await this.resolveItem(name); }
            await FileSystemProvider.write(item, content);
            this.print(`Written to ${name}`, 'cmd-success');
        } catch(e) { this.print(`Write Error: ${e.message}`, 'cmd-error'); }
    }

    async resolveItem(path) {
        if (!path || path === '.') return this.cwd;
        if (this.cwd.kind === 'root') {
            const ws = State.workspaces.find(w => w.name === path);
            if (ws) return { ...ws, path: '/', kind: 'directory', workspaceId: ws.id, type: ws.type };
            throw new Error(`Workspace '${path}' not found.`);
        }
        let final = path.startsWith('/') ? path : (this.cwd.path === '/' ? '' : this.cwd.path) + '/' + path;
        if (final.length > 1 && final.endsWith('/')) final = final.slice(0, -1);
        return { ...this.cwd, path: final, name: final.split('/').pop() || 'Root', kind: 'directory' };
    }

    parseArgs(input) {
        const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
        const args = [];
        let m;
        while (m = regex.exec(input)) args.push(m[1] || m[2] || m[0]);
        return args;
    }
}
