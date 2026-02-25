
// B"H
// FILE: js/terminal/commands/filesystem.js
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

/**
 * @class FilesystemCommands
 * @description Argument Validation Rectification.
 * Every command now checks if the user has provided the necessary vessels
 * for the action to manifest, providing descriptive errors if they fail.
 */
export const FilesystemCommands = {
    async ls(shell, args) {
        const flags = args.filter(a => a.startsWith('-'));
        const cleanArgs = args.filter(a => !a.startsWith('-'));
        const path = cleanArgs[0] || '.';
        const target = await shell.resolveItem(path);

        if (target.kind === 'root') {
            return State.workspaces.map(ws => `<div class="ls-entry is-dir">${ws.name}/</div>`).join('');
        }

        const res = await FileSystemProvider.list(target);
        const entries = Array.isArray(res) ? res : (res.entries || []);
        entries.sort((a,b) => a.kind === b.kind ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));

        return entries.map(e => {
            const detail = flags.includes('-l') ? ` [${e.kind}]` : '';
            const cls = e.kind === 'directory' ? 'is-dir' : 'is-file';
            return `<div class="ls-entry ${cls}">${e.name}${e.kind === 'directory' ? '/' : ''}${detail}</div>`;
        }).join('');
    },

    async cd(shell, args) {
        if (args.length > 1) throw new Error("cd: too many arguments");
        const path = args[0];
        
        if (!path || path === '/') { 
            shell.cwd = { kind: 'root', name: 'Workspaces', path: '/' }; 
            return; 
        }

        if (path === '..') {
            if (shell.cwd.kind === 'root' || shell.cwd.path === '/' || shell.cwd.path === '') {
                shell.cwd = { kind: 'root', name: 'Workspaces', path: '/' };
            } else {
                const parentPath = shell.cwd.path.substring(0, shell.cwd.path.lastIndexOf('/')) || '/';
                shell.cwd = { ...shell.cwd, path: parentPath, name: parentPath.split('/').pop() || 'Root' };
            }
            return;
        }

        const target = await shell.resolveItem(path);
        if (shell.cwd.kind === 'root' && target.workspaceId) {
             shell.cwd = { ...target, path: '/', kind: 'directory' };
        } else {
            // B"H Validation: Peering into the directory to ensure it is valid
            try {
                await FileSystemProvider.list(target);
                shell.cwd = target;
            } catch (e) {
                throw new Error(`cd: ${path}: No such directory or permission denied`);
            }
        }
    },

    async mkdir(shell, args) {
        if (args.length === 0) throw new Error("mkdir: missing operand");
        if (shell.cwd.kind === 'root') throw new Error("mkdir: cannot create directory in root");
        
        for (const name of args) {
            await FileSystemProvider.create(shell.cwd, name, 'directory');
        }
        return '';
    },

    async touch(shell, args) {
        if (args.length === 0) throw new Error("touch: missing operand");
        if (shell.cwd.kind === 'root') throw new Error("touch: cannot create file in root");
        
        for (const name of args) {
            await FileSystemProvider.create(shell.cwd, name, 'file');
        }
        return '';
    },

    async rm(shell, args) {
        const paths = args.filter(a => !a.startsWith('-'));
        if (paths.length === 0) throw new Error("rm: missing operand");
        if (shell.cwd.kind === 'root') throw new Error("rm: cannot delete workspaces from shell");

        for (const p of paths) {
            try {
                const item = await shell.resolveItem(p);
                await FileSystemProvider.delete(item);
            } catch (e) {
                throw new Error(`rm: failed to remove '${p}': ${e.message}`);
            }
        }
        return '';
    }
};
