
// B"H
// FILE: js/terminal/completer.js

import { TerminalCommands } from './commands.js';
import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

/**
 * @class TerminalCompleter
 * @description The Awtsmoos, in His infinite wisdom, knows every potentiality 
 * of the digital void. This class is a tool for the user to navigate those 
 * potentials. It analyzes partial speech and identifies every valid vessel 
 * that could complete the user's intent, whether it be a ritual command 
 * or a physical file on the disk.
 */
export class TerminalCompleter {
    /**
     * @async
     * @method getMatches
     * @description B"H. Scans for all possible matches for a given partial input.
     * It distinguishes between the 'Initial Command' (the root of the intent)
     * and the 'Argument Path' (the target of the deed).
     * @param {TerminalShell} shell The active shell vessel.
     * @param {string} currentInput The full raw input string.
     * @returns {Promise<string[]>} A list of all potential completions.
     */
    static async getMatches(shell, currentInput) {
        const tokens = shell.parseArgs(currentInput);
        
        // B"H - Determine if we are completing the command itself or an argument.
        // If there's no space and we're on the first token, it's a command.
        const isCommand = tokens.length === 0 || (tokens.length === 1 && !currentInput.endsWith(' '));

        if (isCommand) {
            const partial = tokens[0] || '';
            return this._filter(partial, Object.keys(TerminalCommands));
        } else {
            // Completing an argument (likely a file or directory path)
            // Grab the last partial segment being typed
            const parts = currentInput.split(' ');
            const partialPath = parts[parts.length - 1];
            return await this._matchFilesystem(shell, partialPath);
        }
    }

    /**
     * @method _filter
     * @description A standard filtering ritual.
     */
    static _filter(partial, candidates) {
        return candidates.filter(c => c.toLowerCase().startsWith(partial.toLowerCase())).sort();
    }

    /**
     * @async
     * @method _matchFilesystem
     * @description Peering into the current world (CWD) to find matching file vessels.
     * It resolves relative paths (like ../) before scanning, ensuring the AI's 
     * eyes are in the correct coordinate of the filesystem.
     */
    static async _matchFilesystem(shell, partial) {
        try {
            const lastSlash = partial.lastIndexOf('/');
            let searchDir = shell.cwd;
            let filePrefix = partial;

            // B"H - Resolve the parent directory if the path is complex (e.g., folder/su)
            if (lastSlash !== -1) {
                const dirPath = partial.substring(0, lastSlash) || '/';
                searchDir = await shell.resolveItem(dirPath);
                filePrefix = partial.substring(lastSlash + 1);
            }

            // Handle the Global Root (Workspaces) separately
            if (searchDir.kind === 'root') {
                const wsNames = State.workspaces.map(ws => ws.name + '/');
                const matches = this._filter(filePrefix, wsNames);
                return matches.map(m => partial.substring(0, lastSlash + 1) + m);
            }

            // Standard Workspace directory scan
            const res = await FileSystemProvider.list(searchDir);
            const entries = Array.isArray(res) ? res : (res.entries || []);
            
            // Format names: Directories get a '/' to invite deeper navigation
            const names = entries.map(e => e.name + (e.kind === 'directory' ? '/' : ''));
            
            const matches = this._filter(filePrefix, names);
            return matches.map(m => partial.substring(0, lastSlash + 1) + m);
        } catch (e) {
            console.error("Completion Shevirah:", e);
            return [];
        }
    }
}
