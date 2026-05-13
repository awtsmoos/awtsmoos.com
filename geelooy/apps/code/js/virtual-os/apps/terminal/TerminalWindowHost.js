
// B"H
/**
 * @file TerminalWindowHost.js
 * @description
 * Hosts the existing terminal system inside a Virtual OS window when possible.
 */

import { maybeHandleSimulatedCommand } from '../../simulated/SimulatedNodeBridge.js';

/**
 * @function makeTerminalLikeTab
 * @param {object} windowState Window state.
 * @param {object} env Environment.
 * @returns {object} Tab-like object for existing terminal renderer.
 */
export function makeTerminalLikeTab(windowState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.terminalState = payload.terminalState || {
        cwd: {
            kind: 'workspace',
            name: env.workspace.name,
            path: env.tab?.item?.path || '/',
            workspaceId: env.workspace.id
        },
        output: [],
        history: [],
        env: {}
    };

    windowState.payload = payload;

    return {
        id: `virtual-terminal-${windowState.id}`,
        item: {
            id: `virtual-terminal-item-${windowState.id}`,
            name: windowState.title || 'Console',
            type: 'terminal',
            path: env.tab?.item?.path || '/',
            workspaceId: env.workspace.id,
            terminalState: payload.terminalState
        },
        terminalState: payload.terminalState
    };
}

/**
 * @function patchSimulatedCommands
 * @param {object} shell Existing terminal shell.
 * @returns {void}
 */
export function patchSimulatedCommands(shell) {
    if (!shell || shell.__awtsmoosSimPatched) return;
    if (typeof shell.execute !== 'function') return;

    const original = shell.execute.bind(shell);

    shell.execute = async (input) => {
        const simulated = maybeHandleSimulatedCommand(input);

        if (simulated !== null) {
            shell.printPromptLine?.(input);
            shell.print?.(simulated, 'cmd-success');
            return;
        }

        return original(input);
    };

    shell.__awtsmoosSimPatched = true;
}
