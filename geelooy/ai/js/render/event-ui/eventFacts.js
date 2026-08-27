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
  const raw = event.raw || event;
  const fields = [event.text, event.action?.href, raw.url, raw.href, raw.request?.url, raw.response?.url]
    .filter(value => typeof value === "string");
  const links = fields.flatMap(cleanLinksFromText);
  return [...new Set(links)].slice(0, 8);
}

function cleanLinksFromText(text = "") {
  return (String(text).match(/https?:\/\/[^\s"'<>\\)]+/g) || [])
    .map(link => link.replace(/\\n|\\r|\\t/g, "").replace(/[),.;]+$/g, ""))
    .filter(link => !/localhost:8080\/ai\/js\//.test(link));
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function parseJson(text = "") { try { return JSON.parse(String(text || "")); } catch { return null; } }
function contentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").filter(Boolean).join("\n");
  return typeof content.text === "string" ? content.text : "";
}
