
// B"H
import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';

export const VibeStateManager = {
    async resetChat(tab, controller) {
        const confirmed = await UI.showDialog({ 
            title: "Clear Timestream", 
            message: "This will dissolve the current chat history for this specific session. (Files are not affected). Proceed?", 
            okText: "Clear Chat" 
        });
        
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
        console.log("Legacy checkpoint creation bypassed. Relies on LoopEngine Timeline.");
    }
};
