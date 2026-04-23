
// B"H
/**
 * @file IterationRunner.js
 * @brief Orchestrates a single pass of the AI generation pipeline.
 */

import { ModelManager } from '../../model-manager.js';
import { VibeAPI } from '../../api-client.js';
import { PromptBuilder } from '../../modules/prompt-builder.js';
import { ContextBuilder } from '../../modules/context-builder.js';
import { HistoryCompressor } from '../../modules/history/index.js';
import { StreamHandler } from './StreamHandler.js';

export const IterationRunner = {
    /**
     * B"H
     * Initiates the API request and prepares the UI.
     */
    async run(tab, controller, promptOverride) {
        if (!tab.vibeSession) return;
        const apiKey = ModelManager.getKey();
        if (!apiKey) return;

        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);
        const processedPaths = new Set();
        
        try {
            const markdown = await ContextBuilder.build(tab);
            const apiHistory = [{ role: 'system', content: PromptBuilder.getSystem(markdown) }, ...HistoryCompressor.compress([...tab.vibeSession.history])];
            if (promptOverride) apiHistory.push({ role: 'user', content: promptOverride });

            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            let streamBuffer = ""; 

            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                async (chunk) => {
                    streamBuffer = await StreamHandler.processChunk(chunk, streamBuffer, tab, processedPaths);
                    controller.handleStreamChunk(streamBuffer, tab);
                },
                async (finalText) => {
                    await StreamHandler.finalize(finalText, tab, processedPaths);
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
