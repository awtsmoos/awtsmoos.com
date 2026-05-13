// B"H
import { OpenAICompatibleProvider } from './openai-compatible-provider.js';
import { ModelManager } from '../model-manager.js';

const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export const OpenAIProvider = {
    async fetchModels(apiKey) {
        return OpenAICompatibleProvider.fetchModels(apiKey, {
            providerId: 'openai',
            modelsUrl: OPENAI_MODELS_URL,
            defaultContext: 131072,
            isFreeTier: false
        });
    },

    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = ModelManager.getModel(modelId) || { id: modelId };
        return OpenAICompatibleProvider.streamChat(
            messages,
            apiKey,
            modelId,
            tools,
            { chatUrl: OPENAI_CHAT_URL, modelMeta },
            onActive,
            onChunk,
            onReasoning,
            onToolCall,
            onComplete,
            onError
        );
    }
};
