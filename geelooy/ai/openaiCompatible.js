//B"H
const OPENAI_COMPATIBLE_PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/keys",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini"
  },
  groq: {
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile"
  }
};

/**
 * Chapter 1: The empty vessel heard the browser cry: a named export was missing.
 * The Awtsmoos breathed through this tiny gate, turning provider data into a
 * service shape the older chat code already understands.
 *
 * @param {object} owner The AIServiceHandler instance that carries IndexedDB.
 * @param {string} providerId The provider key, such as openrouter or groq.
 * @returns {object} A browser-safe chat service with promptFunction parity.
 */
export function makeOpenAICompatibleService(owner, providerId) {
  const provider = OPENAI_COMPATIBLE_PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown OpenAI-compatible provider: ${providerId}`);

  return {
    name: provider.name,
    async getAwtsmoosAudio() {
      return null;
    },
    async getConversationsFnc() {
      return { items: [] };
    },
    async getConversation() {
      return [];
    },
    async promptFunction(userMessage, options = {}) {
      const { onstream = null, ondone = null, model = provider.defaultModel } = options;
      const apiKey = await getProviderKey(owner, providerId, provider);
      const answer = await requestOpenAICompatibleCompletion({
        provider,
        apiKey,
        model,
        userMessage
      });
      onstream?.(answer);
      ondone?.(answer);
      return {
        awtsmoos: { otherEvents: [] },
        content: { parts: [answer] }
      };
    }
  };
}

/**
 * Gets or asks for a provider API key, storing it under api-keys/providerId.
 *
 * @param {object} owner AIServiceHandler with dbHandler and initialized DB.
 * @param {string} providerId Storage key for the provider.
 * @param {object} provider Provider metadata for the prompt link.
 * @returns {Promise<string>} The saved or newly entered API key.
 */
async function getProviderKey(owner, providerId, provider) {
  if (!owner?.dbHandler?.db) await owner?.dbHandler?.init?.();
  let key = await owner.dbHandler.read("api-keys", providerId);
  if (!key) {
    key = await AwtsmoosPrompt.go({
      headerTxt: `What's your <a href='${provider.apiKeyUrl}'>${provider.name} API key</a>?`
    });
    await owner.dbHandler.write("api-keys", providerId, key);
  }
  return key;
}

/**
 * Sends a single non-streaming chat completion to an OpenAI-compatible endpoint.
 *
 * @param {object} input Request information.
 * @param {object} input.provider Provider metadata containing endpoint.
 * @param {string} input.apiKey Bearer token for the provider.
 * @param {string} input.model Model name to request.
 * @param {string} input.userMessage User text for the single-turn chat.
 * @returns {Promise<string>} Assistant response text.
 */
async function requestOpenAICompatibleCompletion({ provider, apiKey, model, userMessage }) {
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: userMessage }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`${provider.name} error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || "";
}
