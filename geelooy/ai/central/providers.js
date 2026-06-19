// B"H

/**
 * Provider catalog for OpenAI-compatible vessels.
 *
 * Chapter 19: Each provider is a gate in the palace. The browser speaks one
 * shared language, but every gate keeps its own name, key, endpoint, and model
 * defaults so the Awtsmoos may shine through many routes without confusion.
 */

export const AI_PROVIDERS = Object.freeze({
  minimax: freezeProvider({
    id: "minimax",
    name: "MiniMax",
    apiKeyUrl: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    envKey: "MINIMAX_API_KEY",
    storageKey: "minimax",
    endpoint: "https://api.minimax.io/v1/chat/completions",
    defaultModel: "MiniMax-M2.7",
    contextWindow: 196000,
    extraBody: { reasoning_split: true },
    openAICompatible: true,
    models: [
      { id: "MiniMax-M2.7", label: "MiniMax M2.7", aliases: ["m2", "m2.7"] },
      { id: "MiniMax-M3", label: "MiniMax M3", aliases: ["m3"], multimodal: true }
    ]
  }),
  openrouter: freezeProvider({
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    envKey: "OPENROUTER_API_KEY",
    storageKey: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4.1-mini",
    headers: {
      "HTTP-Referer": globalThis?.location?.origin || "https://awtsmoos.com",
      "X-Title": "Awtsmoos AI"
    },
    openAICompatible: true
  }),
  deepseek: freezeProvider({
    id: "deepseek",
    name: "DeepSeek",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    envKey: "DEEPSEEK_API_KEY",
    storageKey: "deepseek",
    endpoint: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-chat",
    openAICompatible: true
  }),
  groq: freezeProvider({
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    envKey: "GROQ_API_KEY",
    storageKey: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    openAICompatible: true
  }),
  chatgpt: freezeProvider({
    id: "chatgpt",
    name: "ChatGPT Browser",
    storageKey: "chatgpt-browser",
    browserTransport: true,
    openAICompatible: false
  }),
  "chatgpt-browser": freezeProvider({
    id: "chatgpt-browser",
    name: "ChatGPT Browser",
    storageKey: "chatgpt-browser",
    browserTransport: true,
    openAICompatible: false
  })
});

export function getProvider(id = "minimax") {
  const provider = AI_PROVIDERS[id];
  if (!provider) throw new Error(`Unknown AI provider: ${id}`);
  return provider;
}

export function listProviders() {
  return Object.values(AI_PROVIDERS);
}

function freezeProvider(provider) {
  const frozenModels = provider.models?.map((model) => Object.freeze({ ...model })) || undefined;
  return Object.freeze({ ...provider, models: frozenModels && Object.freeze(frozenModels) });
}
