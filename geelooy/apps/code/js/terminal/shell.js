
// B"H
/**
 * @file shell.js
 * @brief The Merkava (Chariot) of the Terminal.
 * This class is the central point of orchestration, holding the state
 * and delegating the holy tasks of rendering, input handling, and execution
 * to its specialized child vessels.
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
        
        // B"H - Establishing the Primordial State
        if (!this.state.cwd) this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        if (!this.state.output) this.state.output = [];
        if (!this.state.history) this.state.history = [];
        if (!this.state.env) this.state.env = {};
        
        // B"H - Initializing the Specialized Vessels (but deferring input handler)
        this.ui = new TerminalUI(container, this.state);
        this.executor = new TerminalExecutor(this);
        this.inputHandler = null; // Will be created in init
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
        // 1. Manifest the physical form
        this.ui.renderStructure();

        // 2. NOW that the input element exists, create and bind its handler
        this.inputHandler = new TerminalInputHandler(this.ui.inputEl, this);
        this.inputHandler.bindEvents();

        // 3. Continue with the rest of the initialization
        this.ui.restoreOutput();
        this.ui.renderPrompt(this.cwd);
        this.ui.focus();
        
        if (this.state.output.length === 0) {
            this.print(`B"H`, "cmd-info");
            this.print(`Awtsmoos Shell v5.0\nReality is speech. Ready.`, "cmd-info");
        }

        if (this.state.activeNodeScript) {
            this.print(`[System] Auto-restarting background process: ${this.state.activeNodeScript}`, "cmd-warn");
            await this.execute(this.state.activeNodeScript, true);
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

    async execute(input, isAutoRun = false) {
        if (!isAutoRun) {
            this.printPromptLine(input);
        }
        await this.executor.execute(input);
    }
    
    async resolveItem(path) {
        if (!path || path === '.') return this.cwd;
        
        // B"H - Absolute Path from Root Logic
        if (path.startsWith('/')) {
            const parts = path.split('/').filter(Boolean);
            if (parts.length === 0) return { kind: 'root', name: 'Workspaces', path: '/' };
            
            const wsName = parts.shift();
            const ws = State.workspaces.find(w => w.name === wsName);
            if (!ws) throw new Error(`Workspace not found: ${wsName}`);
            
            const remainingPath = '/' + parts.join('/');
            return { ...ws, path: remainingPath, name: parts[parts.length - 1] || ws.name, kind: 'directory' };
        }
        
        // B"H - Relative Path Logic
        let final = (this.cwd.path === '/' ? '' : this.cwd.path) + '/' + path.replace(/^\.\//, '');
        if (final.length > 1 && final.endsWith('/')) final = final.slice(0, -1);
        
        return { ...this.cwd, path: final, name: final.split('/').pop() || 'Root', kind: 'directory' };
    }
}
