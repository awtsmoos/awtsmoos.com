//B"H
import { classifyTransportEvent } from "./messageNormalizer.js";
import { isVisibleConversationMessage } from "./normalizer/transportClassifier.js";

const TRANSPORT_TYPES = /resume_conversation_token|message_marker|server_ste_metadata|conversation_detail_metadata|message_stream_complete|input_message|delta_encoding|conversation-turn-complete|status/i;

export function interpretStreamPacket(packet) {
  const text = extractVisibleText(packet);
  const event = text ? null : extractTransport(packet);
  return { text, event };
}

export function mergeStreamText(previous = "", next = "") {
  previous = String(previous || "");
  next = String(next || "");
  if (!next) return previous;
  if (!previous || next.startsWith(previous)) return next;
  if (previous.endsWith(next) || previous.includes(next)) return previous;
  const overlap = longestSuffixPrefix(previous, next, 12000);
  return overlap ? previous + next.slice(overlap) : previous + next;
}

function extractVisibleText(packet) {
  if (typeof packet === "string") return packet;
  const raw = packet?.data || packet;
  const message = raw?.message || raw?.input_message || packet?.message || packet?.input_message;
  if (!message || !isVisibleConversationMessage(message, message.content || {})) return "";
  return contentText(message.content || {});
}

function extractTransport(packet) {
  if (!packet || typeof packet === "string") return null;
  if (packet.dataNoJSON === "[DONE]" || packet?.data?.dataNoJSON === "[DONE]") return { kind: "status", label: "Stream complete", raw: packet, text: "Stream complete." };
  const raw = packet?.data || packet;
  const type = String(raw?.type || packet?.type || packet?.event || raw?.message?.content?.content_type || "");
  const event = classifyTransportEvent(packet);
  if (!event) return null;
  if (event.kind === "raw" && !TRANSPORT_TYPES.test(type) && !packet?.event) return null;
  return event;
}

function contentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(partText).filter(Boolean).join("\n");
  return typeof content.text === "string" ? content.text : "";
}

function partText(part) {
  if (typeof part === "string") return part;
  return part?.text || part?.summary || "";
}

function longestSuffixPrefix(left, right, max) {
  const limit = Math.min(max, left.length, right.length);
  for (let size = limit; size > 0; size--) if (left.slice(-size) === right.slice(0, size)) return size;
  return 0;
}
