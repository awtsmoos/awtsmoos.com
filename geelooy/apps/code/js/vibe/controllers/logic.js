
// B"H
/**
 * @file logic.js
 * @brief The Intellect of Vibe. Rectified for autonomous branching.
 */

import { ModelManager } from '../model-manager.js';
import { VibeAPI } from '../api-client.js';
import { PromptBuilder } from '../modules/prompt-builder.js';
import { ContextBuilder } from '../modules/context-builder.js';
import { ResponseParser } from '../modules/ResponseParser.js';
import { LoopEngine } from '../modules/LoopEngine.js';
import { HistoryCompressor } from '../modules/history/index.js';
import { UI } from '../../ui.js';

export const LogicController = {
    async runIteration(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;
        const apiKey = ModelManager.getKey();
        if (!apiKey) return;

        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        const processedPaths = new Set();
        
        try {
            const markdown = await ContextBuilder.build(tab);
            const apiHistory =[{ role: 'system', content: PromptBuilder.getSystem(markdown) }, ...HistoryCompressor.compress([...tab.vibeSession.history])];
            if (promptOverride) apiHistory.push({ role: 'user', content: promptOverride });

            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            let streamBuffer = ""; 
            let fullTextBuffer = ""; 
            const markerE = ResponseParser.END_MARKER;
            const tagE = "</" + "chan" + "ge>";

            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                async (chunk) => {
                    fullTextBuffer += chunk;
                    streamBuffer += chunk;
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
                                    const { BranchManager } = await import('../../workspaces/branching.js');
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
                    
                    controller.handleStreamChunk(fullTextBuffer, tab);
                },
                async (finalText) => {
                    const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
                    const allFinal = ResponseParser.parseChanges(finalText, sessionRoot);
                    const missed = allFinal.filter(c => !processedPaths.has(c.path) && c.operation !== 'branch');
                    
                    for (const m of missed) await LoopEngine.apply([m], tab.item.workspaceId, tab.vibeSession.id);

                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    lastMsg.isStreaming = false; lastMsg.content = finalText;
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                    await controller.refreshTree(tab);
                },
                (err) => { tab.vibeSession.isProcessing = false; controller.refreshView(tab); }
            );
        } catch (e) { tab.vibeSession.isProcessing = false; controller.refreshView(tab); }
    }
};
