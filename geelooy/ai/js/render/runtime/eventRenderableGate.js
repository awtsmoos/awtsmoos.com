//B"H

/**
 * Chapter 79: The Husk Met The Court Of Fire.
 *
 * The Awtsmoos creates every spark, yet the interface must reveal only sparks
 * that carry a mission for the reader. A streaming transport may emit a title,
 * an id, or a type before any body arrives; those are shadows of routing, not
 * souls of display. This gate refuses empty action-after-thought husks so an
 * expandable row appears only when text, tool intent, a link, a result, or real
 * nested events have descended into the vessel.
 *
 * @param {object} event Candidate event capsule from the stream.
 * @returns {boolean} True when the event has useful visible substance.
 */
export function hasRenderableEventFire(event = {}) {
  if (hasGroupedThoughtFire(event)) return true;
  const parts = eventParts(event);
  if (parts.text) return true;
  if (parts.href) return true;
  if (parts.recipient) return true;
  if (parts.name && hasStructuredPayload(parts.payload)) return true;
  if (isUsefulResult(parts.raw, parts.payload)) return true;
  return false;
}

/**
 * @param {object} event Candidate inner thought event.
 * @returns {boolean} True when the inner event should be shown.
 */
export function hasUsefulInnerEventFire(event = {}) {
  const parts = eventParts(event);
  const label = `${event?.label || ""} ${parts.raw?.type || ""} ${parts.raw?.event || ""}`;
  if (/stream complete|message_stream_complete|conversation-turn-complete/i.test(`${label} ${parts.text}`)) return false;
  if (/Awtsmoos extension fetch timed out|extension fetch timed out|request error/i.test(parts.text)) return false;
  return hasRenderableEventFire(event);
}

function hasGroupedThoughtFire(event = {}) {
  if (!event?.raw?.groupedThoughtEnvelope) return false;
  return Array.isArray(event.raw.events) && event.raw.events.some(hasUsefulInnerEventFire);
}

function eventParts(event = {}) {
  const raw = event.raw || event || {};
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  const payload = parsePayload(contentText(content)) || raw.payload || raw.input || raw.args || raw.arguments || raw;
  return {
    raw,
    msg,
    payload,
    text: visibleText(event, raw, content),
    href: String(event?.action?.href || raw.href || raw.url || "").trim(),
    recipient: String(msg.recipient || raw.recipient || "").trim(),
    name: String(raw.name || msg.name || payload?.name || "").trim()
  };
}

function visibleText(event, raw, content) {
  const parts = Array.isArray(content.parts) ? content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").join("\n") : "";
  return String(event?.text || raw.text || raw.dataNoJSON || content.text || parts || "").trim();
}

function contentText(content = {}) {
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || "").filter(Boolean).join("\n");
  return "";
}

function hasStructuredPayload(value) {
  if (!value || typeof value !== "object") return false;
  return Object.keys(value).some(key => !/^(id|type|event|created_at|timestamp)$/i.test(key));
}

function isUsefulResult(raw = {}, payload = {}) {
  const source = payload && typeof payload === "object" ? payload : raw;
  return Boolean(source.ok !== undefined || source.status || source.error || source.output || source.content || source.result || source.data);
}

function parsePayload(text = "") {
  if (!text || typeof text !== "string") return null;
  try { return JSON.parse(text); } catch { return null; }
}
