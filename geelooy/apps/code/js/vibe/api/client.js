
// B"H
/**
 * @file client.js
 * @brief The Universal Oracle Gateway.
 */

import { ApiUtils } from './utils.js';
import { TokenCounter } from './token-counter.js';
import { GoogleProvider } from './google-provider.js';
import { OpenRouterProvider } from './openrouter-provider.js';
import { ModelManager } from '../model-manager.js';

export const VibeAPI = {
    async countTokens(messages, apiKey, modelId) {
        const std = ApiUtils.standardizeMessages(messages);
        const key = apiKey || ModelManager.getActiveKey();
        return await TokenCounter.countTokens(std, key, modelId);
    },

    // B"H - Added 'onActive' hook to pierce the latency void instantly
    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const { systemPrompt, conversation } = ApiUtils.extractSystem(messages);
        let finalMessages = ApiUtils.standardizeMessages(conversation);
        
        if (systemPrompt) finalMessages.unshift({ role: 'system', content: systemPrompt });

        const key = apiKey || ModelManager.getActiveKey();
        if (!key) throw new Error("Divine Connection Blocked: No active API key found.");

        const isOpenRouter = modelId.startsWith('openrouter/') || modelId.includes('/');
        
        if (isOpenRouter) {
            await OpenRouterProvider.streamChat(finalMessages, key, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError);
        } else {
            await GoogleProvider.streamChat(finalMessages, key, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError);
        }
    },
    
    fetchGoogleModels: (k) => GoogleProvider.fetchModels(k),
    fetchOpenRouterModels: (k) => OpenRouterProvider.fetchModels(k)
};
