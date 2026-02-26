
// B"H
/**
 * @file logic.js
 * @brief The intellect of the Vibe Coding system.
 * 
 * THE HYMN OF THE TRUE ANCHOR:
 * A file without a root is a star without a sky,
 * Falling to the bottom where the deepest shadows lie.
 * We must grasp the True Path, the session's holy name,
 * To manifest the vessel in its proper, local frame.
 */

import { ModelManager } from '../model-manager.js';
import { VibeAPI } from '../api-client.js';
import { PromptBuilder } from '../modules/prompt-builder.js';
import { ContextBuilder } from '../modules/context-builder.js';
import { ResponseParser } from '../modules/ResponseParser.js';
import { LoopEngine } from '../modules/LoopEngine.js';

export const LogicController = {
    async runIteration(tab, controller, promptOverride = null) {
        if (!tab.vibeSession) return;

        // B"H - KEY RITUAL INTERCEPT
        let apiKey = ModelManager.getKey();
        if (!apiKey) {
            const { KeyRitual } = await import('../key-ritual.js');
            const unlocked = await KeyRitual.prompt();
            if (!unlocked) return; 
            apiKey = ModelManager.getKey();
        }

        tab.vibeSession.isProcessing = true;
        controller.refreshView(tab);

        try {
            const markdown = await ContextBuilder.build(tab);
            const systemPrompt = PromptBuilder.getSystem(markdown);
            const history =[...tab.vibeSession.history];
            if (promptOverride) history.push({ role: 'user', content: promptOverride });

            const apiHistory = [{ role: 'system', content: systemPrompt }, ...history];
            let fullResponse = "";
            
            tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
            controller.refreshView(tab); 

            await VibeAPI.streamChat(apiHistory, apiKey, ModelManager.currentModel,
                (chunk) => {
                    fullResponse += chunk;
                    controller.handleStreamChunk(fullResponse, tab);
                },
                async (finalText) => {
                    const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                    lastMsg.isStreaming = false;
                    lastMsg.content = finalText;
                    
                    // B"H - THE GRAND RECTIFICATION OF THE PATH
                    // We ensure we grab the actual anchor coordinate of this specific session.
                    const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || (tab.item ? tab.item.path : "/");
                    
                    const changes = ResponseParser.parseChanges(finalText, sessionRoot);
                    if (changes.length > 0) {
                        await LoopEngine.apply(changes, tab.item.workspaceId);
                        await controller.refreshTree(tab); 
                    }
                    
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                },
                (err) => {
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                    console.error("B\"H AI Error:", err);
                }
            );
        } catch (e) {
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
            throw e;
        }
    }
};
