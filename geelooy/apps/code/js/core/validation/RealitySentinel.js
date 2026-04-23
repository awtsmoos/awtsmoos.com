
// B"H
/**
 * @file RealitySentinel.js
 * @brief THE WATCHMAN OF THE PHYSICAL DOMAIN.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export const RealitySentinel = {
    /**
     * @async
     * @function verify
     * @description Probes the workspace to see if an item still exists.
     */
    async verify(item) {
        if (!item || !item.path) return false;
        if (item.kind === 'root' || item.path === '/') return true;

        try {
            const worldId = item.workspaceId || item.id;
            const ws = State.workspaces.find(w => String(w?.id) === String(worldId));
            if (!ws) return false;

            const fullContext = { ...ws, ...item, workspaceId: ws.id };

            if (item.kind === 'directory') {
                const res = await FileSystemProvider.list(fullContext);
                return !!res;
            } else {
                // For files, we check if they can be read.
                const res = await FileSystemProvider.read(fullContext);
                return res !== null && res !== undefined;
            }
        } catch (e) {
            return false;
        }
    }
};
