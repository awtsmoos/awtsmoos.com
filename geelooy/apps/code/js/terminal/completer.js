
// B"H
// FILE: js/terminal/completer.js

import { TerminalCommands } from './commands.js';
import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

/**
 * @class TerminalCompleter
 * @description The gift of Binah (Understanding). This vessel provides 
 * foresight into the user's intent, identifying potential completions 
 * for commands and paths. It is now rectified to understand the boundaries 
 * of multiple workspaces.
 */
export class TerminalCompleter {
    /**
     * @async
     * @method getMatches
     * @description B"H. Scans for potential completions in commands and files.
     */
    static async getMatches(shell, currentInput) {
        const tokens = shell.parseArgs(currentInput);
        const isCommand = tokens.length === 0 || (tokens.length === 1 && !currentInput.endsWith(' '));

        if (isCommand) {
            const partial = tokens[0] || '';
            return this._filter(partial, Object.keys(TerminalCommands));
        } else {
            const parts = currentInput.split(' ');
            const partialPath = parts[parts.length - 1];
            return await this._matchFilesystem(shell, partialPath);
        }
    }

    static _filter(partial, candidates) {
        return candidates.filter(c => c.toLowerCase().startsWith(partial.toLowerCase())).sort();
    }

    /**
     * @async
     * @method _matchFilesystem
     * @description Peering into the physical vessels of the project.
     * Rectified to support absolute paths crossing between workspaces.
     */
    static async _matchFilesystem(shell, partial) {
        try {
            // Check for cross-workspace absolute paths: /WorkspaceName/path...
            if (partial.startsWith('/')) {
                return await this._matchAbsolutePath(partial);
            }

            const lastSlash = partial.lastIndexOf('/');
            let searchDir = shell.cwd;
            let filePrefix = partial;

            if (lastSlash !== -1) {
                const dirPath = partial.substring(0, lastSlash) || '/';
                searchDir = await shell.resolveItem(dirPath);
                filePrefix = partial.substring(lastSlash + 1);
            }

            if (searchDir.kind === 'root') {
                const wsNames = State.workspaces.map(ws => ws.name + '/');
                const matches = this._filter(filePrefix, wsNames);
                return matches.map(m => partial.substring(0, lastSlash + 1) + m);
            }

            const res = await FileSystemProvider.list(searchDir);
            const entries = Array.isArray(res) ? res : (res.entries || []);
            const names = entries.map(e => e.name + (e.kind === 'directory' ? '/' : ''));
            const matches = this._filter(filePrefix, names);
            return matches.map(m => partial.substring(0, lastSlash + 1) + m);
        } catch (e) { return []; }
    }

    /**
     * @async
     * @method _matchAbsolutePath
     * @description Completes paths starting from the global root.
     */
    static async _matchAbsolutePath(path) {
        const segs = path.split('/').filter(Boolean);
        
        // Case: Completing Workspace name -> /Wo...
        if (segs.length <= 1 && !path.endsWith('/')) {
            const prefix = segs[0] || '';
            const matches = this._filter(prefix, State.workspaces.map(w => w.name));
            return matches.map(m => '/' + m + '/');
        }

        const wsName = segs.shift();
        const ws = State.workspaces.find(w => w.name === wsName);
        if (!ws) return [];

        const remainingPath = '/' + segs.join('/');
        const lastSlash = remainingPath.lastIndexOf('/');
        const dirToSearch = remainingPath.substring(0, lastSlash) || '/';
        const filePrefix = remainingPath.substring(lastSlash + 1);

        try {
            const searchItem = { ...ws, path: dirToSearch, kind: 'directory', workspaceId: ws.id, type: ws.type };
            const res = await FileSystemProvider.list(searchItem);
            const entries = Array.isArray(res) ? res : (res.entries || []);
            const matches = this._filter(filePrefix, entries.map(e => e.name + (e.kind === 'directory' ? '/' : '')));
            
            return matches.map(m => `/${wsName}${dirToSearch === '/' ? '' : dirToSearch}/${m}`);
        } catch(e) { return []; }
    }
}
