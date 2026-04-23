
// B"H
/**
 * @file TabIdentity.js
 * @brief The True Name of the Observer's Window.
 */

export const TabIdentity = {
    getUniquePath(item) {
        if (!item) return `null-tab-vessel-${Date.now()}`;
        
        const worldId = item.workspaceId ?? item.id ?? 'global';
        const coordinate = item.path || '/';
        
        // Canonicalize the intent. If it is meant to be a vibe session, 
        // it must forever be distinct from the source code view!
        const currentType = item.type || item.fileType || 'file';
        
        // This strips variables and finds the rock solid path
        const baseSeal = `world[${worldId}]::coord[${coordinate}]`;

        if (currentType === 'vibe-session' || item.fileType === 'vibe') return `vibe::${baseSeal}`;
        if (currentType === 'terminal') return `term::${baseSeal}`;
        if (currentType === 'commander' || currentType === 'file-commander') return `cmd::${baseSeal}`;
        if (currentType === 'devtools') return `devtools::${item.previewTabId}`;
        if (currentType === 'html-preview-file' || item.isPreview) return `preview::${baseSeal}`;

        return `file::${baseSeal}`;
    }
};
