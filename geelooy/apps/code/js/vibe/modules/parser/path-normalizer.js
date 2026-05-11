
// B"H
/**
 * @file path-normalizer.js
 * @brief THE ALIGNMENT OF THE COORDINATES.
 * 
 * CHAPTER VII: THE ANCHOR OF ABSOLUTE TRUTH
 * "Make straight the path." In a world of many workspaces, 
 * we strictly anchor all AI intent to the active Vibe session's root.
 */

import { State } from '../../../state.js';
import { VesselSanitizer } from './VesselSanitizer.js';

export const PathNormalizer = {
    /**
     * B"H - Normalizes AI paths to the session root.
     */
    normalize(rootPath, AI_Path) {
        if (!AI_Path) return rootPath;
        
        const cleanAI = (AI_Path || "").replace(/\\/g, '/');
        
        // 1. OS ABSOLUTE CHECK
        const isAbsoluteOSPath = /^[a-zA-Z]:\//.test(cleanAI) || cleanAI.startsWith('//');

        if (isAbsoluteOSPath) {
            for (const ws of State.workspaces) {
                if (ws.type === 'relay' && ws.basePath) {
                    const cleanBase = ws.basePath.replace(/\\/g, '/').replace(/\/+$/, "");
                    if (cleanAI.startsWith(cleanBase)) {
                        let relPart = cleanAI.substring(cleanBase.length);
                        return ('/' + relPart.replace(/^\/+/, '')).replace(/\/+/g, '/');
                    }
                }
                const wsName = ws.name || "";
                if (wsName && cleanAI.includes(`/${wsName}/`)) {
                    const parts = cleanAI.split(`/${wsName}/`);
                    return ('/' + parts[1].replace(/^\/+/, '')).replace(/\/+/g, '/');
                }
            }
        }

        // 2. SESSION RELATIVE RECTIFICATION
        const sessRoot = (rootPath || "/").replace(/\\/g, '/').replace(/\/+$/, "");
        const subPath = cleanAI.replace(/^\/+/, '');
        
        if (sessRoot === "/") return '/' + subPath;

        const rootSegs = sessRoot.split('/').filter(Boolean);
        const aiSegs = subPath.split('/').filter(Boolean);
        
        let overlapIndex = -1;
        for (let i = 0; i < aiSegs.length; i++) {
            if (aiSegs[i] === rootSegs[rootSegs.length - 1]) {
                overlapIndex = i;
                break;
            }
        }

        let final;
        if (overlapIndex !== -1) {
            final = sessRoot + '/' + aiSegs.slice(overlapIndex + 1).join('/');
        } else {
            final = sessRoot + '/' + subPath;
        }

        return final.replace(/\/+/g, '/');
    }
};
