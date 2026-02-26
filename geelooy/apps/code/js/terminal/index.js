
// B"H
// FILE: js/terminal/index.js

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { TerminalShell } from './shell.js';

export const Terminal = {
    open(startItem) {
        let initialCwd;

        if (startItem && startItem.kind !== 'root') {
            // B"H - Strict Path Logic
            let dirPath = startItem.path;
            let dirName = startItem.name;
            
            // If it's a file, we must ascend to the parent container
            if (startItem.kind !== 'directory' && startItem.kind !== 'folder') {
                const lastSlash = dirPath.lastIndexOf('/');
                if (lastSlash > 0) {
                    dirPath = dirPath.substring(0, lastSlash);
                    // Name is the last segment of the new directory path
                    dirName = dirPath.split('/').pop();
                } else {
                    // It was a file at root level
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
            // Default to Global Root if no specific item provided
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
        
        // B"H - We pass the terminalState as 'content' so Tabs.create handles it correctly if generic logic applies,
        // but our specific fix in render() below is the ultimate safeguard.
        Tabs.create({ ...item, content: item.terminalState }, false, false, true);
    },

    render(tab, container) {
        // B"H - The Tikkun: Hydrate state from the Item if the Tab is empty.
        // This connects the intent (item.terminalState) to the reality (tab.terminalState).
        if (!tab.terminalState) {
            if (tab.content && typeof tab.content === 'object') {
                tab.terminalState = tab.content;
            } else if (tab.item && tab.item.terminalState) {
                tab.terminalState = tab.item.terminalState;
            } else {
                // Fallback to root if all else fails
                tab.terminalState = {
                    cwd: { kind: 'root', name: 'Workspaces', path: '/' },
                    history:[],
                    output:[]
                };
            }
        }

        // Clean container to prevent duplicate shells
        container.innerHTML = '';
        
        const shell = new TerminalShell(tab, container);
        shell.init();
    }
};
