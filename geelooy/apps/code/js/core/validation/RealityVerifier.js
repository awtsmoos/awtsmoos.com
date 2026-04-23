
// B"H
/**
 * @file RealityVerifier.js
 * @brief The Master Sentinel.
 */
import { PhysicalPresence } from './Presence/PhysicalPresence.js';
import { LogicalPresence } from './Presence/LogicalPresence.js';

export const RealityVerifier = {
    async verify(item) {
        if (!item || !item.path) return false;
        if (item.kind === 'root' || item.path === '/') return true;

        const ws = LogicalPresence.getWorkspace(item);
        if (!ws) return false;

        const fullContext = { ...ws, ...item, workspaceId: ws.id };
        return await PhysicalPresence.exists(fullContext);
    }
};
