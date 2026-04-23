
// B"H
/**
 * @file StreamHandler.js
 * @brief Captures the raw AI stream, detects completed XML blocks, and passes them to the Loop Engine.
 */

import { ResponseParser } from '../../modules/ResponseParser.js';
import { LoopEngine } from '../../modules/LoopEngine.js';
import { UI } from '../../../ui.js';

export const StreamHandler = {
    /**
     * B"H
     * Processes live tokens to extract fully formed change directives.
     */
    async processChunk(chunk, streamBuffer, tab, processedPaths) {
        streamBuffer += chunk;
        const markerE = ResponseParser.END_MARKER;
        const tagE = "</" + "chan" + "ge>";
        let hebrewIdx = streamBuffer.indexOf(markerE);
        
        while (hebrewIdx !== -1) {
            let xmlEndIdx = streamBuffer.indexOf(tagE, hebrewIdx);
            if (xmlEndIdx !== -1) {
                const blockTotalEnd = xmlEndIdx + tagE.length;
                const completeBlock = streamBuffer.substring(0, blockTotalEnd);
                const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
                const detectedChanges = ResponseParser.parseChanges(completeBlock, sessionRoot);
                
                for (const change of detectedChanges) {
                    if (change.operation === 'branch') {
                        const bName = change.content.trim();
                        UI.showToast(`B"H - AI initiated Branch: ${bName}`, "info");
                        const { BranchManager } = await import('../../../workspaces/branching.js');
                        await BranchManager.switchBranch(tab.item.workspaceId, bName);
                        continue;
                    }
                    
                    if (!processedPaths.has(change.path)) {
                        processedPaths.add(change.path);
                        await LoopEngine.apply([change], tab.item.workspaceId, tab.vibeSession.id);
                    }
                }
                streamBuffer = streamBuffer.substring(blockTotalEnd);
                hebrewIdx = streamBuffer.indexOf(markerE);
            } else break;
        }
        return streamBuffer;
    },

    /**
     * B"H
     * Gathers any remaining fragments that were missed during the stream.
     */
    async finalize(finalText, tab, processedPaths) {
        const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
        const allFinal = ResponseParser.parseChanges(finalText, sessionRoot);
        const missed = allFinal.filter(c => !processedPaths.has(c.path) && c.operation !== 'branch');
        
        for (const m of missed) await LoopEngine.apply([m], tab.item.workspaceId, tab.vibeSession.id);
    }
};
