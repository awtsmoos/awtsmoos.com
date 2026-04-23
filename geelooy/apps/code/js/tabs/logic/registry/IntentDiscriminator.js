
// B"H
/**
 * @file IntentDiscriminator.js
 * @brief THE SEPARATOR OF PERSPECTIVES.
 */

export const IntentDiscriminator = {
    /**
     * @function determine
     * @description Identifies the specific spiritual intent of a tab request.
     */
    determine(item) {
        const type = (item.type || item.fileType || 'file').toLowerCase();
        
        if (type === 'vibe-session' || type === 'vibe') return 'INTENT_VIBE';
        if (item.isPreview || type === 'html-preview' || type === 'html-preview-file') return 'INTENT_PREVIEW';
        if (type === 'terminal') return 'INTENT_TERMINAL';
        if (type === 'commander' || type === 'file-commander') return 'INTENT_COMMANDER';
        if (type === 'devtools') return 'INTENT_DEVTOOLS';
        
        return 'INTENT_EDITOR';
    }
};
