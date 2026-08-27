//B"H

const THINKING_BY_STREAM = new Map();

/**
 * Chapter 92: MiniMax Opened The Cave With A Split Flame.
 *
 * OpenAI-compatible providers sometimes send visible answer text, reasoning,
 * and tool-call fragments inside `choices[0].delta`. MiniMax may also mirror
 * reasoning inside `<think>` tags across multiple packets. This interpreter
 * keeps that cave state by stream id so no dangling `</think>` leaks into chat.
 *
 * @param {object} packet Parsed SSE packet from the Awtsmoos river.
 * @returns {Array<object>} Render deltas for text, thinking, tool calls/status.
 */
export function openAiChoiceDeltas(packet = {}) {
  const raw = packet?.data || packet;
  const choice = raw?.choices?.[0];
  if (!choice) return [];
  const delta = choice.delta || choice.message || {};
  const sparks = [];
  const explicitReasoning = reasoningText(delta);
  pushThinking(sparks, explicitReasoning, raw);
  pushContent(sparks, delta.content, raw, !explicitReasoning);
  pushToolCalls(sparks, delta.tool_calls, raw);
  pushFinish(sparks, choice.finish_reason, raw);
  return sparks;
}

function pushContent(sparks, content, raw, emitInlineThinking) {
  for (const part of splitThink(content, streamKey(raw))) {
    if (part.kind === "thinking" && emitInlineThinking) pushThinking(sparks, part.text, raw);
    if (part.kind === "text" && part.text) sparks.push({ kind: "text", text: part.text });
  }
}

function splitThink(content = "", key = "default") {
  let rest = String(content || "");
  if (!rest) return [];
  const parts = [];
  if (THINKING_BY_STREAM.get(key)) rest = closeOpenThinking(parts, rest, key);
  while (rest) {
    const start = rest.search(/<think>/i);
    if (start < 0) return parts.concat({ kind: "text", text: rest });
    if (start) parts.push({ kind: "text", text: rest.slice(0, start) });
    rest = rest.slice(start).replace(/^<think>/i, "");
    rest = closeOpenThinking(parts, rest, key);
  }
  return parts;
}

function closeOpenThinking(parts, rest, key) {
  const end = rest.search(/<\/think>/i);
  if (end < 0) {
    THINKING_BY_STREAM.set(key, true);
    parts.push({ kind: "thinking", text: rest });
    return "";
  }
  THINKING_BY_STREAM.delete(key);
  parts.push({ kind: "thinking", text: rest.slice(0, end) });
  return rest.slice(end).replace(/^<\/think>/i, "");
}

function reasoningText(delta = {}) {
  if (delta.reasoning) return delta.reasoning;
  if (delta.reasoning_content) return delta.reasoning_content;
  if (!Array.isArray(delta.reasoning_details)) return "";
  return delta.reasoning_details.map(part => part?.text || "").join("");
}

function pushThinking(sparks, text, raw) {
  const clean = String(text || "").trim();
  if (!clean) return;
  sparks.push({ kind: "event", event: eventCapsule("thinking", "Reasoning", clean, raw) });
}

function pushToolCalls(sparks, toolCalls, raw) {
  if (!Array.isArray(toolCalls) || !toolCalls.length) return;
  const text = toolCalls.map(call => call.function?.name || call.id || "tool_call").join(", ");
  sparks.push({ kind: "event", event: eventCapsule("agent_tool", "Tool call delta", text, raw) });
}

function pushFinish(sparks, finishReason, raw) {
  if (!finishReason) return;
  THINKING_BY_STREAM.delete(streamKey(raw));
  sparks.push({ kind: "event", event: eventCapsule("status", "Finish reason", String(finishReason), raw) });
}

function eventCapsule(kind, label, text, raw) {
  return { kind, label, text, raw: compactRaw(raw), order: Number.MAX_SAFE_INTEGER };
}

function streamKey(raw = {}) { return raw.id || raw.model || "default"; }

function compactRaw(raw = {}) {
  return {
    type: raw.object || raw.type || "chat.completion.chunk",
    id: raw.id || null,
    role: raw.choices?.[0]?.delta?.role || raw.choices?.[0]?.message?.role || null,
    model: raw.model || null,
    finish_reason: raw.choices?.[0]?.finish_reason || null,
    keys: Object.keys(raw).slice(0, 16)
  };
}
