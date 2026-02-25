
// B"H
// FILE: js/vibe/controllers/logic.js

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { VibeAPI } from '../api-client.js';
import { ModelManager } from '../model-manager.js';
import { PromptBuilder } from '../modules/prompt-builder.js';
import { ContextBuilder } from '../modules/context-builder.js';
import { ResponseParser } from '../modules/ResponseParser.js';
import { LoopEngine } from '../modules/LoopEngine.js';

/**
 * @class LogicController
 * @description The intellectual soul of Vibe Coding. It coordinates the 
 * streaming revelation from the AI, manifests the resulting rectifications, 
 * and handles the recursive optimization loops.
 */
export const LogicController = {
    /**
     * @async
     * @function runIteration
     * @description B"H. Orchestrates a single pass of the AI generation cycle.
     * @param {object} tab The active Vibe tab.
     * @param {object} controller The VibeController instance.
     * @param {string} promptOverride Optional override for the prompt (used in loops).
     */
    async runIteration(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;
        
        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        // 1. Gather Context and Build Prompt
        const markdown = await ContextBuilder.build(tab);
        const systemPrompt = PromptBuilder.getSystem(markdown);
        
        const history = [...tab.vibeSession.history];
        if (promptOverride) {
            history.push({ role: 'user', content: promptOverride });
        }

        const apiHistory = [{ role: 'system', content: systemPrompt }, ...history];

        let fullResponse = "";
        
        // 2. Prepare the UI for the new revelation
        tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
        controller.refreshView(tab); 

        // 3. Initiate the Stream
        await VibeAPI.streamChat(apiHistory, ModelManager.getKey(), ModelManager.currentModel,
            (chunk) => {
                fullResponse += chunk;
                const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                lastMsg.content = fullResponse;
                // Live update the last message bubble
                controller.handleStreamChunk(fullResponse, tab);
            },
            async (finalText) => {
                const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                lastMsg.isStreaming = false;
                lastMsg.content = finalText;
                tab.isDirty = true;
                
                // 4. Manifest the Changes to Disk and stage them for Git
                const changes = ResponseParser.parseChanges(finalText, tab.vibeSession.rootPath);
                if (changes.length > 0) {
                    await LoopEngine.apply(changes, tab.item.workspaceId);
                    await controller.refreshTree(tab); 
                }
                
                // 5. Checkpoint the current state
                await controller.createCheckpoint(tab);

                // 6. Check for the Loop Ritual
                tab.vibeSession.iterationCount = (tab.vibeSession.iterationCount || 0) + 1;
                
                if (tab.vibeSession.iterationCount < State.vibeIterations && !State.isVibeStopRequested) {
                    UI.showToast(`B"H: Loop ${tab.vibeSession.iterationCount + 1}/${State.vibeIterations} starting...`, "info");
                    await this.runIteration(tab, controller, PromptBuilder.getOptimization());
                } else {
                    tab.vibeSession.isProcessing = false;
                    tab.vibeSession.iterationCount = 0; // Reset for next user message
                    controller.refreshView(tab);
                    UI.showToast("B\"H: Manifestation Complete.", "success");
                }
            },
            (err) => {
                tab.vibeSession.isProcessing = false;
                const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                lastMsg.isStreaming = false;
                lastMsg.content += `\n\n[ERROR: ${err.message}]`;
                UI.showToast(err.message, "error");
                controller.refreshView(tab);
            }
        );
    }
};
