
// B"H
// FILE: js/terminal/shell.js

import { TerminalCommands } from './commands.js';
import { TerminalCompleter } from './completer.js';
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';

export class TerminalShell {
    constructor(tab, container) {
        this.tab = tab;
        this.container = container;
        this.state = tab.terminalState || {};
        
        if (!this.state.cwd) this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        if (!this.state.output) this.state.output =[];
        if (!this.state.history) this.state.history =[];
        if (!this.state.env) this.state.env = {}; // B"H - Env Variables
        
        this.cmdHistory = this.state.history;
        this.historyIndex = this.cmdHistory.length;
        this.lastMatches =[];
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

    async init() {
        this.renderStructure();
        this.restoreOutput();
        this.renderPrompt();
        this.bindEvents();
        this.focus();
        
        if (this.state.output.length === 0) {
            this.print(`B"H`, "cmd-info");
            this.print(`Awtsmoos Shell v5.0\nReality is speech. Ready.`, "cmd-info");
        }

        // B"H - Auto-Restart Daemonized Node Scripts
        if (this.state.activeNodeScript) {
            this.print(`[System] Auto-restarting background process: ${this.state.activeNodeScript}`, "cmd-warn");
            await this.execute(`node ${this.state.activeNodeScript}`);
        }
    }

    renderStructure() {
        this.container.innerHTML = `
            <div id="terminal-wrapper" style="height:100%; display:flex; flex-direction:column; background:#050505; color:#a8ff00; font-family:var(--font-code); padding:10px; box-sizing:border-box;">
                <div class="terminal-output" style="flex-grow:1; overflow-y:auto; word-break:break-all; white-space:pre-wrap; scrollbar-width:thin;"></div>
                <div class="terminal-input-area" style="margin-top:10px; border-top:1px solid #222; padding-top:10px;">
                    <div class="terminal-directory-line" style="color:#00f6ff; font-weight:bold; margin-bottom:5px;"></div>
                    <div style="display:flex;">
                        <span style="margin-right:10px; font-weight:bold;">$</span>
                        <input type="text" class="terminal-input" style="flex-grow:1; background:transparent; border:none; color:white; outline:none; font-family:inherit;" spellcheck="false" autocomplete="off">
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
                this.matchIndex = -1; 
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
                this.matchIndex = -1;
            }
        };
    }

    async _handleTab() {
        const currentVal = this.inputEl.value;
        if (!currentVal && this.matchIndex === -1) return;
        if (this.matchIndex !== -1 && this.lastMatches.length > 0) {
            this.matchIndex = (this.matchIndex + 1) % this.lastMatches.length;
            this._applyCompletion(this.lastMatches[this.matchIndex]);
            return;
        }
        this.originalInputBeforeTab = currentVal;
        const matches = await TerminalCompleter.getMatches(this, currentVal);
        if (matches && matches.length > 0) {
            this.lastMatches = matches;
            this.matchIndex = 0;
            this._applyCompletion(matches[0]);
        }
    }

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
        div.style.marginBottom = "5px"; div.style.borderLeft = "2px solid #333"; div.style.paddingLeft = "8px";
        div.innerHTML = `<span style="color:#00f6ff;font-size:0.85em;">${path}</span> <span style="color:#a8ff00;">$</span> <span style="color:#fff;font-weight:bold;">${cmd}</span>`;
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    print(text, className = '') {
        this.state.output.push({ type: 'line', text, className });
        this.appendLine(text, className);
    }
    
    appendLine(text, className) {
        const div = document.createElement('div');
        div.className = className;
        div.style.marginBottom = "2px";
        if (className === 'cmd-error') div.style.color = '#f75d65';
        else if (className === 'cmd-info') div.style.color = '#00f6ff';
        else if (className === 'cmd-warn') div.style.color = '#ffae57';
        div.textContent = text; 
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    clearScreen() { this.state.output =[]; this.outputEl.innerHTML = ''; }

    async execute(input) {
        this.printPromptLine(input);
        if (input.startsWith('#')) return;

        // 1. Variable Assignment / Export
        if (input.startsWith('export ')) {
            const assignment = input.substring(7).trim();
            const [k, ...rest] = assignment.split('=');
            if (k && rest.length > 0) {
                this.state.env[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
            }
            return;
        }

        // 2. Variable Substitution ($VAR)
        let substituted = input;
        for (const [k, v] of Object.entries(this.state.env)) {
            substituted = substituted.split(`$${k}`).join(v);
        }

        let cmdStr = substituted, redirect = null;
        if (substituted.includes(' > ')) {
            const p = substituted.split(' > ');
            cmdStr = p[0].trim(); redirect = p[1].trim().replace(/^"|"$/g, '');
        }
        
        const args = this.parseArgs(cmdStr);
        const cmd = args.shift();

        // 3. Script Execution (.sh or .bat)
        if (cmd && (cmd.startsWith('./') || cmd.endsWith('.sh') || cmd.endsWith('.bat'))) {
            try {
                const item = await this.resolveItem(cmd);
                const content = await FileSystemProvider.read(item);
                const text = (content instanceof Blob) ? await content.text() : String(content);
                const lines = text.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (line && !line.startsWith('#')) await this.execute(line);
                }
            } catch(e) {
                this.print(`Script Error: ${e.message}`, 'cmd-error');
            }
            return;
        }

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
        } else if (cmd) {
            this.print(`Command not found: ${cmd}`, 'cmd-error');
        }
    }

    async writeToFile(name, content) {
        try {
            let item;
            try { item = await this.resolveItem(name); }
            catch(e) { await FileSystemProvider.create(this.cwd, name, 'file'); item = await this.resolveItem(name); }
            await FileSystemProvider.write(item, content);
            this.print(`Written to ${name}`, 'cmd-success');
        } catch(e) { this.print(`Write Error: ${e.message}`, 'cmd-error'); }
    }

    async resolveItem(path) {
        if (!path || path === '.') return this.cwd;
        let final = path.startsWith('/') ? path : (this.cwd.path === '/' ? '' : this.cwd.path) + '/' + path.replace(/^\.\//, '');
        if (final.length > 1 && final.endsWith('/')) final = final.slice(0, -1);
        return { ...this.cwd, path: final, name: final.split('/').pop() || 'Root', kind: 'directory' };
    }

    parseArgs(input) {
        const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
        const args =[];
        let m;
        while (m = regex.exec(input)) args.push(m[1] || m[2] || m[0]);
        return args;
    }
}
