// B"H
/**
 * @file streamClient.js
 * @brief OpenAI-compatible stream client for geelooy/ai.
 * Now uses the shared streaming module from geelooy/shared/streaming/.
 */

import { buildChatPayload, extractAssistantText, normalizeMessages } from "./payload.js";
import { readSSEStream } from "../../../shared/streaming/index.js";

export class OpenAICompatibleStreamClient {
  constructor({ provider, apiKey, fetchImpl = fetch } = {}) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  async complete({ messages, prompt, model, tools, stream = false, onDelta } = {}) {
    const payload = buildChatPayload({
      model: model || this.provider.defaultModel,
      messages: normalizeMessages(messages || prompt),
      tools,
      stream,
      extraBody: this.provider.extraBody
    });
    const response = await this.fetchImpl(this.provider.endpoint, this.request(payload));
    if (!response.ok) throw new Error(await this.errorText(response));
    if (stream && response.body) return this._readStream(response, onDelta);
    const json = await response.json();
    return { text: extractAssistantText(json), json };
  }

  request(payload) {
    return { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` }, body: JSON.stringify(payload) };
  }

  async errorText(response) {
    const text = await response.text().catch(() => response.statusText);
    return `${this.provider.name} error ${response.status}: ${text}`;
  }

  async _readStream(response, onDelta) {
    const reader = response.body.getReader();
    let fullText = '';
    const result = await readSSEStream(reader, this.provider.id, {
      onChunk: (chunk) => {
        fullText += chunk;
        onDelta?.(chunk, fullText);
      }
    });
    return { text: fullText || result.text, reasoning: result.reasoning, toolCalls: result.tools };
  }
}
