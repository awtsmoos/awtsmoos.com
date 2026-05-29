// B"H
/**
 * @file stream-client.js
 * @brief OpenAI-compatible SSE river parser for MiniMax/Groq/OpenRouter.
 *
 * CHAPTER 232: THE RIVER UNDERSTOOD BOTH STRICT SSE AND BROKEN NEWLINE STREAMS.
 */

export function parseSSEDataLine(line) {
  const block = parseSSEBlock(String(line || ""));
  return block.done ? null : block.json;
}

export function parseSSEBlock(block = "") {
  const data = dataLines(block).join("\n").trim();
  if (!data) return { done: false, json: null, raw: "" };
  if (data === "[DONE]") return { done: true, json: null, raw: data };
  try { return { done: false, json: JSON.parse(data), raw: data }; }
  catch (error) { return { done: false, json: null, raw: data, error }; }
}

export function extractReasoningDelta(delta = {}) {
  if (typeof delta.reasoning === "string") return delta.reasoning;
  if (typeof delta.reasoning_content === "string") return delta.reasoning_content;
  if (typeof delta.thinking === "string") return delta.thinking;
  if (!Array.isArray(delta.reasoning_details)) return "";
  return delta.reasoning_details.map(part => part?.text || part?.content || "").join("");
}

/**
 * B"H
 * Reads stream bytes as real SSE events. It accepts proper blank-line SSE and
 * lenient one-json-per-data-line streams used by tests/proxies.
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
  return {
    providerId, callbacks, reasoningExtractor, toolAssembler,
    text: "", reasoning: "", buffer: "", usage: null, finishReason: null, active: false,
    receive(value) {
      if (!this.active) { this.active = true; callbacks.onActive?.(); }
      this.buffer += decoder.decode(value, { stream: true });
      const parts = this.buffer.split(/\r?\n\r?\n/);
      this.buffer = parts.pop() || "";
      parts.forEach(part => this.handleBlock(part));
    },
    flushTail() { if (this.buffer.trim()) this.handleBlock(this.buffer, true); this.buffer = ""; },
    handleBlock(block, final = false) {
      const parsed = parseSSEBlock(block);
      if (parsed.error && final) return this.handleLooseLines(block);
      if (parsed.done) return callbacks.onDone?.();
      if (parsed.error) return callbacks.onParseError?.({ error: parsed.error, raw: parsed.raw });
      this.handleData(parsed.json);
    },
    handleLooseLines(block) {
      for (const line of String(block || "").split(/\r?\n/).filter(Boolean)) {
        const parsed = parseSSEBlock(line);
        if (parsed.done) callbacks.onDone?.();
        else if (parsed.error) callbacks.onParseError?.({ error: parsed.error, raw: parsed.raw });
        else this.handleData(parsed.json);
      }
    },
    handleData(data) {
      if (!data) return;
      callbacks.onData?.(data);
      if (data.error) return callbacks.onError?.(data.error);
      this.usage = data.usage || this.usage;
      const choices = Array.isArray(data.choices) ? data.choices : [];
      choices.forEach(choice => this.handleChoice(choice));
      callbacks.onMeta?.(this.metrics());
    },
    handleChoice(choice = {}) {
      this.finishReason = choice.finish_reason || this.finishReason;
      const delta = choice.delta || choice.message || {};
      this.handleText(delta);
      this.handleReasoning(delta);
      this.handleTools(delta);
    },
    handleText(delta = {}) {
      const content = contentText(delta.content);
      if (!content) return;
      this.text += content;
      callbacks.onChunk?.(content, this.text);
    },
    handleReasoning(delta = {}) {
      const fn = this.reasoningExtractor || extractReasoningDelta;
      const value = fn(delta);
      if (!value) return;
      this.reasoning += value;
      callbacks.onReasoning?.(value, this.reasoning);
    },
    handleTools(delta = {}) {
      const list = delta.tool_calls || delta.toolCalls || [];
      if (!Array.isArray(list) || !list.length) return;
      callbacks.onToolCall?.(this.toolAssembler.accept(list), { partial: true });
    },
    metrics() { return { providerId, usage: this.usage, finishReason: this.finishReason, toolCalls: this.toolAssembler.calls(), textChars: this.text.length, reasoningChars: this.reasoning.length }; },
    complete() {
      const tools = this.toolAssembler.calls();
      callbacks.onComplete?.(this.text, this.reasoning, tools, this.metrics());
      return { text: this.text, reasoning: this.reasoning, tools, usage: this.usage, finishReason: this.finishReason };
    }
  };
}

function dataLines(block = "") {
  return String(block || "").split(/\r?\n/).filter(line => /^data\s*:/i.test(line)).map(line => line.replace(/^data\s*:\s?/i, ""));
}
function contentText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(part => typeof part === "string" ? part : part?.text || part?.content || "").join("");
  return "";
}

class ToolCallAssembler {
  constructor() { this.slots = []; }
  accept(deltas = []) { deltas.forEach(delta => this.merge(delta)); return this.calls(); }
  merge(delta = {}) {
    const index = Number.isInteger(delta.index) ? delta.index : this.nextIndex(delta);
    const current = this.slots[index] || this.empty(delta);
    if (delta.id) current.id = delta.id;
    if (delta.type) current.type = delta.type;
    if (delta.function?.name) current.function.name = delta.function.name;
    if (typeof delta.function?.arguments === "string") current.function.arguments += delta.function.arguments;
    this.slots[index] = current;
  }
  nextIndex(delta = {}) {
    if (delta.id) {
      const found = this.slots.findIndex(call => call?.id === delta.id);
      if (found >= 0) return found;
    }
    return Math.max(0, this.slots.length - 1);
  }
  empty(delta = {}) { return { id: delta.id || `call_${Math.random().toString(36).slice(2)}`, type: delta.type || "function", function: { name: delta.function?.name || "", arguments: "" } }; }
  calls() { return this.slots.filter(Boolean).map(call => ({ ...call, function: { ...call.function } })); }
}
