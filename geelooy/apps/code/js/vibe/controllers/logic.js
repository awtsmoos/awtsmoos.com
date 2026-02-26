
// B"H
/**
 * @file logic.js
 * @brief The Intellect of Vibe. Advanced streaming with final sweep safeguard.
 */

import { ModelManager } from '../model-manager.js';
import { VibeAPI } from '../api-client.js';
import { PromptBuilder } from '../modules/prompt-builder.js';
import { ContextBuilder } from '../modules/context-builder.js';
import { ResponseParser } from '../modules/ResponseParser.js';
import { LoopEngine } from '../modules/LoopEngine.js';

export const LogicController = {
    /**
     * @async
     * @function runIteration
     * @description Initiates AI dialogue and ensures every file is manifested exactly once.
     */
    async runIteration(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;

        let apiKey = ModelManager.getKey();
        if (!apiKey) return;

        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        // B"H - THE GUARDIAN SET: Track paths written in THIS specific stream
        const processedPaths = new Set();
        
        try {
            const markdown = await ContextBuilder.build(tab);
            const systemPrompt = PromptBuilder.getSystem(markdown);
            const history = [...tab.vibeSession.history];
            if (promptOverride) history.push({ role: 'user', content: promptOverride });

            const apiHistory = [{ role: 'system', content: systemPrompt }, ...history];
            let fullResponse = "";
            let streamBuffer = ""; 
            
            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            // Break up markers to prevent breaking this XML response
            const markerE = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";
            const tagE = "</" + "chan" + "ge>";

            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                async (chunk) => {
                    fullResponse += chunk;
                    streamBuffer += chunk;
                    
                    // 1. Real-time Manifestation Check
                    let hebrewIdx = streamBuffer.indexOf(markerE);
                    
                    while (hebrewIdx !== -1) {
                        let xmlEndIdx = streamBuffer.indexOf(tagE, hebrewIdx);
                        
                        if (xmlEndIdx !== -1) {
                            const blockTotalEnd = xmlEndIdx + tagE.length;
                            const completeBlock = streamBuffer.substring(0, blockTotalEnd);
                            
                            const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
                            const detectedChanges = ResponseParser.parseChanges(completeBlock, sessionRoot);
                            
                            for (const change of detectedChanges) {
                                if (!processedPaths.has(change.path)) {
                                    console.log(`[VibeLogic] B"H - Real-time Manifestation: ${change.path}`);
                                    processedPaths.add(change.path);
                                    await LoopEngine.apply([change], tab.item.workspaceId);
                                }
                            }
                            
                            // Slice the buffer to prevent re-parsing the same content
                            streamBuffer = streamBuffer.substring(blockTotalEnd);
                            hebrewIdx = streamBuffer.indexOf(markerE);
                        } else {
                            // Marker found but closing tag is still streaming
                            break;
                        }
                    }

                    controller.handleStreamChunk(fullResponse, tab);
                },
                async (finalText) => {
                    console.log("B\"H - Stream finished. Initiating Final Sweep Safeguard.");
                    
                    // 2. THE FINAL SWEEP
                    // We parse the ENTIRE finalText one last time to catch anything 
                    // the stream might have missed due to speed or chunking.
                    const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
                    const allFinalChanges = ResponseParser.parseChanges(finalText, sessionRoot);
                    
                    const missedChanges = allFinalChanges.filter(c => !processedPaths.has(c.path));
                    
                    if (missedChanges.length > 0) {
                        console.log(`[VibeLogic] B"H - Final Sweep found ${missedChanges.length} missed vessels.`);
                        for (const missed of missedChanges) {
                            processedPaths.add(missed.path);
                            await LoopEngine.apply([missed], tab.item.workspaceId);
                        }
                    } else {
                        console.log("B\"H - Final Sweep confirmed all vessels manifested.");
                    }

                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    lastMsg.isStreaming = false;
                    lastMsg.content = finalText;
                    
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                    await controller.refreshTree(tab);
                },
                (err) => {
                    console.error("B\"H AI Stream Error:", err);
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                }
            );
        } catch (e) {
            console.error("B\"H Logic Exception:", e);
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
        }
    }
};
