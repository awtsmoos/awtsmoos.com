
// B"H
/**
 * @file state-manager.js
 */

import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';

export const VibeStateManager = {
    async resetChat(tab, controller) {
        const confirmed = await UI.showDialog({ title: "Reset", message: "Clear history?", okText: "Yes" });
        if (confirmed) {
            tab.vibeSession.history = [];
            await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
            controller.render(tab);
        }
    },

    async saveSession(tab) {
        if (!tab.vibeSession) return;
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        UI.showToast("State anchored.", "success");
    },
    
    async createCheckpoint(tab) {
        if (!tab || !tab.vibeSession) return;
        await VibeDB.saveCheckpoint(tab.vibeSession.id, tab.vibeSession.history);
        UI.showToast("B\"H: State of Being archived.", "info");
    }
};
