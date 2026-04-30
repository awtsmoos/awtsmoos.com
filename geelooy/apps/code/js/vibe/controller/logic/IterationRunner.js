
// B"H
/**
 * @file IterationRunner.js
 * @brief The Engine of AI Iteration and Manifestation.
 * 
 * CHAPTER XXX: THE DIALOGUE OF CREATION
 * This module is the heart of the Vibe's intelligence. It gathers the 
 * "Ohr" (Light/Context) from the codebase, prepares the "Kelim" (Vessels/Prompts), 
 * and initiates the stream of Divine Speech from the AI Oracle.
 * 
 * It manages:
 * 1. API Key verification.
 * 2. Codebase context construction.
 * 3. History compression (Tzimtzum) to save tokens.
 * 4. Real-time streaming and physical solidification via StreamHandler.
 */

import { ModelManager } from '../../model-manager.js';
import { VibeAPI } from '../../api-client.js';
import { PromptBuilder } from '../../modules/prompt-builder.js';
import { ContextBuilder } from '../../modules/context-builder.js';
import { StreamHandler } from './StreamHandler.js';
import { HistoryCompressor } from '../../modules/history/index.js';
import { UI } from '../../../ui.js';
import { VibeDB } from '../../db.js';

export const IterationRunner = {
    /**
     * B"H
     * Executes a single round of interaction with the AI model.
     * 
     * @param {Object} tab - The Vibe session tab.
     * @param {Object} controller - The Vibe controller for UI updates.
     * @param {string|null} promptOverride - Optional manual prompt.
     */
    async run(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;

        const apiKey = ModelManager.getKey();
        if (!apiKey) {
            UI.showToast("B\"H - API Key missing. Please visit the Dashboard.", "error");
            return;
        }

        // 1. BEGINNING: Set processing state
        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        try {
            // 2. CONTEXT: Build the Markdown representation of the current codebase
            const markdownContext = await ContextBuilder.build(tab);
            
            // 3. PREPARATION: Compress history to remove bloated old code blocks
            const compressedHistory = HistoryCompressor.compress([...tab.vibeSession.history]);
            
            // 4. ASSEMBLY: Construct the full message array for the API
            const apiHistory = [
                { role: 'system', content: PromptBuilder.getSystem(markdownContext) },
                ...compressedHistory
            ];

            if (promptOverride) {
                apiHistory.push({ role: 'user', content: promptOverride });
            }

            // 5. VISION: Add a streaming placeholder message to the UI history
            tab.vibeSession.history.push({ 
                role: 'model', 
                content: '', 
                isStreaming: true 
            });
            controller.refreshView(tab);

            let fullBuffer = "";

            // 6. EMANATION: Initiate the stream
            await VibeAPI.streamChat(
                apiHistory, 
                apiKey, 
                ModelManager.currentModel,
                // On Each Chunk
                async (chunk) => {
                    fullBuffer += chunk;
                    // Pass the buffer to the StreamHandler to check for complete XML blocks to write to disk
                    await StreamHandler.processChunk(chunk, fullBuffer, tab, null, controller);
                },
                // On Completion
                async (finalText) => {
                    console.log(`%cB"H [IterationRunner] Stream Ended. Finalizing vessels...`, "color: #a8ff00; font-weight: bold;");
                    
                    // Solidify any remaining blocks that were missed during streaming
                    await StreamHandler.finalize(finalText, tab);

                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    lastMsg.isStreaming = false;
                    lastMsg.content = finalText;
                    tab.vibeSession.isProcessing = false;

                    // Anchor the updated history in memory
                    await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
                    
                    // Final UI Sync
                    controller.refreshView(tab);
                    await controller.refreshTree(tab);
                    
                    UI.showToast(`B"H - Iteration manifestation complete.`, "success");
                },
                // On Error
                (err) => {
                    console.error("[IterationRunner] B\"H - Oracle Error:", err);
                    
                    // Handle rate limits by suggesting model rotation
                    if (err.status === 429) {
                        UI.showToast("B\"H - Model is exhausted (429). Attempting rotation...", "warning");
                        ModelManager.rotateModel();
                    } else {
                        UI.showToast(`B"H - Dimensional Divergence: ${err.message}`, "error");
                    }

                    tab.vibeSession.isProcessing = false;
                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    if (lastMsg && lastMsg.isStreaming) {
                        lastMsg.content += `\n\n[B"H Error: ${err.message}]`;
                        lastMsg.isStreaming = false;
                    }
                    controller.refreshView(tab);
                }
            );

        } catch (e) {
            console.error("[IterationRunner] B\"H - Logic Shattered:", e);
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
            UI.showToast(`B"H - The logic engine shattered: ${e.message}`, "error");
        }
    }
};
