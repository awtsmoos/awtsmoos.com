// B"H
import { OpenAICompatibleProvider } from './openai-compatible-provider.js';
import { ModelManager } from '../model-manager.js';

const TOGETHER_MODELS_URL = 'https://api.together.xyz/v1/models';
const TOGETHER_CHAT_URL = 'https://api.together.xyz/v1/chat/completions';

export const TogetherProvider = {
    async fetchModels(apiKey) {
        return OpenAICompatibleProvider.fetchModels(apiKey, {
            providerId: 'together',
            modelsUrl: TOGETHER_MODELS_URL,
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
            { chatUrl: TOGETHER_CHAT_URL, modelMeta },
            onActive,
            onChunk,
            onReasoning,
            onToolCall,
            onComplete,
            onError
        );
    }
};
