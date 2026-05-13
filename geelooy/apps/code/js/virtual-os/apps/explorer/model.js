
// B"H
/**
 * @file model.js
 * @description
 * File Explorer provider model.
 */

import { FileSystemProvider } from '../../../fs-provider.js';
import { normalizePath, joinPath } from '../../utils/path.js';

/**
 * @function makeItem
 * @param {object} env Environment.
 * @param {string} path Path.
 * @param {string} kind Kind.
 * @returns {object} Provider item.
 */
export function makeItem(env, path, kind = 'directory') {
    return {
        ...env.workspace,
        type: env.workspaceType,
        originalType: env.workspace.originalType || env.workspace.type,
        workspaceId: env.workspace.id,
        path: normalizePath(path),
        kind
    };
}

/**
 * @function healExplorerPayload
 * @param {object} windowState Window state.
 * @param {object} env Environment.
 * @returns {object} Payload.
 */
export function healExplorerPayload(windowState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = normalizePath(payload.cwd || env.tab?.item?.path || '/');
    windowState.payload = payload;
    return payload;
}

/**
 * @async
 * @function listExplorerEntries
 * @param {object} env Environment.
 * @param {string} cwd Directory path.
 * @returns {Promise<object[]>} Entries.
 */
export async function listExplorerEntries(env, cwd) {
    const result = await FileSystemProvider.list(makeItem(env, cwd, 'directory'));
    const entries = Array.isArray(result) ? result : (result.entries || []);

    return entries.map((entry) => ({
        ...entry,
        name: entry.name || entry.path?.split('/').filter(Boolean).pop() || 'Untitled',
        kind: entry.kind || entry.type || 'file',
        path: normalizePath(entry.path || joinPath(cwd, entry.name || 'Untitled'))
    }));
}
