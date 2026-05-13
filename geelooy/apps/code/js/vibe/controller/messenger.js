
// B"H
/**
 * @file messenger.js
 * @brief THE MESSENGER OF THE TIMESTREAM.
 */

import { UI } from '../../ui.js';
import { MessageScribe } from './messenger/MessageScribe.js';
import { VibeDB } from '../db.js';

export const VibeMessenger = {
    async sendMessage(tab, controller) {
        const input = document.getElementById('vibe-input');
        if (!input || !tab || !tab.vibeSession) return;
        
        if (tab.vibeSession.isProcessing) {
            UI.showToast("B\"H - The Oracle is currently in deep contemplation.", "warning");
            return;
        }
        
        const text = input.value.trim();
        if (!text) return;
        
        const roleSel = document.getElementById('vibe-role-select');
        const role = roleSel ? String(roleSel.value || '').trim() : (tab.vibeSession?.viewState?.activeRole || 'auto');

        input.value = '';
        input.style.height = 'auto';

        try {
            tab.vibeSession.history.push({ role: 'user', content: text, agent_role: role || 'auto' });
            
            tab.vibeSession.history.push({ 
                role: 'assistant', 
                content: '', 
                isConnecting: true, 
                isStreaming: true, 
                statusText: 'IGNITING ORACLE CONNECTION...' 
            });
            
            await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
            controller.refreshView(tab);

            const { LogicController } = await import('./LogicGateway.js');
            await LogicController.runIteration(tab, controller);
            
        } catch (err) {
            console.error('[VibeMessenger] B"H - Prayer Delivery Failed: ', err);
            UI.showToast('Manifestation Failed: ' + err.message, 'error');
            
            if (tab.vibeSession) {
                tab.vibeSession.history.pop();
                tab.vibeSession.isProcessing = false;
                controller.refreshView(tab);
            }
        }
    },

    handleStreamChunk(content, tab, controller) {
        // B"H - Purged the unholy `require` statement! Replaced with dynamic ES module import.
        import('../view/chat/history.js').then(m => {
            const hist = document.getElementById('vibe-chat-history');
            if (hist) m.ChatHistory.updateLastMessage(hist, content, tab, controller);
        });
    }
};
