
// B"H
/**
 * @file TerminalWindowHost.js
 * @description
 * Creates the exact tab-like context needed by the real terminal renderer.
 */

import { normalizePath, baseName } from '../../utils/path.js';

/**
 * @function makeTerminalCwd
 * @param {object} env Virtual OS environment.
 * @param {object} payload Window payload.
 * @returns {object} cwd object.
 */
export function makeTerminalCwd(env, payload) {
    const path = normalizePath(payload.cwdPath || payload.path || env.tab?.item?.path || '/');

    return {
        ...env.workspace,
        kind: 'directory',
        name: baseName(path),
        path,
        workspaceId: env.workspace.id,
        type: env.workspace.originalType || env.workspace.type,
        originalType: env.workspace.originalType || env.workspace.type
    };
}

/**
 * @function makeTerminalLikeTab
 * @param {object} windowState Window state.
 * @param {object} env Environment.
 * @returns {object} Tab-like object.
 */
export function makeTerminalLikeTab(windowState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.terminalState = payload.terminalState || {
        cwd: makeTerminalCwd(env, payload),
        output: [],
        history: [],
        env: {}
    };

    payload.terminalState.cwd = {
        ...makeTerminalCwd(env, payload),
        ...(payload.terminalState.cwd || {}),
        type: env.workspace.originalType || env.workspace.type,
        originalType: env.workspace.originalType || env.workspace.type,
        workspaceId: env.workspace.id
    };

    windowState.payload = payload;

    return {
        id: `virtual-terminal-${windowState.id}`,
        item: {
            id: `virtual-terminal-item-${windowState.id}`,
            name: windowState.title || 'Console',
            type: 'terminal',
            path: payload.terminalState.cwd.path,
            workspaceId: env.workspace.id,
            terminalState: payload.terminalState
        },
        terminalState: payload.terminalState
    };
}
