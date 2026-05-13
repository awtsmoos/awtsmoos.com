
// B"H
/**
 * @file TerminalApp.js
 * @description
 * Virtual terminal app backed by FileSystemExecutor command emulation.
 * This renderer heals old saved windows whose payload existed but lacked
 * the expected lines array, so stale localStorage can no longer shatter
 * the Virtual OS.
 */

import { FileSystemExecutor } from '../../vibe/agent/executors/FileSystemExecutor.js';

/**
 * @function healTerminalPayload
 * @param {object} windowState The window vessel.
 * @param {object} desktopState The desktop state.
 * @returns {{cwd:string,lines:string[]}} A safe terminal payload.
 */
function healTerminalPayload(windowState, desktopState) {
    const fallbackCwd = desktopState?.rootPath || '/';
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = typeof payload.cwd === 'string' && payload.cwd
        ? payload.cwd
        : fallbackCwd;

    payload.lines = Array.isArray(payload.lines)
        ? payload.lines
        : [];

    windowState.payload = payload;
    return payload;
}

/**
 * @function escapeHtml
 * @param {unknown} value Any value crossing into HTML.
 * @returns {string} Safely escaped text.
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * @function renderTerminalApp
 * @param {object} windowState The window being rendered.
 * @param {HTMLElement} container The mount node.
 * @param {object} desktopState The Virtual OS desktop state.
 * @param {object} env Workspace/render environment.
 * @returns {void}
 */
export function renderTerminalApp(windowState, container, desktopState, env) {
    const payload = healTerminalPayload(windowState, desktopState);

    container.innerHTML = `
        <div class="vos-terminal-app">
            <div class="vos-terminal-cwd">cwd: ${escapeHtml(payload.cwd)}</div>
            <pre class="vos-terminal-output">${escapeHtml(payload.lines.join('\n'))}</pre>
            <div class="vos-terminal-row">
                <input class="terminal-input" autocomplete="off" spellcheck="false" />
                <button class="terminal-run">Run</button>
            </div>
        </div>
    `;

    const input = container.querySelector('.terminal-input');
    const runBtn = container.querySelector('.terminal-run');

    const resolvePath = (pathLike = '.') => {
        const cwd = payload.cwd || '/';
        const normalized = String(pathLike).startsWith('/')
            ? String(pathLike)
            : `${cwd.replace(/\/+$/, '')}/${pathLike}`;

        const absolute = normalized.startsWith('/') ? normalized : `/${normalized}`;
        const root = env.workspace.path === '/' ? '' : env.workspace.path;

        return absolute === '/'
            ? (env.workspace.path || '/')
            : `${root}${absolute}`;
    };

    const runCommand = async () => {
        const command = input.value.trim();
        if (!command) return;

        input.value = '';
        payload.lines.push(`$ ${command}`);

        try {
            const output = await FileSystemExecutor.execute(
                'run_terminal_command',
                { command, cwd: payload.cwd },
                env.workspace,
                env.workspaceType,
                resolvePath,
                null,
                null
            );

            payload.lines.push(String(output ?? ''));
        } catch (error) {
            payload.lines.push(`Error: ${error.message || error}`);
        }

        payload.lines = payload.lines.slice(-120);
        env.requestRender();
    };

    runBtn.onclick = runCommand;
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') runCommand();
    });
}
