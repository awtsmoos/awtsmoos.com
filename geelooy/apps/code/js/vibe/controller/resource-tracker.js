
// B"H
import { VibeAPI } from '../api-client.js';
import { ModelManager } from '../model-manager.js';
import { HistoryCompressor } from '../modules/history/index.js';

export const VibeResourceTracker = {
    async updateTokenCount(tab) {
        const btn = document.getElementById('vibe-token-btn');
        const counter = document.getElementById('vibe-token-counter');
        if (!btn || !tab || !tab.vibeSession) return;
        
        const apiKey = ModelManager.getKey();
        if (!apiKey) { 
            if (counter) counter.textContent = "Tokens: (No Key)"; 
            return; 
        }
        
        btn.textContent = "...";
        
        try {
            const compressedHistory = HistoryCompressor.compress([...tab.vibeSession.history]);
            const activeModel = ModelManager.currentModel || 'gemini-1.5-flash';
            const count = await VibeAPI.countTokens(compressedHistory, apiKey, activeModel);
            
            if (counter) {
                counter.textContent = "Tokens: " + (count > 0 ? count.toLocaleString() : "--");
            }
        } catch (err) {
            console.warn("[ResourceTracker] Oracle silent:", err.message);
        } finally {
            btn.textContent = "⟳";
        }
    }
};
