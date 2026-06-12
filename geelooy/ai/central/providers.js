// B"H
/**
 * B"H
 * Chapter 159: Each Model River Was Given A Measured Shore.
 *
 * Provider definitions are data, not scattered conditionals. Context windows,
 * endpoints, keys, models, and stream quirks all live here so every caller can
 * trim memory and render progress with the same truth. ChatGPT browser mode is
 * a local tunnel provider: it has no API key and speaks through the user's
 * manually authenticated debug Chrome profile.
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
    extraBody: { reasoning_split: true }
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/keys",
    envKey: "OPENROUTER_API_KEY",
    storageKey: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini",
    contextWindow: 128000
  },
  groq: {
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    envKey: "GROQ_API_KEY",
    storageKey: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    contextWindow: 128000
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

/**
 * B"H — returns provider metadata or throws a clear error.
 * @param {string} id Provider id.
 * @returns {object} Provider config.
 */
export function getProvider(id = "openrouter") {
  const provider = AI_PROVIDERS[id];
  if (!provider) throw new Error(`Unknown AI provider: ${id}`);
  return provider;
}

/**
 * B"H — lists provider configs for settings UIs and tests.
 * @returns {object[]} Provider configs.
 */
export function listProviders() {
  return Object.values(AI_PROVIDERS);
}
