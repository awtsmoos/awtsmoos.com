// B"H
/**
 * @file stream-client.js
 * @brief Shared SSE streaming client — usable in browser and Node.js.
 *
 * CHAPTER 182: THE RIVER REPORTED EVERY DROP BEFORE IT JOINED THE SEA.
 */

export function parseSSEDataLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === "data:[DONE]" || trimmed === "data: [DONE]") return null;
  if (!trimmed.startsWith("data:")) return null;
  try { return JSON.parse(trimmed.replace(/^data:\s*/, "")); }
  catch (_) { return null; }
}

export function extractReasoningDelta(delta = {}) {
  if (delta.reasoning) return delta.reasoning;
  if (delta.reasoning_content) return delta.reasoning_content;
  if (!Array.isArray(delta.reasoning_details)) return "";
  return delta.reasoning_details.map(part => part?.text || "").join("");
}

/**
 * B"H
 * Reads provider SSE into text, reasoning, tool deltas, usage, finish state, and
 * now raw parsed SSE data callbacks. The Awtsmoos gives every packet a witness.
 *
 * @param {ReadableStreamDefaultReader} reader Response body reader.
 * @param {string} providerId Provider label for diagnostics.
 * @param {object} callbacks Stream callbacks.
 * @param {Function|null} reasoningExtractor Optional reasoning extractor.
 * @returns {Promise<object>} Final stream summary.
 */
export async function readSSEStream(reader, providerId, callbacks = {}, reasoningExtractor = null) {
  const state = createStreamState(providerId, callbacks, reasoningExtractor);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    state.receive(value);
  }
  state.flushTail();
  return state.complete();
}

function createStreamState(providerId, callbacks, reasoningExtractor) {
  const decoder = new TextDecoder();
  const toolAssembler = new ToolCallAssembler();
  const state = {
    providerId,
    callbacks,
    reasoningExtractor,
    text: "",
    reasoning: "",
    buffer: "",
    usage: null,
    finishReason: null,
    active: false,
    receive(value) {
      if (!this.active) { this.active = true; this.callbacks.onActive?.(); }
      this.buffer += decoder.decode(value, { stream: true });
      const lines = this.buffer.split(/\r?\n/);
      this.buffer = lines.pop() || "";
      lines.forEach(line => this.handleLine(line));
    },
    flushTail() { if (this.buffer.trim()) this.handleLine(this.buffer); this.buffer = ""; },
    handleLine(line) {
      const data = parseSSEDataLine(line);
      if (!data) return;
      this.callbacks.onData?.(data);
      if (data.error) return this.callbacks.onError?.(data.error);
      this.usage = data.usage || this.usage;
      const choice = data.choices?.[0] || {};
      this.finishReason = choice.finish_reason || this.finishReason;
      const delta = choice.delta || {};
      this.handleText(delta);
      this.handleReasoning(delta);
      this.handleTools(delta, toolAssembler);
      this.callbacks.onMeta?.(this.metrics());
    },
    handleText(delta) {
      if (!delta.content) return;
      this.text += delta.content;
      this.callbacks.onChunk?.(delta.content, this.text);
    },
    handleReasoning(delta) {
      const fn = this.reasoningExtractor || extractReasoningDelta;
      const value = fn(delta);
      if (!value) return;
      this.reasoning += value;
      this.callbacks.onReasoning?.(value, this.reasoning);
    },
    handleTools(delta, assembler) {
      if (!Array.isArray(delta.tool_calls)) return;
      const calls = assembler.accept(delta.tool_calls);
      this.callbacks.onToolCall?.(calls, { partial: true });
    },
    metrics() {
      return { providerId: this.providerId, usage: this.usage, finishReason: this.finishReason, toolCalls: toolAssembler.calls(), textChars: this.text.length, reasoningChars: this.reasoning.length };
    },
    complete() {
      const tools = toolAssembler.calls();
      this.callbacks.onComplete?.(this.text, this.reasoning, tools, this.metrics());
      return { text: this.text, reasoning: this.reasoning, tools, usage: this.usage, finishReason: this.finishReason };
    }
  };
  return state;
}

class ToolCallAssembler {
  constructor() { this.slots = []; }
  accept(toolDeltas = []) {
    toolDeltas.forEach(delta => this.merge(delta));
    return this.calls();
  }
  merge(delta = {}) {
    const index = Number.isInteger(delta.index) ? delta.index : this.slots.length;
    const current = this.slots[index] || this.empty(delta);
    if (delta.id) current.id = delta.id;
    if (delta.type) current.type = delta.type;
    if (delta.function?.name) current.function.name = delta.function.name;
    if (typeof delta.function?.arguments === "string") current.function.arguments += delta.function.arguments;
    this.slots[index] = current;
  }
  empty(delta = {}) {
    return { id: delta.id || `call_${Math.random().toString(36).slice(2)}`, type: delta.type || "function", function: { name: delta.function?.name || "", arguments: delta.function?.arguments || "" } };
  }
  calls() { return this.slots.filter(Boolean).map(call => ({ ...call, function: { ...call.function } })); }
}
