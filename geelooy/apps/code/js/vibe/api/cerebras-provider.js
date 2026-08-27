// B"H
import { OpenAICompatibleProvider } from './openai-compatible-provider.js';
import { ModelManager } from '../model-manager.js';

const CEREBRAS_MODELS_URL = 'https://api.cerebras.ai/v1/models';
const CEREBRAS_CHAT_URL = 'https://api.cerebras.ai/v1/chat/completions';

export const CerebrasProvider = {
    async fetchModels(apiKey) {
        return OpenAICompatibleProvider.fetchModels(apiKey, { providerId: 'cerebras', modelsUrl: CEREBRAS_MODELS_URL, defaultContext: 131072, isFreeTier: true });
    },
    async streamChat(messages, apiKey, modelId, tools, onActive, onChunk, onReasoning, onToolCall, onComplete, onError) {
        const modelMeta = { ...(ModelManager.getModel(modelId) || { id: modelId }), provider: 'cerebras' };
        return OpenAICompatibleProvider.streamChat(messages, apiKey, modelId, tools, { chatUrl: CEREBRAS_CHAT_URL, modelMeta, providerId: 'cerebras' }, onActive, onChunk, onReasoning, onToolCall, onComplete, onError);
    }
};
