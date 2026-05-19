//B"H

export function eventFacts(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  return clean({
    kind: event.kind,
    label: event.label,
    type: raw.type || content.content_type,
    channel: msg.channel || raw.channel,
    recipient: msg.recipient || raw.recipient,
    status: msg.status || raw.status,
    id: msg.id || raw.id,
    author: msg.author?.role || raw.author?.role,
    conversation: raw.conversation_id,
    message: raw.message_id
  });
}

export function requestPayload(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const text = event.text || contentText(msg.content || raw.content || {});
  return parseJson(text) || msg.content || raw.request || raw.body || null;
}

export function responsePayload(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  return raw.response || raw.result || raw.output || parseJson(contentText(msg.content || raw.content || {}));
}

export function importantLinks(event = {}) {
  try {
    const text = JSON.stringify(event.raw || event);
    return [...new Set(text.match(/https?:\/\/[^\s"')]+/g) || [])];
  } catch { return []; }
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function parseJson(text = "") { try { return JSON.parse(String(text || "")); } catch { return null; } }
function contentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").filter(Boolean).join("\n");
  return typeof content.text === "string" ? content.text : "";
}
