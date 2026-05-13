
// B"H
/**
 * @file shell.js
 * @description
 * Living terminal shell.
 *
 * It owns cwd, prompt, command execution, and tab title synchronization.
 * The Awtsmoos creates a world from speech; this shell creates each
 * command-world from typed words and returns it as readable light.
 */

import { State } from '../state.js';
import { TerminalUI } from './ui.js';
import { TerminalInputHandler } from './input-handler.js';
import { TerminalExecutor } from './executor.js';

export class TerminalShell {
    /**
     * @constructor
     * @param {object} tab Terminal tab.
     * @param {HTMLElement} container Terminal mount node.
     */
    constructor(tab, container) {
        this.tab = tab;
        this.container = container;
        this.state = tab.item.terminalState || tab.terminalState || {};

        if (!this.state.cwd) this.state.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
        if (!Array.isArray(this.state.output)) this.state.output = [];
        if (!Array.isArray(this.state.history)) this.state.history = [];
        if (!this.state.env || typeof this.state.env !== 'object') this.state.env = {};

        tab.item.terminalState = this.state;
        tab.terminalState = this.state;

        this.ui = new TerminalUI(container, this.state);
        this.executor = new TerminalExecutor(this);
        this.inputHandler = null;
    }

    get cwd() {
        return this.state.cwd;
    }

    set cwd(value) {
        this.state.cwd = value;
        this.ui.renderPrompt(this.cwd);

        const name = value.kind === 'root' ? 'Terminal' : `Term: ${value.name || value.path || 'Shell'}`;
        this.tab.item.name = name;
        this.tab.item.path = value.path || '/';
    }

    get cmdHistory() {
        return this.state.history;
    }

    /**
     * @async
     * @function init
     * @returns {Promise<void>}
     */
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

    /**
     * @function print
     * @param {unknown} text Text to print.
     * @param {string} className Optional CSS class.
     * @returns {void}
     */
    print(text, className = '') {
        this.state.output.push({ type: 'line', text, className });
        this.ui.appendLine(text, className);
    }

    /**
     * @function printPromptLine
     * @param {string} cmd Command text.
     * @returns {void}
     */
    printPromptLine(cmd) {
        const path = this.ui.dirEl?.textContent || this.cwd.path || '/';
        this.state.output.push({ type: 'block', path, cmd });
        this.ui.appendHistoryBlock(path, cmd);
    }

    /**
     * @function clearScreen
     * @returns {void}
     */
    clearScreen() {
        this.state.output = [];
        this.ui.clearScreen();
    }

    /**
     * @async
     * @function execute
     * @param {string} input Raw input.
     * @returns {Promise<void>}
     */
    async execute(input) {
        this.printPromptLine(input);
        await this.executor.execute(input);
    }

    /**
     * @async
     * @function resolveItem
     * @param {string} path Path from shell.
     * @returns {Promise<object>} File-system item.
     */
    async resolveItem(path) {
        if (!path || path === '.') return this.cwd;

        if (path.startsWith('/')) {
            const parts = path.split('/').filter(Boolean);
            const wsName = parts.shift();
            const ws = State.workspaces.find((w) => w.name === wsName);

            if (!ws) throw new Error(`Workspace not found: ${wsName}`);

            return {
                ...ws,
                path: '/' + parts.join('/'),
                kind: 'directory',
                workspaceId: ws.id
            };
        }

        const base = this.cwd.path === '/' ? '' : this.cwd.path;
        const final = `${base}/${path.replace(/^\.\//, '')}`.replace(/\/+/g, '/');

        return {
            ...this.cwd,
            path: final,
            kind: 'directory'
        };
    }

    /**
     * @function destroy
     * @returns {void}
     */
    destroy() {
        if (this.container) this.container.innerHTML = '';
    }
}
