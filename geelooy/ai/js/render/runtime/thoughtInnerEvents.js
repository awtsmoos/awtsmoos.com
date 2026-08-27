//B"H
import { usefulInnerEvents } from "./innerEventFilter.js";

/**
 * Chapter 2: The Inner Sparks Were Counted By One Honest Court.
 *
 * Live thought rendering and lazy hydration must see the same usable timeline.
 * When each path invents its own filter, the opened thought bubble can claim no
 * useful inner events while the live stream plainly has tools or thoughts. This
 * module is the shared gate: extract real sparks first, then remove diagnostic
 * husks, preserving original order.
 *
 * @param {Array<object>} inner Raw thought-envelope events.
 * @returns {Array<object>} Displayable inner events in original stream order.
 */
export function displayableThoughtInnerEvents(inner = []) {
  return usefulInnerEvents(realThoughtInnerEvents(inner));
}

/**
 * @param {Array<object>} inner Raw thought-envelope events.
 * @returns {Array<object>} Non-empty raw inner events in original stream order.
 */
export function realThoughtInnerEvents(inner = []) {
  return (Array.isArray(inner) ? inner : []).filter(hasInnerFire);
}

function hasInnerFire(event = {}) {
  const raw = event?.raw || event || {};
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  const parts = Array.isArray(content.parts) ? content.parts.join(" ") : "";
  const text = String(event?.text || raw.text || raw.dataNoJSON || content.text || parts || "").trim();
  return Boolean(text || event?.action?.href || msg.recipient || raw.recipient || raw.name);
}
