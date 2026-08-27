
// B"H
/**
 * @file rootResolver.js
 * @description
 * Finds the actual workspace for a Virtual OS tab.
 *
 * Blank OS tabs often happen when a folder id is treated as a workspace id.
 * This resolver refuses that void: it first tries workspaceId, then matching
 * paths, then the single existing workspace, then the first workspace.
 */

import { State } from '../../state.js';

/**
 * @function resolveVirtualWorkspace
 * @param {object} tab Virtual OS tab.
 * @returns {object|null} Workspace or null.
 */
export function resolveVirtualWorkspace(tab) {
    const item = tab?.item || {};
    const workspaces = State.workspaces || [];

    const byId = workspaces.find((ws) => String(ws.id) === String(item.workspaceId));
    if (byId) return byId;

    const itemPath = String(item.path || '/');

    const byPath = workspaces.find((ws) => {
        const wsPath = String(ws.path || '/');
        return itemPath === wsPath || itemPath.startsWith(`${wsPath.replace(/\/+$/, '')}/`);
    });

    if (byPath) return byPath;

    if (workspaces.length === 1) return workspaces[0];

    return workspaces[0] || null;
}

/**
 * @function resolveVirtualRootPath
 * @param {object} tab Virtual OS tab.
 * @returns {string} Root path.
 */
export function resolveVirtualRootPath(tab) {
    const path = String(tab?.item?.path || '/').replaceAll('\\', '/');
    return path.startsWith('/') ? path : `/${path}`;
}
