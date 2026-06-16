// B"H
/**
 * B"H
 * Chapter 19: More rivers joined the same guarded sea.
 *
 * Provider definitions are data, not scattered conditionals. OpenAI-compatible
 * providers can join the Awtsmoos tool bridge immediately; non-compatible
 * protocols should receive dedicated adapters instead of being faked.
 */
export const AI_PROVIDERS = Object.freeze({
  minimax: {
    id: "minimax",
    name: "MiniMax",
    apiKeyUrl: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    envKey: "MINIMAX_API_KEY",
    storageKey: "minimax",
    endpoint: "https://api.minimax.io/v1/chat/completions",
    defaultModel: "MiniMax-M2.7",
    contextWindow: 196000,
    extraBody: { reasoning_split: true },
    openAICompatible: true
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/keys",
    envKey: "OPENROUTER_API_KEY",
    storageKey: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini",
    contextWindow: 128000,
    openAICompatible: true
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    envKey: "DEEPSEEK_API_KEY",
    storageKey: "deepseek",
    endpoint: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-chat",
    contextWindow: 64000,
    openAICompatible: true
  },
  groq: {
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    envKey: "GROQ_API_KEY",
    storageKey: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    contextWindow: 128000,
    openAICompatible: true
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT Browser",
    browserProvider: true,
    localTunnelProvider: true,
    storageKey: "chatgpt-browser",
    endpoint: "awtsmoos-tunnel://chatgpt",
    defaultModel: "chatgpt-browser-profile",
    contextWindow: 128000,
    requiresApiKey: false
  },
  "chatgpt-browser": {
    id: "chatgpt-browser",
    name: "ChatGPT Browser",
    browserProvider: true,
    localTunnelProvider: true,
    storageKey: "chatgpt-browser",
    endpoint: "awtsmoos-tunnel://chatgpt",
    defaultModel: "chatgpt-browser-profile",
    contextWindow: 128000,
    requiresApiKey: false
  }
});

export function getProvider(id = "openrouter") {
  const provider = AI_PROVIDERS[id];
  if (!provider) throw new Error(`Unknown AI provider: ${id}`);
  return provider;
}

export function listProviders() { return Object.values(AI_PROVIDERS); }
