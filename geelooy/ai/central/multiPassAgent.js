// B"H
import { parseFallbackToolCalls, normalizeNativeToolCalls } from "./toolCallParser.js";
import { reasoningEvent, statusEvent, toolCallEvent, toolResultEvent } from "./providerEvents.js";

const TOOL_WARN_MS = 1200;
const TOOL_TIMEOUT_MS = 18000;

/**
 * B"H
 * Chapter 226: The Provisional Word Was Spoken Once, In Its True Place.
 *
 * Visible text inside a tool-enabled provider round is held until its destiny is
 * known. If a tool appears, it becomes one chronological thought before that
 * tool group. If no tool appears, it becomes the final answer. It is never both.
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
      const response = await this.round({ round, history, model, stream, signal, onMetrics });
      const calls = this.callsFrom(response);
      this.flushPreToolText(response, calls, round);
      trace.push({ round, text: response.text || "", calls });
      if (!calls.length) { final = response; break; }
      history.push(this.assistantMessage(response, calls));
      for (const call of calls) history.push(await this.toolMessage(call, signal));
    }
    if (!final) final = await this.forceFinal({ history, model, stream, signal, onDelta, onMetrics, trace });
    return { ok: !!final, text: final?.text || "", final, trace, rounds: trace.length };
  }

  async round({ round, history, model, stream, signal, onMetrics }) {
    const segment = `round-${round}`;
    const vessel = { text: "", emittedPreToolText: false, sawTool: false };
    const response = await this.client.complete({
      messages: history,
      model,
      tools: this.bridge.schemas(),
      stream,
      signal,
      onMetrics,
      onDelta: stream ? (_delta, fullText) => this.captureRoundText(vessel, segment, fullText) : null,
      onReasoning: (_chunk, full) => this.emitEvent(reasoningEvent(full, this.providerId, `${segment}:reasoning`)),
      onToolCall: tools => this.captureToolCalls(vessel, segment, tools)
    });
    response.awtsmoosRoundVessel = vessel;
    return response;
  }

  captureRoundText(vessel, segment, fullText) {
    vessel.text = String(fullText || "");
    if (!vessel.sawTool) return;
    this.emitEvent(reasoningEvent(vessel.text, this.providerId, `${segment}:visible-after-tools`));
  }

  captureToolCalls(vessel, segment, tools = []) {
    if (!vessel.sawTool && String(vessel.text || "").trim()) {
      vessel.emittedPreToolText = true;
      this.emitEvent(reasoningEvent(vessel.text, this.providerId, `${segment}:visible-before-tools`));
    }
    vessel.sawTool = true;
    tools.forEach(tool => this.emitEvent(toolCallEvent(this.normalizeOne(tool), this.providerId)));
  }

  flushPreToolText(response = {}, calls = [], round = 0) {
    const vessel = response.awtsmoosRoundVessel || {};
    if (!calls.length || vessel.emittedPreToolText) return;
    if (!String(response.text || "").trim()) return;
    this.emitEvent(reasoningEvent(response.text, this.providerId, `round-${round}:visible-before-tools`));
  }

  async forceFinal({ history, model, stream, signal, onDelta, onMetrics, trace }) {
    this.emitEvent(statusEvent("Tool round limit reached; asking provider for final answer.", { message: "Tool round limit reached." }, this.providerId));
    const finalPrompt = { role: "user", content: "B'H now give the final visible answer from the tool results above. Do not call more tools." };
    const response = await this.client.complete({
      messages: [...history, finalPrompt], model, tools: [], stream, signal, onMetrics, onDelta: stream ? onDelta : null,
      onReasoning: (_chunk, full) => this.emitEvent(reasoningEvent(full, this.providerId, "final:reasoning"))
    });
    trace.push({ round: "final", text: response.text || "", calls: [] });
    return response;
  }

  instructions(prompt = "") {
    return `${prompt}\n\nB'H TOOL PROTOCOL: Use direct essential tool calls when available. For rare actions, call awtsmoos_tool_details, then awtsmoos_tool_call with {name, arguments}. If native tool_calls are unavailable, respond only with JSON: {"awtsmoos_tool_calls":[{"name":"tool_name","arguments":{}}]}. After tool results, answer normally.`;
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

  async toolMessage(call, signal) {
    this.emitEvent(toolCallEvent(call, this.providerId));
    const result = await this.safeToolResult(call, signal);
    this.emitEvent(toolResultEvent(call, result, this.providerId));
    return { role: "tool", tool_call_id: call.id, name: call.name, content: JSON.stringify(result) };
  }

  async safeToolResult(call, signal) {
    const pending = setTimeout(() => this.emitEvent(statusEvent(`Still running tool: ${call.name}`, { message: `Still running ${call.name}…`, call }, this.providerId)), TOOL_WARN_MS);
    try { return await withToolTimeout(this.bridge.call(call.name, call.arguments || {}), call, signal); }
    catch (error) { return { ok: false, action: call.name, timedOut: /timed out/i.test(error?.message || ""), error: error?.message || String(error), stack: error?.stack || "" }; }
    finally { clearTimeout(pending); }
  }

  normalizeOne(tool = {}) { return normalizeNativeToolCalls([tool])[0] || tool; }
  assertAlive(signal) { if (signal?.aborted) throw new DOMException("Stream stopped by user", "AbortError"); }
}

function withToolTimeout(promise, call, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Stream stopped by user", "AbortError"));
    const timer = setTimeout(() => reject(new Error(`Tool ${call.name || call.id || "tool"} timed out after ${TOOL_TIMEOUT_MS / 1000}s.`)), TOOL_TIMEOUT_MS);
    const abort = () => reject(new DOMException("Stream stopped by user", "AbortError"));
    signal?.addEventListener?.("abort", abort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => { clearTimeout(timer); signal?.removeEventListener?.("abort", abort); });
  });
}
