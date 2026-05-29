// B"H
/**
 * B"H
 * Chapter 185: No Spark Was Allowed To Hide Behind The Old Raw Curtain.
 *
 * OpenAI-compatible providers stream native tool calls, fallback JSON calls,
 * local tunnel requests, raw SSE chunks, finish packets, and local tunnel
 * results. These helpers wrap that fire in event kinds the renderer keeps
 * visible even when generic raw transport noise is hidden by settings.
 */
export function providerEvent(kind, label, raw = {}, text = "") {
  return { kind, label, text, raw: { providerEvent: true, ...raw } };
}

export function reasoningEvent(text = "", providerId = "provider") {
  return providerEvent("thinking", `${providerId} reasoning`, { type: "provider_reasoning", providerId }, text);
}

export function providerStreamEvent(event = {}, providerId = "provider") {
  const compact = compactProviderEvent(event);
  const label = `${providerId} stream · ${compact.label}`;
  return providerEvent("provider_stream", label, { type: "provider_stream", providerId, packet: compact }, compact.text);
}

export function toolCallEvent(call = {}, providerId = "provider") {
  return providerEvent("tool_call", `${providerId} tool call · ${call.name || call.function?.name || call.id || "tool"}`, {
    type: "tool_call",
    providerId,
    tool_call_id: call.id,
    call,
    request: call.arguments || call.function?.arguments || {}
  }, JSON.stringify(call.arguments || call.function?.arguments || {}, null, 2));
}

export function toolResultEvent(call = {}, result = {}, providerId = "provider") {
  return providerEvent("tool_result", `${providerId} tool result · ${call.name || call.function?.name || call.id || "tool"}`, {
    type: "tool_result",
    providerId,
    tool_call_id: call.id,
    call,
    response: result
  }, safeString(result));
}

export function statusEvent(label, raw = {}, providerId = "provider") {
  return providerEvent("status", label, { type: "provider_status", providerId, ...raw }, raw?.message || "");
}

export function normalizeTraceEvents(trace = [], providerId = "provider") {
  const events = [];
  for (const item of trace || []) {
    if (item?.text) events.push(statusEvent(`${providerId} round ${item.round ?? ""}`, { ...item, message: item.text }, providerId));
    for (const call of item?.calls || []) events.push(toolCallEvent(call, providerId));
  }
  return events;
}

function compactProviderEvent(event = {}) {
  const raw = event.raw || event.data || event;
  const choice = raw?.choices?.[0] || {};
  const delta = choice.delta || choice.message || {};
  const text = event.text || delta.reasoning || delta.reasoning_content || delta.content || event.message || "";
  return {
    label: event.label || raw.object || raw.type || event.type || choice.finish_reason || "chunk",
    id: raw.id || event.id || null,
    sequence: event.sequence || null,
    model: raw.model || null,
    object: raw.object || raw.type || null,
    created: raw.created || null,
    finish_reason: choice.finish_reason || raw.finishReason || event.finishReason || null,
    delta_keys: Object.keys(delta || {}),
    usage: raw.usage || event.usage || null,
    text: safeShortText(text),
    tool_calls: Array.isArray(delta.tool_calls) ? delta.tool_calls.length : 0
  };
}

function safeShortText(value) {
  const text = typeof value === "string" ? value : safeString(value);
  return text.length > 4000 ? `${text.slice(0, 4000)}…` : text;
}

function safeString(value) {
  try { return typeof value === "string" ? value : JSON.stringify(value, null, 2); }
  catch { return String(value); }
}
