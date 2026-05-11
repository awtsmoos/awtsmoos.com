
// B"H
/**
 * @file IntentIsolation.js
 * @brief The Discerner of Tab Perspectives.
 */

export const IntentIsolation = {
    /**
     * @function identify
     * @description Strips the veil to see what the user actually wants to manifest.
     */
    identify(item) {
        const type = (item.type || item.fileType || 'file').toLowerCase();
        
        if (type === 'vibe-session' || type === 'vibe') return 'vibe';
        if (item.isPreview || type === 'html-preview' || type === 'html-preview-file') return 'preview';
        if (type === 'terminal') return 'terminal';
        if (type === 'commander') return 'commander';
        if (type === 'devtools') return 'devtools';
        if (type === 'browser') return 'browser';
        
        return 'editor';
    }
};
