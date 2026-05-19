//B"H
import { classifyTransportEvent, isTransportEvent, isVisibleConversationMessage } from "./normalizer/transportClassifier.js";
import { extractVisibleText, normalizeRole } from "./normalizer/textExtractors.js";

export { classifyTransportEvent } from "./normalizer/transportClassifier.js";

/**
 * B"H — Normalize without erasing parallel truth.
 *
 * A packet may contain both visible final answer text and hidden thinking/tool
 * traces. Visible conversation text remains a bubble; every real event remains
 * a retractable capsule.
 */
export function normalizeMessage(input) {
  if (typeof input === "string") return base("assistant", input, null, input, []);
  const message = input?.message || input?.input_message || input?.data?.message || input;
  const content = message?.content || input?.content || {};
  const role = normalizeRole(message?.author?.role || message?.role || input?.type);
  const id = message?.id || input?.id || input?.data?.id || null;
  const events = collectEvents(input);
  const text = isVisibleConversationMessage(message, content) ? extractVisibleText(message, input) : "";
  return base(role, text, id, input, events);
}

function collectEvents(input) {
  const rawEvents = [];
  if (Array.isArray(input)) rawEvents.push(...input);
  else {
    if (Array.isArray(input?.awtsmoos?.otherEvents)) rawEvents.push(...input.awtsmoos.otherEvents);
    if (isTransportEvent(input)) rawEvents.push(input);
  }
  return rawEvents.map(classifyTransportEvent).filter(Boolean);
}

function base(role, text, id, raw, events) {
  return { role, text: text || "", id, raw, events };
}
