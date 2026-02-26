
// B"H
// FILE: js/terminal/index.js

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { TerminalShell } from './shell.js';

export const Terminal = {
    open(startItem) {
        let initialCwd;

        if (startItem && startItem.kind !== 'root') {
            let dirPath = startItem.path;
            let dirName = startItem.name;
            
            if (startItem.kind !== 'directory') {
                const lastSlash = dirPath.lastIndexOf('/');
                if (lastSlash > 0) {
                    dirPath = dirPath.substring(0, lastSlash);
                    dirName = dirPath.split('/').pop();
                } else {
                    dirPath = '/';
                    dirName = 'Root';
                }
            }

            initialCwd = {
                name: dirName,
                path: dirPath,
                kind: 'directory',
                workspaceId: startItem.workspaceId,
                type: startItem.type 
            };
        } else {
            initialCwd = { kind: 'root', name: 'Workspaces', path: '/' };
        }

        const item = {
            name: `Term: ${initialCwd.name}`,
            type: "terminal",
            kind: "file", 
            path: initialCwd.path, 
            workspaceId: initialCwd.workspaceId,
            terminalState: {
                cwd: initialCwd,
                history: [],
                output:[]
            }
        };
        
        Tabs.create(item, false, false, true);
    },

    render(tab, container) {
        if (!tab.terminalState && tab.content) {
            tab.terminalState = tab.content;
        }

        if (!tab.terminalState) {
            tab.terminalState = {
                cwd: { kind: 'root', name: 'Workspaces', path: '/' },
                history:[],
                output:[]
            };
        }

        const shell = new TerminalShell(tab, container);
        shell.init();
    },

    /**
     * B"H - The Bridge of the Background
     * Allows Node Golems to push text to their specific terminal 
     * regardless of what tab the user is currently viewing.
     */
    printToTab(tabId, text, className = '') {
        const tab = State.tabs.find(t => t.id === tabId);
        if (!tab || !tab.terminalState) return;
        
        tab.terminalState.output.push({ type: 'line', text, className });
        
        if (State.activeTabId === tabId) {
            const outputEl = document.querySelector('#terminal-wrapper .terminal-output');
            if (outputEl) {
                const div = document.createElement('div');
                div.className = `terminal-line ${className}`;
                div.textContent = text;
                outputEl.appendChild(div);
                outputEl.scrollTop = outputEl.scrollHeight;
            }
        }
    }
};
