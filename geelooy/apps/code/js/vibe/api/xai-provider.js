// B"H
import { OpenAICompatibleProvider } from './openai-compatible-provider.js';
import { ModelManager } from '../model-manager.js';

const XAI_MODELS_URL = 'https://api.x.ai/v1/models';
const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions';

export const XAIProvider = {
    async fetchModels(apiKey) {
        return OpenAICompatibleProvider.fetchModels(apiKey, { providerId: 'xai', modelsUrl: XAI_MODELS_URL, defaultContext: 131072, isFreeTier: false });
    },
    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = { ...(ModelManager.getModel(modelId) || { id: modelId }), provider: 'xai' };
        return OpenAICompatibleProvider.streamChat(messages, apiKey, modelId, tools, { chatUrl: XAI_CHAT_URL, modelMeta, providerId: 'xai' }, onActive, onChunk, onReasoning, onToolCall, onComplete, onError);
    }
};
