
// B"H
/**
 * @file FileCommanderWindowHost.js
 * @description
 * Hosts the real editor FileCommander inside a Virtual OS window.
 */

import { baseName, normalizePath } from '../../utils/path.js';

/**
 * @function makeCommanderPathItem
 * @param {object} env Virtual OS environment.
 * @param {object} payload Window payload.
 * @returns {object} File commander path item.
 */
export function makeCommanderPathItem(env, payload) {
    const path = normalizePath(payload.cwd || env.tab?.item?.path || '/');

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
 * @function makeCommanderLikeTab
 * @param {object} windowState Window state.
 * @param {object} env Virtual OS environment.
 * @returns {object} Tab-like commander object.
 */
export function makeCommanderLikeTab(windowState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.commanderState = payload.commanderState || {
        currentPathItem: makeCommanderPathItem(env, payload),
        currentFiles: [],
        loading: true
    };

    payload.commanderState.currentPathItem = {
        ...makeCommanderPathItem(env, payload),
        ...(payload.commanderState.currentPathItem || {}),
        type: env.workspace.originalType || env.workspace.type,
        originalType: env.workspace.originalType || env.workspace.type,
        workspaceId: env.workspace.id
    };

    windowState.payload = payload;

    return {
        id: `virtual-commander-${windowState.id}`,
        item: {
            id: `virtual-commander-item-${windowState.id}`,
            name: windowState.title || 'File Commander',
            type: 'commander',
            kind: 'file',
            path: payload.commanderState.currentPathItem.path,
            workspaceId: env.workspace.id
        },
        commanderState: payload.commanderState,
        content: payload.commanderState
    };
}
