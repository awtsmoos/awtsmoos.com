//B"H
import { classifyTransportEvent } from "./messageNormalizer.js";
import { isVisibleConversationMessage } from "./normalizer/transportClassifier.js";
import { visibleContentText } from "./normalizer/textExtractors.js";

const TRANSPORT_TYPES = /resume_conversation_token|message_marker|server_ste_metadata|conversation_detail_metadata|message_stream_complete|input_message|delta_encoding|conversation-turn-complete|status/i;

/**
 * Chapter 88: The Last Message Was Crowned In Order.
 *
 * Live packets can hold text, images, file references, hidden markers, or tool
 * thunder. This interpreter keeps visible content as ordered lightweight
 * markdown and leaves transport-only sparks as events. The final answer never
 * loses its tail to a status packet.
 *
 * @param {object|string} packet Incoming provider packet.
 * @returns {{text:string,event:object|null}} Visible text or semantic event.
 */
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
  if (previous.startsWith(next) || previous.endsWith(next) || previous.includes(next)) return previous;
  const overlap = longestSuffixPrefix(previous, next, 12000);
  if (overlap) return previous + next.slice(overlap);
  const stableTail = longestSharedPrefix(previous, next);
  if (stableTail >= Math.min(previous.length, next.length) * 0.8) return next.length > previous.length ? next : previous;
  return previous;
}

function extractVisibleText(packet) {
  if (typeof packet === "string") return packet;
  const raw = packet?.data || packet;
  const message = raw?.message || raw?.input_message || packet?.message || packet?.input_message;
  if (!message || !isVisibleConversationMessage(message, message.content || {})) return "";
  return visibleContentText(message.content || {});
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

function longestSharedPrefix(left, right) {
  const limit = Math.min(left.length, right.length);
  let index = 0;
  while (index < limit && left[index] === right[index]) index++;
  return index;
}

function longestSuffixPrefix(left, right, max) {
  const limit = Math.min(max, left.length, right.length);
  for (let size = limit; size > 0; size--) if (left.slice(-size) === right.slice(0, size)) return size;
  return 0;
}
