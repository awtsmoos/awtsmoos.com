
// B"H
import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';

export const VibeStateManager = {
    async resetChat(tab, controller) {
        const confirmed = await UI.showDialog({ 
            title: "Reset Timestream", 
            message: "This will dissolve the current history. Proceed?", 
            okText: "Reset" 
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
        UI.showToast("B\"H - Timestream Anchored.", "success");
    },

    async createCheckpoint(tab) {
        // Handle legacy calls gracefully
        console.log("B\"H - Automatic checkpoint recorded in LoopEngine.");
        return null;
    }
};
