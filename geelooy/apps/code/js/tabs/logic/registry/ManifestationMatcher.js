
// B"H
/**
 * @file ManifestationMatcher.js
 * @brief THE DISCERNER OF INTENT.
 */

import { TripleSeal } from '../../../core/identity/TripleSeal.js';

export const ManifestationMatcher = {
    /**
     * @function getFullToken
     * @description Combines Intent (Vibe/Editor) and Seal (Path/Dim) for a 100% unique match.
     */
    getFullToken(item, forcedType = null) {
        const seal = TripleSeal.cast(item);
        const type = forcedType || item.type || item.fileType || 'file';
        
        // B"H - Determine the spiritual intent
        let intent = 'editor';
        if (type === 'vibe-session' || type === 'vibe') intent = 'vibe';
        else if (item.isPreview || type === 'html-preview') intent = 'preview';
        else if (type === 'terminal') intent = 'terminal';
        else if (type === 'commander') intent = 'commander';
        
        return `${intent}::${seal}`;
    }
};
