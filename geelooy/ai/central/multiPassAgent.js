// B"H
import { parseFallbackToolCalls, normalizeNativeToolCalls } from "./toolCallParser.js";
import { providerStreamEvent, reasoningEvent, statusEvent, toolCallEvent, toolResultEvent } from "./providerEvents.js";

/**
 * B"H
 * Chapter 184: The Tool Round Did Not Silence The River.
 *
 * Tool rounds may be many, and any single tool may fail, but raw provider SSE,
 * reasoning, native tool calls, tunnel calls, tunnel results, and final letters
 * still stream outward as they occur. The Awtsmoos lets no event wait in exile.
 */
export class MultiPassToolAgent {
  constructor({ client, bridge, providerId = "provider", maxRounds = 6, emitEvent = null } = {}) {
    this.client = client;
    this.bridge = bridge;
    this.providerId = providerId;
    this.maxRounds = maxRounds;
    this.emitEvent = emitEvent || (() => {});
  }

  async run({ prompt, messages, model, stream = true, signal, onDelta, onMetrics } = {}) {
    const history = Array.isArray(messages) ? [...messages] : [{ role: "user", content: this.instructions(prompt) }];
    const trace = [];
    let final = null;
    for (let round = 0; round < this.maxRounds; round++) {
      this.assertAlive(signal);
      const response = await this.round({ history, model, stream, signal, onDelta, onMetrics, tools: this.bridge.schemas() });
      const calls = this.callsFrom(response);
      trace.push({ round, text: response.text || "", calls });
      if (!calls.length) { final = response; break; }
      history.push(this.assistantMessage(response, calls));
      for (const call of calls) history.push(await this.toolMessage(call));
    }
    if (!final) final = await this.forceFinal({ history, model, stream, signal, onDelta, onMetrics, trace });
    return { ok: !!final, text: final?.text || "", final, trace, rounds: trace.length };
  }

  async round({ history, model, stream, signal, onDelta, onMetrics, tools }) {
    return await this.client.complete({
      messages: history,
      model,
      tools,
      stream,
      signal,
      onMetrics,
      onDelta: stream ? onDelta : null,
      onEvent: event => this.emitEvent(providerStreamEvent(event, this.providerId)),
      onReasoning: (_chunk, full) => this.emitEvent(reasoningEvent(full, this.providerId)),
      onToolCall: tools => tools.forEach(tool => this.emitEvent(toolCallEvent(this.normalizeOne(tool), this.providerId)))
    });
  }

  async forceFinal({ history, model, stream, signal, onDelta, onMetrics, trace }) {
    this.emitEvent(statusEvent("Tool round limit reached; asking provider for a final visible answer.", { message: "Tool round limit reached." }, this.providerId));
    const finalPrompt = { role: "user", content: "B'H now give the final visible answer from the tool results above. Do not call more tools." };
    const response = await this.client.complete({
      messages: [...history, finalPrompt],
      model,
      tools: [],
      stream,
      signal,
      onMetrics,
      onDelta: stream ? onDelta : null,
      onEvent: event => this.emitEvent(providerStreamEvent(event, this.providerId)),
      onReasoning: (_chunk, full) => this.emitEvent(reasoningEvent(full, this.providerId))
    });
    trace.push({ round: "final", text: response.text || "", calls: [] });
    return response;
  }

  instructions(prompt = "") {
    return `${prompt}\n\nB'H TOOL PROTOCOL: Prefer native tool_calls. If unavailable, respond only with JSON: {"awtsmoos_tool_calls":[{"name":"tool_name","arguments":{}}]}. After tool results, answer normally.`;
  }

  callsFrom(response = {}) {
    const native = normalizeNativeToolCalls(response.toolCalls || response.json?.choices?.[0]?.message?.tool_calls || []);
    return native.length ? native : parseFallbackToolCalls(response.text || "");
  }

  assistantMessage(response = {}, calls = []) {
    const message = response.json?.choices?.[0]?.message;
    if (message?.tool_calls?.length) return message;
    return { role: "assistant", content: response.text || "", tool_calls: calls.map(call => ({ id: call.id, type: "function", function: { name: call.name, arguments: JSON.stringify(call.arguments || {}) } })) };
  }

  async toolMessage(call) {
    this.emitEvent(toolCallEvent(call, this.providerId));
    const result = await this.safeToolResult(call);
    this.emitEvent(toolResultEvent(call, result, this.providerId));
    return { role: "tool", tool_call_id: call.id, name: call.name, content: JSON.stringify(result) };
  }

  async safeToolResult(call) {
    try { return await this.bridge.call(call.name, call.arguments || {}); }
    catch (error) { return { ok: false, action: call.name, error: error?.message || String(error), stack: error?.stack || "" }; }
  }

  normalizeOne(tool = {}) {
    return normalizeNativeToolCalls([tool])[0] || tool;
  }

  assertAlive(signal) {
    if (signal?.aborted) throw new DOMException("Stream stopped by user", "AbortError");
  }
}
