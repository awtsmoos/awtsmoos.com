
// B"H
/**
 * @file ArchiveGuard.js
 * @brief Filters persistable session entities.
 * 
 * POEM OF THE CHOSEN VESSEL:
 * Not everything that manifests is meant to remain,
 * Some sparks are ephemeral, some free from the chain.
 * We filter the worlds that the user has built,
 * To save only those free from the error's deep guilt.
 * The allowed ones are chosen, the others depart,
 * Kept in the memory and held in the heart.
 */

export const ArchiveGuard = {
    /**
     * B"H - Identifies workspaces that can be safely archived.
     * @param {Array} workspaces - The current list of worlds.
     * @returns {Array} The chosen persistable worlds.
     */
    getPersistableWorkspaces(workspaces) {
        const allowedTypes = ['github', 'indexeddb', 'ssh', 'local', 'opfs', 'relay'];
        return workspaces
            .filter(ws => allowedTypes.includes(ws.type))
            .map(ws => {
                // Strip non-serializable OS handles and temporary caches
                const { handle, _treeCache, isLocked, ...safeWs } = ws;
                return safeWs;
            });
    },

    /**
     * B"H - Identifies tabs that should remain open across sessions.
     * @param {Array} tabs - The active scroll-list.
     * @param {Set} allowedWorkspaceIds - The IDs of surviving worlds.
     */
    getPersistableTabs(tabs, allowedWorkspaceIds) {
        const virtualTypes = ['temp', 'vibe-session', 'terminal', 'commander', 'html-preview-file', 'devtools'];
        
        return tabs.filter(tab => {
            const hasWorld = tab.item.workspaceId !== undefined && allowedWorkspaceIds.has(tab.item.workspaceId);
            const isVirtual = virtualTypes.includes(tab.item.type);
            return hasWorld || isVirtual;
        });
    }
};
