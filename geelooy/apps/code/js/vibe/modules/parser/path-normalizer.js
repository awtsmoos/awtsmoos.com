
/**
 * B"H
 * 
 * CHAPTER VII: THE ANCHOR OF ABSOLUTE TRUTH (RECONSTRUCTED)
 * 
 * "A man's heart plans his way, but the Lord directs his steps."
 * In the realm of development, the AI Oracle sometimes speaks with a 
 * "Full Path"—the heavy OS coordinate of the earthly realm.
 * If we do not account for this, the manifestation is misaligned, 
 * creating fragmented paths that lead to the Void.
 * 
 * This module has been perfected to:
 * 1. Recognize Absolute Scribes: It detects Windows drive letters (C:/) 
 *    and absolute Unix roots.
 * 2. Cross-Reference the Workspaces: It searches the State's active worlds 
 *    to find a matching "Base Path" or project name.
 * 3. Purify the Coordinate: It strips the earthly prefix, leaving only 
 *    the pure relative path within the chosen workspace.
 * 4. Maintain Seder: It keeps the existing overlap logic for relative 
 *    pathing as a secondary fallback.
 * 
 * @module PathNormalizer
 */

import { State } from '../../../state.js';
import { VesselSanitizer } from './VesselSanitizer.js';

export const PathNormalizer = {
    /**
     * B"H
     * Resolves the AI's provided path into a perfect physical coordinate 
     * relative to the project root.
     * 
     * @param {string} rootPath - The virtual root of the current Vibe session.
     * @param {string} AI_Path - The path exactly as uttered by the model.
     * @returns {string} The Manifested Absolute Path (Virtual).
     */
    normalize(rootPath, AI_Path) {
        const cleanAI = (AI_Path || "").replace(/\\/g, '/');
        
        // 1. THE RECOGNITION OF THE OS ANCHOR
        // Does it start with a drive letter (C:/) or a root slash?
        const isAbsoluteOSPath = /^[a-zA-Z]:\//.test(cleanAI) || cleanAI.startsWith('/');

        if (isAbsoluteOSPath) {
            // Attempt to find which Workspace this OS path belongs to
            for (const ws of State.workspaces) {
                // Scenario A: Relay Workspace (Uses explicit basePath)
                if (ws.type === 'relay' && ws.basePath) {
                    const cleanBase = ws.basePath.replace(/\\/g, '/').replace(/\/+$/, "");
                    if (cleanAI.startsWith(cleanBase)) {
                        let relativePart = cleanAI.substring(cleanBase.length);
                        return ('/' + relativePart.replace(/^\/+/, '')).replace(/\/+/g, '/');
                    }
                }
                
                // Scenario B: Local Workspace (Check project name)
                const wsName = ws.name || "";
                if (wsName && cleanAI.includes(`/${wsName}/`)) {
                    const parts = cleanAI.split(`/${wsName}/`);
                    return ('/' + parts[1].replace(/^\/+/, '')).replace(/\/+/g, '/');
                }
            }
        }

        // 2. THE RECTIFICATION OF RELATIVE OVERLAP (Existing Logic)
        // If it's relative, we use the overlap ritual to join it with the session root.
        const cleanRoot = (rootPath || "/").replace(/\\/g, '/').replace(/\/+$/, "");
        const rawAISegs = cleanAI.split('/').filter(p => p && p !== 'undefined');

        const aiSegs = rawAISegs.map(seg => VesselSanitizer.purify(seg)).filter(Boolean);
        const rootSegs = cleanRoot.split('/').filter(p => p && p !== 'undefined');

        if (rootSegs.length === 0) {
            // If the session root is just '/', we simply return the AI path as absolute.
            // B"H - We strip drive letters here if they survived the check above.
            const firstSeg = aiSegs[0] || "";
            if (firstSeg.length === 2 && firstSeg.endsWith(':')) {
                aiSegs.shift(); // Remove 'C:' if it leaked through
            }
            return '/' + aiSegs.join('/');
        }

        let aiStartIndex = 0;
        let foundOverlap = false;

        // Search for where the root path and AI path unite.
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
