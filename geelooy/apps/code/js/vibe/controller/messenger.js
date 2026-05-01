
// B"H
/**
 * @file messenger.js
 * @description
 * * Chapter 4: The Messenger of the Timestream
 * This module bridges the user input to the AI logic.
 * * RECTIFICATION: Fixed an 'ID lost' error. We now strictly verify that 
 * the session ID exists before attempting to anchor the history in the DB.
 */

import { LogicController } from './logic.js';
import { VibeDB } from '../db.js';
import { ChatHistory } from '../view/chat/history.js';
import { UI } from '../../ui.js';

export const VibeMessenger = {
    /**
     * B"H
     * Initiates the sending of a user request.
     */
    async sendMessage(tab, controller) {
        const input = document.getElementById('vibe-input');
        if (!input || tab.vibeSession.isProcessing) return;
        
        const text = input.value.trim();
        if (!text) return;

        // B"H - SESSION ID RECTIFICATION
        const sessionId = tab.vibeSession.id || tab.item.path || "void_session";
        if (!tab.vibeSession.id) tab.vibeSession.id = sessionId;
        
        input.value = '';
        input.style.height = 'auto'; // Reset expanded textarea

        tab.vibeSession.history.push({ role: 'user', content: text });
        
        try {
            await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        } catch (e) {
            console.warn(`[Messenger] B"H - Could not anchor session immediately: ${e.message}`);
        }
        
        controller.refreshView(tab);
        await LogicController.runIteration(tab, controller);
    },

    /**
     * B"H
     * Routes stream chunks into the physical history elements.
     */
    handleStreamChunk(content, tab, controller) {
        const histEl = document.getElementById('vibe-chat-history');
        if (histEl) {
            ChatHistory.updateLastMessage(histEl, content, tab, controller);
        }
    }
};
