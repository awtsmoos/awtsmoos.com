// B"H
let PROVIDER_EVENT_SEQUENCE = 0;

/**
 * B"H
 * Chapter 220: Each Thought Received Its Own Chamber In Time.
 *
 * A provider round can grow one thought card, but after a tool group the next
 * reasoning stream must become a new thought card. The Awtsmoos therefore gives
 * every event a birth order and lets callers name the active thought segment.
 */
export function providerEvent(kind, label, raw = {}, text = "") {
  const sequence = ++PROVIDER_EVENT_SEQUENCE;
  return {
    kind,
    label,
    text,
    order: Date.now() * 1000 + sequence,
    raw: { providerEvent: true, providerSequence: sequence, ...raw }
  };
}

export function reasoningEvent(text = "", providerId = "provider", segmentKey = "default") {
  const cleanSegment = String(segmentKey || "default");
  return providerEvent("thinking", `${providerId} live thinking`, {
    type: "provider_reasoning",
    providerId,
    standaloneThoughtText: true,
    streamKey: `${providerId}:reasoning:${cleanSegment}`,
    segmentKey: cleanSegment
  }, text);
}

export function providerStreamEvent(event = {}, providerId = "provider") {
  const compact = compactProviderEvent(event);
  return providerEvent("provider_stream", `${providerId} stream · ${compact.label}`, {
    type: "provider_stream",
    providerId,
    packet: compact
  }, compact.text);
}

export function toolCallEvent(call = {}, providerId = "provider") {
  const name = call.name || call.function?.name || call.id || "tool";
  return providerEvent("tool_call", `${providerId} tool call · ${name}`, {
    type: "tool_call",
    providerId,
    tool_call_id: call.id || `${name}:${safeString(call.arguments || call.function?.arguments || {})}`,
    call,
    request: call.arguments || call.function?.arguments || {}
  }, JSON.stringify(call.arguments || call.function?.arguments || {}, null, 2));
}

export function toolResultEvent(call = {}, result = {}, providerId = "provider") {
  const name = call.name || call.function?.name || call.id || "tool";
  return providerEvent("tool_result", `${providerId} tool result · ${name}`, {
    type: "tool_result",
    providerId,
    tool_call_id: call.id || `${name}:${safeString(call.arguments || call.function?.arguments || {})}`,
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
