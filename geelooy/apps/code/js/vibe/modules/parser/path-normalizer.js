
/**
 * B"H
 * 
 * CHAPTER VII: THE ANCHOR OF ABSOLUTE TRUTH (REFINED)
 * 
 * Path normalization ensures the conceptual intent meets the physical
 * reality of the workspace.
 */

import { VesselSanitizer } from './VesselSanitizer.js';

export const PathNormalizer = {
    /**
     * B"H
     * Resolves the AI's path into a perfect physical coordinate.
     */
    normalize(rootPath, AI_Path) {
        const cleanRoot = (rootPath || "/").replace(/\\/g, '/').replace(/\/+$/, "");
        const rawAISegs = (AI_Path || "").replace(/\\/g, '/').split('/').filter(p => p && p !== 'undefined');

        const aiSegs = rawAISegs.map(seg => VesselSanitizer.purify(seg)).filter(Boolean);
        const rootSegs = cleanRoot.split('/').filter(p => p && p !== 'undefined');

        if (rootSegs.length === 0) {
            return '/' + aiSegs.join('/');
        }

        let aiStartIndex = 0;
        let foundOverlap = false;

        for (let i = 0; i < aiSegs.length; i++) {
            if (aiSegs[i] === rootSegs[rootSegs.length - 1]) {
                foundOverlap = true;
                aiStartIndex = i + 1;
                break;
            }
        }

        let finalSegs;
        if (foundOverlap) {
            finalSegs = [...rootSegs, ...aiSegs.slice(aiStartIndex)];
        } else {
            finalSegs = [...rootSegs, ...aiSegs];
        }

        const result = '/' + finalSegs.join('/');
        return result.replace(/\/+/g, '/');
    }
};
