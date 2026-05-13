// B"H
/**
 * @file groq-provider.js
 * @brief Groq provider via OpenAI-compatible endpoints.
 */

import { OpenAICompatibleProvider } from './openai-compatible-provider.js';
import { ModelManager } from '../model-manager.js';

const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GroqProvider = {
    async fetchModels(apiKey) {
        return OpenAICompatibleProvider.fetchModels(apiKey, {
            providerId: 'groq',
            modelsUrl: GROQ_MODELS_URL,
            defaultContext: 131072,
            isFreeTier: true
        });
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = ModelManager.getModel(modelId) || { id: modelId };
        return OpenAICompatibleProvider.streamChat(
            messages,
            apiKey,
            modelId,
            tools,
            { chatUrl: GROQ_CHAT_URL, modelMeta },
            onActive,
            onChunk,
            onReasoning,
            onToolCall,
            onComplete,
            onError
        );
    }
};
