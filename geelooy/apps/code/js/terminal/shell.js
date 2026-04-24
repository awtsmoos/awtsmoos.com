
// B"H
/**
 * @file shell.js
 * @brief The Merkava (Chariot) of the Terminal.
 */

import { State } from '../state.js';
import { TerminalUI } from './ui.js';
import { TerminalInputHandler } from './input-handler.js';
import { TerminalExecutor } from './executor.js';

export class TerminalShell {
    constructor(tab, container) {
        this.tab = tab;
        this.container = container;
        this.state = tab.terminalState || {};
        
        // B"H - Context Validation
        if (!this.state.cwd) this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        if (!this.state.output) this.state.output = [];
        if (!this.state.history) this.state.history = [];
        if (!this.state.env) this.state.env = {};
        
        this.ui = new TerminalUI(container, this.state);
        this.executor = new TerminalExecutor(this);
    }

    get cwd() { return this.state.cwd; }
    set cwd(val) { 
        this.state.cwd = val; 
        this.ui.renderPrompt(this.cwd); 
        const name = val.kind === 'root' ? 'Terminal' : `Term: ${val.name}`;
        this.tab.item.name = name;
        this.tab.item.path = val.path;
    }
    
    get cmdHistory() { return this.state.history; }

    async init() {
        this.ui.renderStructure();
        
        // B"H - CRITICAL SYNC: Bind prompt to the incoming state
        this.ui.renderPrompt(this.cwd);
        
        this.inputHandler = new TerminalInputHandler(this.ui.inputEl, this);
        this.inputHandler.bindEvents();

        this.ui.restoreOutput();
        this.ui.focus();
        
        if (this.state.output.length === 0) {
            this.print(`B"H`, "cmd-info");
            this.print(`Awtsmoos Shell v5.0\nAnchored to: ${this.cwd.name}`, "cmd-info");
        }
    }

    print(text, className = '') {
        this.state.output.push({ type: 'line', text, className });
        this.ui.appendLine(text, className);
    }
    
    printPromptLine(cmd) {
        const path = this.ui.dirEl.textContent;
        this.state.output.push({ type: 'block', path, cmd });
        this.ui.appendHistoryBlock(path, cmd);
    }

    clearScreen() { 
        this.state.output = []; 
        this.ui.clearScreen(); 
    }

    async execute(input) {
        this.printPromptLine(input);
        await this.executor.execute(input);
    }
    
    async resolveItem(path) {
        // Use shell's current spatial awareness to find files
        if (!path || path === '.') return this.cwd;
        
        if (path.startsWith('/')) {
            const parts = path.split('/').filter(Boolean);
            const wsName = parts.shift();
            const ws = State.workspaces.find(w => w.name === wsName);
            if (!ws) throw new Error(`Workspace not found: ${wsName}`);
            const remaining = '/' + parts.join('/');
            return { ...ws, path: remaining, kind: 'directory', workspaceId: ws.id };
        }
        
        const base = (this.cwd.path === '/' ? '' : this.cwd.path);
        const final = (base + '/' + path.replace(/^\.\//, '')).replace(/\/+/g, '/');
        return { ...this.cwd, path: final, kind: 'directory' };
    }
}
