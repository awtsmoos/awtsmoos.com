
// B"H
/**
 * @file runner.js
 * @description
 * Runs terminal commands and transmutes HTML-shaped output into readable text.
 */

import { FileSystemExecutor } from '../../../vibe/agent/executors/FileSystemExecutor.js';
import { htmlToPlainText } from '../../lib/html.js';

export async function runTerminalCommand(command, payload, env) {
    payload.lines.push(`${payload.cwd} $ ${command}`);

    const resolvePath = (pathLike = '.') => {
        const root = env.workspace.path === '/' ? '' : env.workspace.path;
        const cwd = payload.cwd === '/' ? '' : payload.cwd;
        const raw = String(pathLike);

        if (raw === '.') return `${root}${cwd}` || '/';
        if (raw.startsWith('/')) return `${root}${raw}`;
        return `${root}${cwd}/${raw}`.replace(/\/+/g, '/');
    };

    const output = await FileSystemExecutor.execute(
        'run_terminal_command',
        { command, cwd: payload.cwd },
        env.workspace,
        env.workspaceType,
        resolvePath,
        null,
        null
    );

    payload.lines.push(htmlToPlainText(output));
    payload.lines = payload.lines.slice(-160);
}
