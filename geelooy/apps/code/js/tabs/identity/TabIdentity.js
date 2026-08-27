
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
        
        // Canonicalize the intent.
        const currentType = item.type || item.fileType || 'file';
        
        const baseSeal = `world[${worldId}]::coord[${coordinate}]`;

        if (currentType === 'vibe-session' || item.fileType === 'vibe') return `vibe::${baseSeal}`;
        if (currentType === 'terminal') return `term::${baseSeal}`;
        if (currentType === 'commander' || currentType === 'file-commander') return `cmd::${baseSeal}`;
        if (currentType === 'browser') return `browser::${baseSeal}`;
        if (currentType === 'devtools') return `devtools::${item.previewTabId}`;
        if (currentType === 'html-preview-file' || item.isPreview) return `preview::${baseSeal}`;

        return `file::${baseSeal}`;
    }
};
