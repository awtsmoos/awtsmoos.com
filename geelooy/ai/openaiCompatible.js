//B"H
import { AwtsmoosPrompt } from "./prompt.js";
import { getProvider, OpenAICompatibleStreamClient } from "./central/index.js";

/**
 * B"H
 * Chapter 20: The old provider gate bowed to the central river.
 *
 * This file keeps the historic browser service API alive while delegating
 * provider metadata, payload building, and streaming/non-streaming fetch logic
 * to `geelooy/ai/central`. Nothing upstream has to break.
 *
 * @param {object} owner The AIServiceHandler instance that carries IndexedDB.
 * @param {string} providerId The provider key, such as openrouter or groq.
 * @returns {object} A browser-safe chat service with promptFunction parity.
 */
export function makeOpenAICompatibleService(owner, providerId) {
  const provider = getProvider(providerId);
  return {
    name: provider.name,
    async getAwtsmoosAudio() { return null; },
    async getConversationsFnc() { return { items: [] }; },
    async getConversation() { return []; },
    async promptFunction(userMessage, options = {}) {
      const apiKey = await getProviderKey(owner, provider);
      const client = new OpenAICompatibleStreamClient({ provider, apiKey });
      const result = await client.complete({
        prompt: userMessage,
        model: options.model || provider.defaultModel,
        tools: options.tools || [],
        stream: !!options.stream,
        onDelta: delta => options.onstream?.(delta)
      });
      if (!options.stream) options.onstream?.(result.text);
      options.ondone?.(result.text);
      return { awtsmoos: { otherEvents: [] }, content: { parts: [result.text] } };
    }
  };
}

/**
 * B"H
 * Gets or asks for a provider API key, storing it under api-keys/provider.
 *
 * @param {object} owner AIServiceHandler with dbHandler and initialized DB.
 * @param {object} provider Provider metadata.
 * @returns {Promise<string>} API key.
 */
export async function getProviderKey(owner, provider) {
  if (!owner?.dbHandler?.db) await owner?.dbHandler?.init?.();
  let key = await owner.dbHandler.read("api-keys", provider.storageKey);
  if (!key) {
    key = await AwtsmoosPrompt.go({ headerTxt: `What's your <a href='${provider.apiKeyUrl}'>${provider.name} API key</a>?` });
    await owner.dbHandler.write("api-keys", provider.storageKey, key);
  }
  return key;
}
