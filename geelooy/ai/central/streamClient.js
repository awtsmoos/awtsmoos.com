// B"H
import { buildChatPayload, extractAssistantText, normalizeMessages } from "./payload.js";

/**
 * B"H
 * Chapter 19: The stream split into sparks, yet each spark remembered the sea.
 *
 * This client works in browser and Node fetch worlds. It can stream SSE chunks
 * or fall back to one JSON response, keeping provider code centralized.
 */
export class OpenAICompatibleStreamClient {
  constructor({ provider, apiKey, fetchImpl = fetch } = {}) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  async complete({ messages, prompt, model, tools, stream = false, onDelta } = {}) {
    const payload = buildChatPayload({ model: model || this.provider.defaultModel, messages: normalizeMessages(messages || prompt), tools, stream });
    const response = await this.fetchImpl(this.provider.endpoint, this.request(payload));
    if (!response.ok) throw new Error(await this.errorText(response));
    if (stream && response.body) return await this.readStream(response, onDelta);
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

  async readStream(response, onDelta) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split(/\r?\n/)) {
        const delta = this.parseLine(line);
        if (!delta) continue;
        text += delta;
        onDelta?.(delta, text);
      }
    }
    return { text };
  }

  parseLine(line) {
    if (!line.startsWith("data:")) return "";
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return "";
    try { return JSON.parse(data)?.choices?.[0]?.delta?.content || ""; } catch (_) { return ""; }
  }
}
