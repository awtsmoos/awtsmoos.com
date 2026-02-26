
// B"H
/**
 * @file logic.js
 * @brief The Intellect of Vibe. Handles the streaming realization of code.
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
     * @description Initiates a cycle of creation with the AI model.
     */
    async runIteration(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;

        let apiKey = ModelManager.getKey();
        if (!apiKey) return;

        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        try {
            const markdown = await ContextBuilder.build(tab);
            const systemPrompt = PromptBuilder.getSystem(markdown);
            const history = [...tab.vibeSession.history];
            
            if (promptOverride) {
                history.push({ role: 'user', content: promptOverride });
            }

            const apiHistory = [{ role: 'system', content: systemPrompt }, ...history];
            let fullResponse = "";
            let processedCursor = 0;
            
            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            // B"H - Define boundary markers as concatenated strings to prevent XML breakages
            const markerE = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";
            const tagE = "</" + "chan" + "ge>";

            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                async (chunk) => {
                    fullResponse += chunk;
                    
                    // B"H - Search for the Hebrew Completion signal first
                    let hebrewEndIdx = fullResponse.indexOf(markerE, processedCursor);
                    
                    while (hebrewEndIdx !== -1) {
                        // B"H - Now verify that the XML block has actually closed
                        let xmlEndIdx = fullResponse.indexOf(tagE, hebrewEndIdx);
                        
                        if (xmlEndIdx !== -1) {
                            const blockTotalEnd = xmlEndIdx + tagE.length;
                            const completeBlockStr = fullResponse.substring(processedCursor, blockTotalEnd);
                            
                            const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
                            const manifestedChanges = ResponseParser.parseChanges(completeBlockStr, sessionRoot);
                            
                            if (manifestedChanges.length > 0) {
                                console.log(`[VibeLogic] B"H - Manifesting confirmed vessel:`, manifestedChanges[0].path);
                                await LoopEngine.apply(manifestedChanges, tab.item.workspaceId);
                            }
                            
                            // Move the pointer past the fully realized block
                            processedCursor = blockTotalEnd;
                            
                            // Check for another potential completed block in the same chunk
                            hebrewEndIdx = fullResponse.indexOf(markerE, processedCursor);
                        } else {
                            // Boundary found, but closing tag is still in the void. Wait.
                            break;
                        }
                    }

                    controller.handleStreamChunk(fullResponse, tab);
                },
                async (finalText) => {
                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    lastMsg.isStreaming = false;
                    lastMsg.content = finalText;
                    
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                    await controller.refreshTree(tab);
                },
                (err) => {
                    console.error("B\"H AI Error:", err);
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
