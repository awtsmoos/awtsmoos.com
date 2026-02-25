
// B"H
// FILE: js/terminal/commands.js

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { FileCommander } from '../file-commander.js';

export const TerminalCommands = {
    // --- NAVIGATION ---
    async ls(shell, args) {
        const target = await shell.resolveItem(args[0] || '.');
        if (target.kind === 'root') {
            return State.workspaces.map(ws => `<div class="ls-entry is-dir">${ws.name}/</div>`).join('');
        }
        const res = await FileSystemProvider.list(target);
        const entries = Array.isArray(res) ? res : (res.entries || []);
        entries.sort((a,b) => a.kind === b.kind ? a.name.localeCompare(b.name) : (a.kind === 'directory' ? -1 : 1));
        return entries.map(e => {
            const cls = e.kind === 'directory' ? 'is-dir' : 'is-file';
            return `<div class="ls-entry ${cls}">${e.name}${e.kind === 'directory' ? '/' : ''}</div>`;
        }).join('');
    },

    async cd(shell, args) {
        const path = args[0];
        if (!path || path === '/') { shell.cwd = { kind: 'root', name: 'Workspaces', path: '/' }; return; }
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
        await FileSystemProvider.list(target);
        shell.cwd = target;
    },

    // --- MANIPULATION ---
    async mkdir(shell, args) {
        for (const n of args) await FileSystemProvider.create(shell.cwd, n, 'directory');
        return '';
    },
    async touch(shell, args) {
        for (const n of args) await FileSystemProvider.create(shell.cwd, n, 'file');
        return '';
    },
    async rm(shell, args) {
        for (const p of args) {
            const item = await shell.resolveItem(p);
            await FileSystemProvider.delete(item);
        }
        return '';
    },

    // --- CONTENT & ADVANCED ---
    async cat(shell, args) {
        const item = await shell.resolveItem(args[0]);
        const content = await FileSystemProvider.read(item);
        return (content instanceof Blob) ? await content.text() : String(content);
    },

    async dd(shell, args) {
        // Advanced read at offset: dd if=file skip=10 count=20
        const p = {}; args.forEach(a => { const [k,v]=a.split('='); p[k]=v; });
        if(!p.if) throw new Error("dd: missing 'if'");
        const item = await shell.resolveItem(p.if);
        const raw = await FileSystemProvider.read(item);
        const txt = (raw instanceof Blob) ? await raw.text() : String(raw);
        return txt.substring(parseInt(p.skip)||0, (parseInt(p.skip)||0) + (parseInt(p.count)||txt.length));
    },

    async stat(shell, args) {
        const item = await shell.resolveItem(args[0]);
        return `File: ${item.name}\nPath: ${item.path}\nKind: ${item.kind}\nType: ${item.type}`;
    },

    async echo(shell, args) { return args.join(' '); },
    async pwd(shell) { return shell.cwd.path || '/'; },
    async whoami() { return "awtsmoos-root"; },
    async clear(shell) { shell.clearScreen(); return null; },
    async help() { return `B"H Deep-System: ls, cd, pwd, mkdir, touch, rm, cp, mv, cat, stat, dd, echo, clear`; }
};
