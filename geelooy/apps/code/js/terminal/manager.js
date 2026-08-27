
// B"H
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

export const TerminalManager = {
    /**
     * @function open
     * @description Resolves context and creates or activates a terminal tab.
     */
    open(startItem) {
        let initialCwd;
        if (startItem) {
            let path = startItem.path || '/';
            let name = startItem.name || 'Root';
            
            if (startItem.kind === 'file') {
                const lastSlash = path.lastIndexOf('/');
                path = lastSlash > 0 ? path.substring(0, lastSlash) : '/';
                name = path.split('/').pop() || 'Root';
            }

            initialCwd = { 
                name, path, 
                workspaceId: startItem.workspaceId || startItem.id, 
                type: startItem.originalType || startItem.type 
            };
        } else {
            initialCwd = { kind: 'root', name: 'Workspaces', path: '/' };
        }

        const uniquePath = `terminal::${initialCwd.workspaceId || 'global'}::${initialCwd.path}`;
        const existing = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existing) {
            Tabs.activate(existing.id);
            return;
        }

        const item = {
            name: `Term: ${name}`,
            type: "terminal",
            path: initialCwd.path,
            workspaceId: initialCwd.workspaceId,
            terminalState: { cwd: initialCwd, history: [], output: [] }
        };
        
        Tabs.create(item);
    }
};
