//B"H

/**
 * Chapter 1: The Empty Husk Was Not Counted As A Soul.
 *
 * Thought chambers should count only useful inner sparks. Timeout notices,
 * stream-complete status packets, and blank transport husks are diagnostics for
 * the outer system, not a mysterious "1 inner event" for the reader to open.
 *
 * @param {Array<object>} inner Raw grouped inner events.
 * @returns {Array<object>} Events worth showing inside a thought chamber.
 */
export function usefulInnerEvents(inner = []) {
  return inner.filter(isUsefulInnerEvent);
}

function isUsefulInnerEvent(event = {}) {
  const raw = event.raw || event || {};
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  const text = String(event.text || raw.text || raw.dataNoJSON || content.text || (Array.isArray(content.parts) ? content.parts.join(" ") : "") || "").trim();
  const label = String(event.label || raw.type || raw.event || content.content_type || "");
  if (/stream complete|message_stream_complete|conversation-turn-complete/i.test(label + " " + text)) return false;
  if (/Awtsmoos extension fetch timed out|extension fetch timed out|request error/i.test(text)) return false;
  if (!text && !event.action?.href && !msg.recipient && !raw.recipient && !raw.name && !raw.id && !msg.id) return false;
  return true;
}
