
// B"H
import { FileSystemExecutor } from '../../../vibe/agent/executors/FileSystemExecutor.js';
import { htmlToPlainText } from '../../lib/html.js';
import { joinPath } from '../../lib/path.js';

export async function runTerminalCommand(command, payload, env) {
    payload.lines.push(`${payload.cwd} $ ${command}`);

    const resolvePath = (pathLike = '.') => {
        if (pathLike === '.') return joinPath(env.workspace.path || '/', payload.cwd);
        if (String(pathLike).startsWith('/')) return joinPath(env.workspace.path || '/', pathLike);
        return joinPath(joinPath(env.workspace.path || '/', payload.cwd), pathLike);
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
