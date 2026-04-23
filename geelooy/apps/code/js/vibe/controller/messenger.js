
// B"H
import { LogicController } from './logic.js';
import { VibeDB } from '../db.js';
import { ChatHistory } from '../view/chat/history.js';

export const VibeMessenger = {
    async sendMessage(tab, controller) {
        const input = document.getElementById('vibe-input');
        if (!input || tab.vibeSession.isProcessing) return;
        const text = input.value.trim();
        if (!text) return;
        
        input.value = '';
        tab.vibeSession.history.push({ role: 'user', content: text });
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        
        controller.refreshView(tab);
        await LogicController.runIteration(tab, controller);
    },

    handleStreamChunk(content, tab, controller) {
        const hist = document.getElementById('vibe-chat-history');
        if (hist) ChatHistory.updateLastMessage(hist, content, tab, controller);
    }
};
