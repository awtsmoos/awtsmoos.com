//B"H
import { extractEventText, findFirstUrl, visibleContentText } from "./textExtractors.js";
import { isToolCallSignal, isToolResultSignal, toolLabel } from "./toolSignals.js";

const DEDUP_NOISE = /delta_encoding|server_ste_metadata|conversation_detail_metadata|moderation_response/i;
const STATUS = /status|resume|conversation-turn-complete|title_generation|message_stream_complete|message_marker|input_message/i;

export function classifyTransportEvent(event) {
  const raw = event?.data || event;
  const message = raw?.message || raw?.input_message || raw;
  const content = message?.content || raw?.content || {};
  const metadata = message?.metadata || raw?.metadata || {};
  const type = content?.content_type || raw?.type || event?.event || "raw";
  const channel = message?.channel || raw?.channel;
  if (isVisibleConversationMessage(message, content)) return null;
  if (isDedupNoise(raw, type, metadata)) return null;
  if (raw?.dataNoJSON === "[DONE]") return capsule("status", "Stream complete", raw, "Stream complete.");
  if (isToolResultSignal(raw, message)) return capsule(toolKind(raw, message, "result"), toolLabel(raw, message), raw, extractEventText(raw));
  if (isToolCallSignal(raw, message)) return capsule(toolKind(raw, message, "call"), toolLabel(raw, message), raw, extractEventText(raw));
  if (isAssistantToolMarker(message, content)) return null;
  if (isEmptyThinkingStatus(message, content, metadata, type, channel)) return null;
  if (isThinking(metadata, type, channel)) return capsule("thinking", thinkingLabel(metadata, channel), raw, extractEventText(raw));
  if (metadata.is_visually_hidden_from_conversation) return capsule("hidden", "Hidden message", raw, extractEventText(raw));
  if (looksLikeOAuth(raw)) return oauthCapsule(raw);
  if (STATUS.test(String(type || raw?.type || raw?.event || ""))) return capsule("status", raw.type || raw.event || type, raw, extractEventText(raw));
  return capsule("raw", raw.type || raw.event || type || "raw", raw, extractEventText(raw));
}

export function isTransportEvent(input) {
  const raw = input?.data || input;
  const message = raw?.message || raw?.input_message || raw;
  const content = message?.content || raw?.content || {};
  const metadata = message?.metadata || raw?.metadata || {};
  const type = content?.content_type || raw?.type || input?.event;
  const channel = message?.channel || raw?.channel;
  if (isVisibleConversationMessage(message, content)) return false;
  return Boolean(raw?.data || raw?.event || raw?.dataNoJSON || channel === "analysis" || metadata.is_thinking_preamble_message || metadata.is_visually_hidden_from_conversation || metadata.reasoning_status || isToolCallSignal(raw, message) || isToolResultSignal(raw, message) || /status|resume|delta_encoding|conversation-turn-complete|thoughts|message_marker|server_ste_metadata|conversation_detail_metadata|title_generation|input_message/i.test(String(type || "")));
}

export function isVisibleConversationMessage(message = {}, content = message.content || {}) {
  const type = content?.content_type;
  const role = message?.author?.role || message?.role;
  const recipient = message?.recipient;
  const channel = message?.channel;
  const metadata = message?.metadata || {};
  if (metadata.is_thinking_preamble_message || metadata.reasoning_status) return false;
  if (recipient && recipient !== "all") return false;
  if (channel === "analysis") return false;
  if (!["assistant", "user", "model", undefined].includes(role)) return false;
  if (!["text", "multimodal_text", "code", undefined].includes(type)) return false;
  return Boolean(visibleContentText(content));
}

function isEmptyThinkingStatus(message = {}, content = {}, metadata = {}, type = "", channel = "") {
  if (!isThinking(metadata, type, channel)) return false;
  if (extractEventText(message || {}).trim() || extractEventText({ content }).trim()) return false;
  if (Array.isArray(content.thoughts) && content.thoughts.length > 0) return false;
  if (type === "thoughts") return true;
  return Boolean(metadata.reasoning_status) && !metadata.is_thinking_preamble_message;
}

