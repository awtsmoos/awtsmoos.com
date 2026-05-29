// B"H

/**
 * B"H
 * Chapter 16: The Awtsmoos gathered many model rivers into one basin.
 *
 * Provider definitions are data, not scattered conditionals. Each model gate
 * receives endpoint, key storage, and default model from here, so browser AI,
 * code editor AI, and local agent scripts can drink from the same source.
 */
export const AI_PROVIDERS = Object.freeze({
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/keys",
    envKey: "OPENROUTER_API_KEY",
    storageKey: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini"
  },
  groq: {
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    envKey: "GROQ_API_KEY",
    storageKey: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile"
  }
});

/**
 * B"H
 * Returns provider metadata or throws a clear error.
 *
 * @param {string} id Provider id.
 * @returns {object} Provider config.
 */
export function getProvider(id = "openrouter") {
  const provider = AI_PROVIDERS[id];
  if (!provider) throw new Error(`Unknown AI provider: ${id}`);
  return provider;
}

/**
 * B"H
 * Lists provider configs for settings UIs and tests.
 *
 * @returns {object[]} Provider configs.
 */
export function listProviders() {
  return Object.values(AI_PROVIDERS);
}
