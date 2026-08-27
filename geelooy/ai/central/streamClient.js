// B"H
import { buildChatPayload, extractAssistantText, normalizeMultimodalMessages } from "./payload.js";
import { estimateTokens, trimMessagesForContext } from "./contextWindow.js";
import { readSSEStream } from "../../shared/streaming/index.js";

/**
 * B"H
 * Chapter 201: The Provider River Remembered Every Gate's Crown.
 *
 * The same stream still carries text, thinking, raw chunks, tool calls, metrics,
 * and finish reasons, but now each provider's own headers travel with the
 * request. OpenRouter's title and referer no longer remain decorative metadata.
 */
export class OpenAICompatibleStreamClient {
  constructor({ provider, apiKey, fetchImpl = null } = {}) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.fetchImpl = safeFetch(fetchImpl);
  }

  async complete({ messages, prompt, model, modelMeta, attachments, tools, stream = true, signal, onDelta, onReasoning, onToolCall, onMetrics, onEvent } = {}) {
    const chosenModel = model || this.provider.defaultModel;
    const rawMessages = normalizeMultimodalMessages({ messages: messages || prompt, attachments, modelMeta: modelMeta || { id: chosenModel, provider: this.provider.id }, providerId: this.provider.id });
    const context = trimMessagesForContext(rawMessages, tools || [], this.provider.contextWindow || 128000);
    onMetrics?.({ ...context.metrics, outputTokens: 0, totalTokens: context.metrics.promptTokens });
    const payload = buildChatPayload({ model: chosenModel, messages: context.messages, tools, stream, extraBody: this.provider.extraBody });
    const response = await this.fetchImpl(this.provider.endpoint, this.request(payload, signal));
    if (!response.ok) throw await this.error(response);
    if (stream && response.body) return this.readStream(response, { context, onDelta, onReasoning, onToolCall, onMetrics, onEvent });
    return await this.readJson(response, { context, onDelta, onToolCall, onMetrics, onEvent });
  }

  request(payload, signal) {
    const headers = { "Content-Type": "application/json", ...(this.provider.headers || {}), Authorization: `Bearer ${this.apiKey}` };
    return { method: "POST", headers, body: JSON.stringify(payload), signal };
  }

  async readJson(response, callbacks = {}) {
    const json = await response.json();
    const toolCalls = completeToolCalls(json?.choices?.[0]?.message?.tool_calls || []);
    const text = stripLiveThinking(extractAssistantText(json));
    callbacks.onEvent?.({ label: "json response", raw: json, text, sequence: 1 });
    if (toolCalls.length) callbacks.onToolCall?.(toolCalls, { partial: false });
    if (text) callbacks.onDelta?.(text, text);
    callbacks.onMetrics?.(metrics(callbacks.context, text, json.usage));
    return { text, json, toolCalls, usage: json.usage || null };
  }

  async readStream(response, callbacks = {}) {
    const reader = response.body.getReader();
    let fullText = "", fullReasoning = "", fullTools = [], eventSeq = 0, lastVisibleToolKey = "";
    const nextEvent = (label, raw) => callbacks.onEvent?.({ label, raw, sequence: ++eventSeq });
    const result = await readSSEStream(reader, this.provider.id, {
      onData: data => nextEvent("sse data", data),
      onChunk: (chunk, rawFull) => { fullText = rawFull; const visible = stripLiveThinking(rawFull); callbacks.onDelta?.(stripLiveThinking(chunk), visible); callbacks.onMetrics?.(metrics(callbacks.context, visible, null)); },
      onReasoning: (chunk, full) => { fullReasoning = full; callbacks.onReasoning?.(chunk, full); },
      onToolCall: (tools, meta) => { fullTools = tools; callbacks.onToolCall?.(tools, meta || { partial: true }); lastVisibleToolKey = emitCompleteTools(tools, lastVisibleToolKey, callbacks); },
      onMeta: meta => { if (meta.finishReason || meta.usage) nextEvent(meta.finishReason ? "finish/meta" : "usage/meta", meta); callbacks.onMetrics?.(metrics(callbacks.context, stripLiveThinking(fullText), meta.usage, meta)); },
      onError: error => { throw error instanceof Error ? error : new Error(JSON.stringify(error)); }
    });
    const text = stripLiveThinking(fullText || result.text || "");
    const tools = completeToolCalls(fullTools.length ? fullTools : result.tools || []);
    callbacks.onMetrics?.(metrics(callbacks.context, text, result.usage, result));
    return { text, reasoning: fullReasoning || result.reasoning, toolCalls: tools, tools, usage: result.usage || null, finishReason: result.finishReason || null };
  }

  async error(response) {
    const text = await response.text().catch(() => response.statusText);
    const error = new Error(`${this.provider.name} error ${response.status}: ${text}`);
    error.status = response.status;
    error.responseBody = text;
    return error;
  }
}

export function completeToolCalls(tools = []) { return tools.filter(isCompleteToolCall).map(tool => ({ ...tool, function: { ...tool.function } })); }
export function stripLiveThinking(text = "") { return String(text || "").replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<\/think>/gi, "").replace(/<think>[\s\S]*$/i, "").trimStart(); }
function emitCompleteTools(tools, lastKey, callbacks) { const complete = completeToolCalls(tools); const key = stableToolKey(complete); if (complete.length && key !== lastKey) callbacks.onToolCall?.(complete, { partial: false, assembled: true }); return complete.length ? key : lastKey; }
function isCompleteToolCall(tool = {}) { const name = String(tool.function?.name || tool.name || "").trim(); if (!name) return false; const rawArgs = tool.function?.arguments ?? tool.arguments ?? "{}"; if (typeof rawArgs !== "string") return true; const text = rawArgs.trim(); if (!text) return false; try { JSON.parse(text); return true; } catch { return false; } }
function stableToolKey(tools = []) { return tools.map(tool => `${tool.id || ""}:${tool.function?.name || ""}:${tool.function?.arguments || ""}`).join("|"); }
function metrics(context = {}, output = "", usage = null, meta = {}) { const base = context.metrics || {}; const outputTokens = usage?.completion_tokens || estimateTokens(output); const promptTokens = usage?.prompt_tokens || base.promptTokens || 0; const totalTokens = usage?.total_tokens || promptTokens + outputTokens; return { ...base, ...meta, usage, outputTokens, promptTokens, totalTokens, percent: base.contextWindow ? Math.min(100, Math.round((totalTokens / base.contextWindow) * 100)) : 0 }; }
function safeFetch(fetchImpl) { if (typeof fetchImpl === "function") return fetchImpl.bind?.(globalThis) || fetchImpl; if (typeof globalThis.fetch === "function") return globalThis.fetch.bind(globalThis); throw new Error("No fetch implementation is available for this provider."); }
