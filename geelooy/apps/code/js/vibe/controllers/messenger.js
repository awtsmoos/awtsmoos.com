
// B"H
/**
 * @file messenger.js
 */

import { VibeView } from '../vibe-view.js';
import { LogicController } from './logic.js';
import { VibeDB } from '../db.js';
import { Workspaces } from '../../workspaces/index.js';
import { ChatHistory } from '../view/chat/history.js';
import { UI } from '../../ui.js';

export const VibeMessenger = {
    async sendMessage(tab, controller) {
        const input = document.getElementById('vibe-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text || tab.vibeSession.isProcessing) return;
        
        input.value = '';
        tab.vibeSession.history.push({ role: 'user', content: text });
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        
        VibeView.render(tab, controller);
        
        // B"H - Auto-calculate token cost of the new reality
        controller.updateTokenCount(tab);

        try {
            await LogicController.runIteration(tab, controller);
            const root = controller.getRootItem(tab);
            await Workspaces.refreshNode(root);
        } catch (e) {
            UI.showToast(`AI Ritual Error: ${e.message}`, "error");
        }
    },

    handleStreamChunk(content, tab, controller) {
        const hist = document.getElementById('vibe-chat-history');
        if (!hist) return;
        ChatHistory.updateLastMessage(hist, content, tab, controller);
    }
};
