// B"H
/**
 * @file TerminalApp.js
 * @description Virtual terminal app backed by FileSystemExecutor command emulation.
 */

import { FileSystemExecutor } from '../../vibe/agent/executors/FileSystemExecutor.js';

export function renderTerminalApp(windowState, container, desktopState, env) {
    const payload = windowState.payload || (windowState.payload = { cwd: desktopState.rootPath, lines: [] });
    container.innerHTML = `
        <div class="app-toolbar"><span>cwd: ${payload.cwd}</span></div>
        <pre class="terminal-log">${payload.lines.join('\n')}</pre>
        <div class="terminal-input-row">
            <input class="terminal-input" value="" placeholder="ls . | cat file.js | tree ." />
            <button class="terminal-run">Run</button>
        </div>
    `;
    const input = container.querySelector('.terminal-input');
    const runBtn = container.querySelector('.terminal-run');
    const resolvePath = (pathLike) => {
        const normalized = pathLike.startsWith('/') ? pathLike : `${payload.cwd.replace(/\/+$/, '')}/${pathLike}`;
        const absolute = normalized.startsWith('/') ? normalized : `/${normalized}`;
        const root = env.workspace.path === '/' ? '' : env.workspace.path;
        return absolute === '/' ? (env.workspace.path || '/') : `${root}${absolute}`;
    };
    runBtn.onclick = async () => {
        const command = input.value.trim();
        if (!command) return;
        payload.lines.push(`$ ${command}`);
        const output = await FileSystemExecutor.execute(
            'run_terminal_command',
            { command, cwd: payload.cwd },
            env.workspace,
            env.workspaceType,
            resolvePath,
            null,
            null
        );
        payload.lines.push(String(output));
        payload.lines = payload.lines.slice(-120);
        env.requestRender();
    };
}
