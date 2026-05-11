
// B"H
/**
 * @file router.js
 * @brief Maps tab species to their physical DOM layers.
 */

export const TabRouter = {
    /**
     * @function resolveViewID
     * @description Identifies the target layer for a given tab.
     */
    resolveViewID(tab) {
        const type = tab.item.type || tab.fileType;

        const map = {
            'vibe-manager': 'vibe-manager-wrapper',
            'vibe-session': 'vibe-editor-wrapper',
            'vibe': 'vibe-editor-wrapper',
            'commander': 'file-commander-wrapper',
            'file-commander': 'file-commander-wrapper',
            'terminal': 'terminal-wrapper',
            'devtools': 'devtools-wrapper',
            'browser': 'browser-wrapper'
        };

        if (map[type]) return map[type];
        if (tab.isPreview || type === 'html-preview') return 'previewer';
        
        return 'editor-wrapper';
    }
};
