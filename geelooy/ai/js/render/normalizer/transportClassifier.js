//B"H
import { extractEventText, findFirstUrl } from "./textExtractors.js";
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
  if (isThinking(metadata, type, channel)) return capsule("thinking", thinkingLabel(metadata, channel), raw, extractEventText(raw));
  if (metadata.is_visually_hidden_from_conversation) return capsule("hidden", "Hidden message", raw, extractEventText(raw));
  if (isToolCallSignal(raw, message)) return capsule("tool_call", toolLabel(raw, message), raw, extractEventText(raw));
  if (isToolResultSignal(raw, message)) return capsule("tool_result", toolLabel(raw, message), raw, extractEventText(raw));
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
  if (recipient && recipient !== "all") return false;
  if (channel === "analysis") return false;
  if (!["assistant", "user", "model", undefined].includes(role)) return false;
  if (!["text", "multimodal_text", undefined].includes(type)) return false;
  return Boolean((Array.isArray(content.parts) && content.parts.length) || typeof content.text === "string");
}

function capsule(kind, label, raw, text = "") { return { kind, label, raw, text: text || "" }; }
function isThinking(metadata, type, channel) { return metadata.is_thinking_preamble_message || type === "thoughts" || metadata.reasoning_status || channel === "analysis"; }
function thinkingLabel(metadata, channel) { return metadata.reasoning_status || (channel === "analysis" ? "Analysis" : "Thinking"); }
function oauthCapsule(raw) { const href = findFirstUrl(raw); return { kind: "oauth", label: "Sign-in / OAuth", raw, text: "", action: href ? { href, label: "Open sign-in" } : null }; }
function looksLikeOAuth(raw) { try { return /oauth|sign.?in|login|authorization/i.test(JSON.stringify(raw).slice(0, 3000)); } catch { return false; } }
function isDedupNoise(raw, type, metadata) { return !metadata?.reasoning_status && DEDUP_NOISE.test(String(type || raw?.type || "")); }
