
// B"H
// FILE: js/terminal/commands.js

import { FilesystemCommands } from './commands/filesystem.js';
import { ArchiveCommands } from './commands/archive.js';
import { GitCommands } from './commands/git.js';
import { NodeCommands } from './commands/node-cmd.js';
import { NPMCommands } from './commands/npm-cmd.js';
import { NetworkCommands } from './commands/network-cmd.js';
import { SimulatedCommands } from './commands/simulated.js';
import { DetailedHelp } from './help-text.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Tabs } from '../tabs/index.js';

function isSshShell(shell) {
    const type = shell?.cwd?.type || shell?.cwd?.originalType;
    return String(type || '').toLowerCase() === 'ssh';
}

function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function renderSshExecResult(result) {
    if (result === undefined || result === null) return '';

    if (typeof result === 'string') return result;

    const parts = [];
    const stdout = result.stdout ?? result.out ?? result.output ?? result.data;
    const stderr = result.stderr ?? result.err;
    const code = result.code ?? result.exitCode ?? result.status;

    if (stdout !== undefined && stdout !== null && String(stdout) !== '') parts.push(String(stdout));
    if (stderr !== undefined && stderr !== null && String(stderr) !== '') parts.push(String(stderr));
    if (code !== undefined && code !== null && Number(code) !== 0) parts.push(`[exit ${code}]`);

    if (parts.length) return parts.join('\n');
    return JSON.stringify(result, null, 2);
}

export const TerminalCommands = {
    ...FilesystemCommands,
    ...ArchiveCommands,
    ...GitCommands,
    ...NodeCommands,
    ...NPMCommands,
    ...NetworkCommands,
    ...SimulatedCommands,

    async exec(shell, args) {
        if (!isSshShell(shell)) {
            throw new Error('exec is only available inside an SSH workspace terminal.');
        }

        const command = args.join(' ').trim();
        if (!command) throw new Error('exec: missing remote command');

        const result = await FileSystemProvider.SSH.execute(shell.cwd, command, {
            env: shell.state.env || {}
        });

        return renderSshExecResult(result);
    },

    async cat(shell, args) {
        if (!args[0]) throw new Error('cat: missing operand');
        const item = await shell.resolveItem(args[0]);
        const content = await FileSystemProvider.read(item);
        return content instanceof Blob ? await content.text() : String(content);
    },

    async echo(shell, args) {
        return args.join(' ');
    },

    async pwd(shell) {
        return shell.cwd.path || '/';
    },

    async date() {
        return new Date().toString();
    },

    async whoami(shell) {
        if (isSshShell(shell)) return shell.cwd.name || 'ssh';
        return 'awtsmoos-root';
    },

    async uptime() {
        const up = performance.now() / 1000;
        return `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${Math.floor(up % 60)}s`;
    },

    async history(shell) {
        return shell.cmdHistory.map((c, i) => `${i + 1} ${c}`).join('\n');
    },

    async open(shell, args) {
        const item = await shell.resolveItem(args[0] || '.');

        if (item.kind === 'directory') {
            const { FileCommander } = await import('../file-commander/index.js');
            FileCommander.open(item);
        } else {
            Tabs.create(item);
        }

        return `Opening ${item.name}`;
    },

    async clear(shell) {
        shell.clearScreen();
        return null;
    },

    async help(shell, args) {
        const cmd = args[0];
        if (cmd && DetailedHelp.commands[cmd]) return DetailedHelp.commands[cmd];
        if (cmd === 'exec') {
            return [
                'exec <remote command>',
                '',
                'Runs one real command on the SSH device from the current terminal directory.',
                'Examples:',
                '  exec pwd',
                '  exec ls -la',
                '  exec ./BH.sh'
            ].join('\n');
        }
        if (cmd) return `help: no entry for '${cmd}'`;
        return DetailedHelp.getGeneralHelp();
    },

    async stat(shell, args) {
        const item = await shell.resolveItem(args[0] || '.');
        return `File: ${item.name}\nPath: ${item.path}\nKind: ${item.kind}\nType: ${item.type}`;
    }
};
