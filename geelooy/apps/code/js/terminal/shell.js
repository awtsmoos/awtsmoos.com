
// B"H
/**
 * @file shell.js
 * @description
 * Living terminal shell with type-safe filesystem context.
 */

import { State } from '../state.js';
import { TerminalUI } from './ui.js';
import { TerminalInputHandler } from './input-handler.js';
import { TerminalExecutor } from './executor.js';

export class TerminalShell {
    constructor(tab, container) {
        this.tab = tab;
        this.container = container;
        this.state = tab.terminalState || tab.item?.terminalState || {};

        if (!this.state.cwd) this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        if (!Array.isArray(this.state.output)) this.state.output = [];
        if (!Array.isArray(this.state.history)) this.state.history = [];
        if (!this.state.env || typeof this.state.env !== 'object') this.state.env = {};

        tab.terminalState = this.state;
        if (tab.item) tab.item.terminalState = this.state;

        this.ui = new TerminalUI(container, this.state);
        this.executor = new TerminalExecutor(this);
    }

    get cwd() {
        return this.state.cwd;
    }

    set cwd(val) {
        this.state.cwd = val;
        this.ui.renderPrompt(this.cwd);

        const name = val.kind === 'root' ? 'Terminal' : `Term: ${val.name || val.path || 'Shell'}`;
        this.tab.item.name = name;
        this.tab.item.path = val.path || '/';
        this.tab.terminalState = this.state;
        this.tab.item.terminalState = this.state;
    }

    get cmdHistory() {
        return this.state.history;
    }

    async init() {
        this.ui.renderStructure();
        this.ui.renderPrompt(this.cwd);

        this.inputHandler = new TerminalInputHandler(this.ui.inputEl, this);
        this.inputHandler.bindEvents();

        this.ui.restoreOutput();
        this.ui.focus();

        if (this.state.output.length === 0) {
            this.print('B"H', 'cmd-info');
            this.print(`Awtsmoos Shell v5.0\nAnchored to: ${this.cwd.name || 'Root'}`, 'cmd-info');
        }
    }

    print(text, className = '') {
        this.state.output.push({ type: 'line', text, className });
        this.ui.appendLine(text, className);
    }

    printPromptLine(cmd) {
        const path = this.ui.dirEl?.textContent || this.cwd.path || '/';
        this.state.output.push({ type: 'block', path, cmd });
        this.ui.appendHistoryBlock(path, cmd);
        this.state.history.push(cmd);
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
        if (!path || path === '.') return this.cwd;

        if (path.startsWith('/')) {
            const exactWs = State.workspaces.find((w) => path === '/' || path.startsWith(w.path || '/'));

            if (exactWs && path !== '/') {
                return {
                    ...exactWs,
                    path,
                    name: path.split('/').filter(Boolean).pop() || exactWs.name,
                    kind: 'directory',
                    workspaceId: exactWs.id,
                    type: exactWs.originalType || exactWs.type,
                    originalType: exactWs.originalType || exactWs.type
                };
            }

            const parts = path.split('/').filter(Boolean);
            const wsName = parts.shift();
            const ws = State.workspaces.find((w) => w.name === wsName);

            if (!ws) {
                return {
                    ...this.cwd,
                    path,
                    name: path.split('/').filter(Boolean).pop() || 'Root',
                    kind: 'directory'
                };
            }

            const remaining = '/' + parts.join('/');
            return {
                ...ws,
                path: remaining,
                name: remaining.split('/').filter(Boolean).pop() || ws.name,
                kind: 'directory',
                workspaceId: ws.id,
                type: ws.originalType || ws.type,
                originalType: ws.originalType || ws.type
            };
        }

        const base = this.cwd.path === '/' ? '' : this.cwd.path;
        const final = `${base}/${path.replace(/^\.\//, '')}`.replace(/\/+/g, '/');

        return {
            ...this.cwd,
            path: final,
            name: final.split('/').filter(Boolean).pop() || this.cwd.name || 'Root',
            kind: path.includes('.') ? 'file' : 'directory',
            type: this.cwd.type || this.cwd.originalType,
            originalType: this.cwd.originalType || this.cwd.type
        };
    }

    destroy() {
        if (this.container) this.container.replaceChildren();
    }
}
