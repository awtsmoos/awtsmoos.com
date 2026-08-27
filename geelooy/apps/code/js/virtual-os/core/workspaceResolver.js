
// B"H
/**
 * @file workspaceResolver.js
 * @description
 * Finds a workspace without silently returning into nothingness.
 */

import { State } from '../../state.js';
import { containsPath, normalizePath } from '../utils/path.js';
import { always, warn } from '../diagnostics/VirtualOSLog.js';

/**
 * @function resolveVirtualWorkspace
 * @param {object} tab Active Virtual OS tab.
 * @returns {object|null} Resolved workspace.
 */
export function resolveVirtualWorkspace(tab) {
    const item = tab?.item || {};
    const workspaces = Array.isArray(State.workspaces) ? State.workspaces : [];
    const itemPath = normalizePath(item.path || '/');

    always('Resolving workspace', {
        tabId: tab?.id,
        itemId: item.id,
        workspaceId: item.workspaceId,
        itemPath,
        workspaceCount: workspaces.length
    });

    const byWorkspaceId = workspaces.find((ws) => String(ws.id) === String(item.workspaceId));
    if (byWorkspaceId) return byWorkspaceId;

    const byItemId = workspaces.find((ws) => String(ws.id) === String(item.id));
    if (byItemId) return byItemId;

    const byPath = workspaces.find((ws) => containsPath(itemPath, ws.path || '/'));
    if (byPath) return byPath;

    if (workspaces.length === 1) return workspaces[0];

    if (workspaces[0]) {
        warn('Falling back to first workspace', { chosen: workspaces[0] });
        return workspaces[0];
    }

    warn('No workspace could be resolved', { item });
    return null;
}
