
// B"H
import { VibeAPI } from '../api-client.js';
import { ModelManager } from '../model-manager.js';
import { HistoryCompressor } from '../modules/history/index.js';

export const VibeResourceTracker = {
    /**
     * @function updateTokenCount
     * @description Runs an on-demand token query.
     */
    async updateTokenCount(tab) {
        const btn = document.getElementById('vibe-token-btn');
        if (!btn || !tab || !tab.vibeSession) return;
        
        const apiKey = ModelManager.getKey();
        if (!apiKey) { 
            btn.textContent = "(No Key)"; 
            return; 
        }
        
        btn.textContent = "Calculating...";
        
        try {
            const compressedHistory = HistoryCompressor.compress([...tab.vibeSession.history]);
            
            const input = document.getElementById('vibe-input');
            if (input && input.value) {
                compressedHistory.push({ role: 'user', content: input.value });
            }
            
            const activeModel = ModelManager.currentModel || 'gemini-1.5-flash';
            const count = await VibeAPI.countTokens(compressedHistory, apiKey, activeModel);
            
            if (count > 0) {
                btn.textContent = "Tokens: " + count.toLocaleString();
            } else {
                btn.textContent = "Tokens: --";
            }
        } catch (err) {
            console.warn("[ResourceTracker] B\"H - Oracle silent:", err.message);
            btn.textContent = "Error";
        }
    }
};
