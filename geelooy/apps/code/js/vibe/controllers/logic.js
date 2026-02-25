
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

export const LogicController = {
    async runIteration(tab, controller) {
        tab.vibeSession.isProcessing = true;
        tab.vibeSession.activeFiles = []; 
        controller.refreshView(tab);

        const markdown = await ContextBuilder.build(tab);
        const sysMsg = { role: 'system', content: PromptBuilder.getSystem(markdown) };
        const apiHistory = [sysMsg, ...tab.vibeSession.history];

        let fullResponse = "";
        
        // Add placeholder message
        tab.vibeSession.history.push({ role: 'model', content: '', isStreaming: true });
        // Force UI update to show the new bubble
        controller.refreshView(tab); 

        await VibeAPI.streamChat(apiHistory, ModelManager.getKey(), ModelManager.currentModel,
            (chunk) => {
                fullResponse += chunk;
                // Update placeholder in state
                const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                lastMsg.content = fullResponse;
                
                // Process Stream for Sidebar updates
                controller.handleStreamChunk(fullResponse, tab);
            },
            async (finalText) => {
                const lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
                lastMsg.isStreaming = false;
                lastMsg.content = finalText;
                tab.isDirty = true;
                
                // Finalize files to disk
                const changes = ResponseParser.parseChanges(finalText, tab.vibeSession.rootPath);
                if (changes.length > 0) {
                    await LoopEngine.apply(changes, tab.item.workspaceId);
                    controller.refreshTree(tab); 
                }
                
                tab.vibeSession.isProcessing = false;
                
                // B"H - Save Checkpoint automatically after every successful AI interaction
                await controller.createCheckpoint(tab);
                
                controller.refreshView(tab);
                UI.showToast("B\"H: Manifestation Complete.", "success");
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
