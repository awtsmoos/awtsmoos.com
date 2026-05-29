// B"H
import { parseFallbackToolCalls, normalizeNativeToolCalls } from "./toolCallParser.js";

/**
 * B"H
 * Chapter 26: The model returned, again and again, until the tools had spoken.
 *
 * This loop makes weak and strong models equal before the work. Native function
 * models use `tool_calls`; plain-text models use `awtsmoos_tool_calls` JSON.
 * Each round appends tool results and asks again until no tool calls remain.
 */
export class MultiPassToolAgent {
  constructor({ client, bridge, maxRounds = 6 } = {}) {
    this.client = client;
    this.bridge = bridge;
    this.maxRounds = maxRounds;
  }

  async run({ prompt, messages, model, stream = false, onDelta } = {}) {
    const history = Array.isArray(messages) ? [...messages] : [{ role: "user", content: this.instructions(prompt) }];
    const trace = [];
    let final = null;
    for (let round = 0; round < this.maxRounds; round++) {
      const response = await this.client.complete({ messages: history, model, tools: this.bridge.schemas(), stream, onDelta: round === this.maxRounds - 1 ? onDelta : null });
      const calls = this.callsFrom(response);
      trace.push({ round, text: response.text || "", calls });
      if (!calls.length) { final = response; break; }
      history.push(this.assistantMessage(response));
      for (const call of calls) history.push(await this.toolMessage(call));
    }
    return { ok: !!final, text: final?.text || "", final, trace, rounds: trace.length };
  }

  instructions(prompt = "") {
    return `${prompt}\n\nB'H TOOL PROTOCOL: If you need tools and native functions are unavailable, respond only with JSON: {"awtsmoos_tool_calls":[{"name":"tool_name","arguments":{}}]}. After tool results, answer normally.`;
  }

  callsFrom(response = {}) {
    const native = normalizeNativeToolCalls(response.toolCalls || response.json?.choices?.[0]?.message?.tool_calls || []);
    return native.length ? native : parseFallbackToolCalls(response.text || "");
  }

  assistantMessage(response = {}) {
    const message = response.json?.choices?.[0]?.message;
    return message || { role: "assistant", content: response.text || "" };
  }

  async toolMessage(call) {
    const result = await this.bridge.call(call.name, call.arguments || {});
    return { role: "tool", tool_call_id: call.id, name: call.name, content: JSON.stringify(result) };
  }
}