function capsule(kind, label, raw, text = "") {
  return { kind, label, raw: compactEventRaw(raw), text: text || "", order: eventOrder(raw) };
}

/**
 * B"H — turns provider thunder into a small diagnostic fossil.
 *
 * Event UI needs shape, ids, type, and a few meaningful fields. It does not need
 * to retain the entire streamed provider packet, because those packets can carry
 * nested messages, tool bodies, and extension envelopes large enough to pin the
 * page. The Awtsmoos lets the meaning remain while the heavy husk falls away.
 *
 * @param {*} raw Provider/transport event.
 * @returns {object|null} Compact raw event summary.
 */
function compactEventRaw(raw) {
  if (!raw || typeof raw !== "object") return raw ?? null;
  const msg = raw.message || raw.input_message || raw.data?.message || null;
  const content = msg?.content || raw.content || {};
  const metadata = msg?.metadata || raw.metadata || {};
  return {
    type: raw.type || raw.event || content.content_type || null,
    id: raw.id || msg?.id || raw.data?.id || null,
    role: msg?.author?.role || msg?.role || null,
    channel: msg?.channel || raw.channel || null,
    recipient: msg?.recipient || raw.recipient || null,
    content_type: content.content_type || null,
    metadata: compactMetadata(metadata),
    keys: Object.keys(raw).slice(0, 16)
  };
}

function compactMetadata(metadata = {}) {
  const keep = ["request_id", "turn_exchange_id", "reasoning_status", "is_thinking_preamble_message", "is_visually_hidden_from_conversation", "command", "aggregate_result"];
  return Object.fromEntries(keep.filter(key => metadata[key] !== undefined).map(key => [key, metadata[key]]));
}
function eventOrder(raw = {}) {
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const metadata = msg.metadata || raw.metadata || {};
  const direct = raw.__awtsmoosHistoryIndex ?? msg.__awtsmoosHistoryIndex ?? metadata.__awtsmoosHistoryIndex;
  if (Number.isFinite(Number(direct))) return Number(direct);
  const time = msg.create_time ?? raw.create_time ?? metadata.create_time;
  if (Number.isFinite(Number(time))) return Number(time) * 1000;
  return Number.MAX_SAFE_INTEGER;
}
function isAssistantToolMarker(message = {}, content = {}) {
  const text = visibleContentText(content).trim();
  if (text) return false;
  if (message.recipient === "assistant") return true;
  const pendingTool = message.status === "in_progress"
    && message.recipient
    && message.recipient !== "all"
    && ["analysis", "commentary"].includes(message.channel);
  return Boolean(pendingTool);
}
function toolKind(raw, message, fallback) {
  const label = toolLabel(raw, message);
  if (/awtsmoos|tunnel|jit_plugin/i.test(label)) return fallback === "result" ? "awtsmoos_tool_result" : "awtsmoos_tool";
  return fallback === "result" ? "tool_result" : "agent_tool";
}
function isThinking(metadata, type, channel) { return metadata.is_thinking_preamble_message || type === "thoughts" || metadata.reasoning_status || channel === "analysis"; }
function thinkingLabel(metadata, channel) { return metadata.reasoning_status || (channel === "analysis" ? "Analysis" : "Thinking"); }
function oauthCapsule(raw) { const href = findFirstUrl(raw); return { kind: "oauth", label: "Sign-in / OAuth", raw: compactEventRaw(raw), text: "", action: href ? { href, label: "Open sign-in" } : null }; }
function looksLikeOAuth(raw) { try { return /oauth|sign.?in|login|authorization/i.test(JSON.stringify(raw).slice(0, 3000)); } catch { return false; } }
function isDedupNoise(raw, type, metadata) { return !metadata?.reasoning_status && DEDUP_NOISE.test(String(type || raw?.type || "")); }
