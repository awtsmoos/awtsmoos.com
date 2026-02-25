
// B"H
// FILE: js/terminal/index.js

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { TerminalShell } from './shell.js';

export const Terminal = {
    // Open a new Terminal Tab
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
                output: []
            }
        };
        
        Tabs.create(item, false, false, true);
    },

    // B"H - Updated render to handle persisted shell state
    render(tab, container) {
        // Hydrate state from tab.content if it was restored from session
        if (!tab.terminalState && tab.content) {
            tab.terminalState = tab.content;
        }

        if (!tab.terminalState) {
            tab.terminalState = {
                cwd: { kind: 'root', name: 'Workspaces', path: '/' },
                history: [],
                output: []
            };
        }

        const shell = new TerminalShell(tab, container);
        shell.init();
    }
};
