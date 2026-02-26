
// B"H
import { VibeAPI } from '../api-client.js';
import { ModelManager } from '../model-manager.js';

export const VibeResourceTracker = {
    async updateTokenCount(tab) {
        const counterEl = document.getElementById('vibe-token-counter');
        const input = document.getElementById('vibe-input');
        if (!counterEl || !tab.vibeSession) return;
        const apiKey = ModelManager.getKey();
        if (!apiKey) { counterEl.textContent = "Tokens: (No Key)"; return; }
        const messages = [...tab.vibeSession.history];
        if (input && input.value) messages.push({ role: 'user', content: input.value });
        const count = await VibeAPI.countTokens(messages, apiKey, ModelManager.currentModel);
        counterEl.textContent = `Tokens: ${count.toLocaleString()}`;
    }
};
