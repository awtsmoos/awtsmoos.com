
// B"H
/**
 * @file IntentRecognizer.js
 * @brief Identifies the functional perspective of a tab.
 */
export const IntentRecognizer = {
    getIntent(item) {
        if (!item) return 'editor';
        const type = (item.type || item.fileType || 'file').toLowerCase();
        
        if (type === 'vibe-session' || type === 'vibe') return 'vibe';
        if (item.isPreview || type === 'html-preview' || type === 'html-preview-file') return 'preview';
        if (type === 'terminal') return 'terminal';
        if (type === 'commander' || type === 'file-commander') return 'commander';
        if (type === 'devtools') return 'devtools';
        if (type === 'browser') return 'browser';
        if (type === 'zip-entry') return 'zip-entry';
        
        return 'editor';
    }
};
