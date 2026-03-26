
// B"H
/**
 * @file logic.js
 * @brief The Intellect of Vibe. Advanced streaming with final sweep safeguard and context minimization.
 */

import { ModelManager } from '../model-manager.js';
import { VibeAPI } from '../api-client.js';
import { PromptBuilder } from '../modules/prompt-builder.js';
import { ContextBuilder } from '../modules/context-builder.js';
import { ResponseParser } from '../modules/ResponseParser.js';
import { LoopEngine } from '../modules/LoopEngine.js';
import { HistoryCompressor } from '../modules/history/index.js'; // B"H

export const LogicController = {
    /**
     * @async
     * @function runIteration
     * @description Initiates AI dialogue, compresses history context, and ensures manifestation.
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
            // 1. Gather the Current Physical Reality
            const markdown = await ContextBuilder.build(tab);
            const systemPrompt = PromptBuilder.getSystem(markdown);
            
            // 2. Compress the History to remove redundant code blocks
            const compressedHistory = HistoryCompressor.compress([...tab.vibeSession.history]);
            if (promptOverride) compressedHistory.push({ role: 'user', content: promptOverride });

            const apiHistory = [{ role: 'system', content: systemPrompt }, ...compressedHistory];
            
            let fullResponse = "";
            let streamBuffer = ""; 
            
            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            // Break up markers to prevent breaking this XML response
            const markerE = ResponseParser.END_MARKER;
            const tagE = "</" + "chan" + "ge>";

            // 3. Initiate the Stream
            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                async (chunk) => {
                    fullResponse += chunk;
                    streamBuffer += chunk;
                    
                    // Real-time Manifestation Check
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
                            
                            streamBuffer = streamBuffer.substring(blockTotalEnd);
                            hebrewIdx = streamBuffer.indexOf(markerE);
                        } else {
                            break;
                        }
                    }

                    controller.handleStreamChunk(fullResponse, tab);
                },
                async (finalText) => {
                    console.log("B\"H - Stream finished. Initiating Final Sweep Safeguard.");
                    
                    // THE FINAL SWEEP
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
