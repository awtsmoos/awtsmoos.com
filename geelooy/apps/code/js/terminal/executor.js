
// B"H
/**
 * @file executor.js
 * @brief The Hand of the Terminal.
 * This class takes the user's raw input and manifests it into action,
 * parsing, substituting variables, and invoking the correct command.
 */
import { TerminalCommands } from './commands.js';
import { FileSystemProvider } from '../fs-provider.js';

export class TerminalExecutor {
    constructor(shell) {
        this.shell = shell;
    }

    async execute(input) {
        if (input.trim().startsWith('#')) return;

        // 1. Variable Assignment / Export
        if (input.startsWith('export ')) {
            const assignment = input.substring(7).trim();
            const [k, ...rest] = assignment.split('=');
            if (k && rest.length > 0) {
                this.shell.state.env[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
            }
            return;
        }

        // 2. Variable Substitution ($VAR)
        let substituted = input;
        for (const [k, v] of Object.entries(this.shell.state.env)) {
            substituted = substituted.split(`$${k}`).join(v);
        }

        let cmdStr = substituted, redirect = null;
        if (substituted.includes(' > ')) {
            const p = substituted.split(' > ');
            cmdStr = p[0].trim();
            redirect = p[1].trim().replace(/^"|"$/g, '');
        }
        
        const args = this.parseArgs(cmdStr);
        if (args.length === 0) return;
        const cmd = args.shift();

        // 3. Script Execution (.sh)
        if (cmd.endsWith('.sh') || cmd.startsWith('./')) {
            try {
                const item = await this.shell.resolveItem(cmd);
                const content = await FileSystemProvider.read(item);
                const text = (content instanceof Blob) ? await content.text() : String(content);
                const lines = text.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (line && !line.startsWith('#')) await this.execute(line);
                }
            } catch(e) {
                this.shell.print(`Script Error: ${e.message}`, 'cmd-error');
            }
            return;
        }

        // 4. Command Invocation
        if (TerminalCommands[cmd]) {
            try {
                const res = await TerminalCommands[cmd](this.shell, args);
                if (res !== null && res !== undefined) {
                    if (redirect) await this.writeToFile(redirect, res);
                    else this.shell.print(res);
                }
            } catch (e) { 
                this.shell.print(`Error: ${e.message}`, 'cmd-error'); 
            }
        } else if (cmd) {
            this.shell.print(`Command not found: ${cmd}`, 'cmd-error');
        }
    }

    async writeToFile(name, content) {
        try {
            let item;
            try { item = await this.shell.resolveItem(name); }
            catch(e) { await FileSystemProvider.create(this.shell.cwd, name, 'file'); item = await this.shell.resolveItem(name); }
            await FileSystemProvider.write(item, content);
            this.shell.print(`Written to ${name}`, 'cmd-success');
        } catch(e) { this.shell.print(`Write Error: ${e.message}`, 'cmd-error'); }
    }

    parseArgs(input) {
        const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
        const args = [];
        let m;
        while (m = regex.exec(input)) {
            args.push(m[1] || m[2] || m[0]);
        }
        return args;
    }
}
