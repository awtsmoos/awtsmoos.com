
/**
 * @file resource-tracker.js
 * @brief The Measured Count of Divine Light.
 */

import { VibeAPI } from '../api-client.js';
import { ModelManager } from '../model-manager.js';
import { HistoryCompressor } from '../modules/history/index.js';

export const VibeResourceTracker = {
    /**
     * B"H
     * Calculates the token presence of the current session and records it.
     */
    async updateTokenCount(tab, controller) {
        const btn = document.getElementById('vibe-token-btn');
        const counter = document.getElementById('vibe-token-counter');
        
        if (!tab || !tab.vibeSession) return;
        
        const apiKey = ModelManager.getKey();
        if (!apiKey) { 
            if (counter) counter.textContent = "Tokens: (No Key)"; 
            return; 
        }
        
        if (btn) btn.textContent = "...";
        
        try {
            const compressedHistory = HistoryCompressor.compress([...tab.vibeSession.history]);
            const activeModel = ModelManager.currentModel || 'gemini-1.5-flash';
            const count = await VibeAPI.countTokens(compressedHistory, apiKey, activeModel);
            
            // B"H - Record the measure in the Session Soul
            if (!tab.vibeSession.resourceStats) {
                tab.vibeSession.resourceStats = {};
            }
            
            const countStr = count > 0 ? count.toLocaleString() : "--";
            tab.vibeSession.resourceStats.tokens = countStr;

            if (counter) {
                counter.textContent = "Tokens: " + countStr;
            }

            // B"H - Trigger a re-render of the history view to update the status overlay
            if (controller && controller.refreshView) {
                controller.refreshView(tab);
            }
            
        } catch (err) {
            console.warn("[ResourceTracker] Oracle silent:", err.message);
        } finally {
            if (btn) btn.textContent = "⟳";
        }
    }
};
