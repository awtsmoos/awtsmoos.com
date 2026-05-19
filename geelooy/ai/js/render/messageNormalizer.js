//B"H
/**
 * Chapter 3: Every fragment gets a face.
 * Thoughts, function calls, OAuth doors, hidden law, JSON code, and status
 * sparks are separated before they reach the visual vessel.
 * @param {unknown} input - ChatGPT node, Gemini node, string, or event.
 * @returns {{role:string,text:string,id:string|null,raw:unknown,events:Array}}
 */
export function normalizeMessage(input) {
  if (typeof input === "string") return base("assistant", input, null, input, []);
  const message = input?.message || input?.input_message || input;
  const role = normalizeRole(message?.author?.role || message?.role || input?.type);
  const text = extractText(message, input);
  const id = message?.id || input?.id || null;
  const events = Array.isArray(input) ? input.map(classifyTransportEvent) : collectEvents(input);
  return base(role, text, id, input, events);
}

export function classifyTransportEvent(event) {
  const data = event?.data || event;
  const message = data?.message || data?.input_message || data;
  const content = message?.content || data?.content || {};
  const contentType = content?.content_type || data?.type || event?.event || "raw";
  const recipient = message?.recipient || data?.recipient;
  const channel = message?.channel || data?.channel;
  const metadata = message?.metadata || data?.metadata || {};
  if (data?.dataNoJSON === "[DONE]") return capsule("status", "stream done", data);
  if (contentType === "thoughts" || metadata.reasoning_status || /reason/i.test(metadata.model_slug || "")) return capsule("thinking", "Thinking", data);
  if (recipient && recipient !== "all") return capsule("tool_call", recipient, data);
  if (channel === "analysis") return capsule("thinking", "Analysis", data);
  if (channel === "commentary" && recipient) return capsule("tool_call", recipient, data);
  if (/tool|function/i.test(contentType)) return capsule("tool_result", contentType, data);
  if (/oauth|sign.?in|login|authorization/i.test(JSON.stringify(data).slice(0, 3000))) return oauthCapsule(data);
  if (metadata.is_visually_hidden_from_conversation) return capsule("hidden", "Hidden message", data);
  if (/status|resume|delta_encoding|conversation-turn-complete/.test(contentType)) return capsule("status", contentType, data);
  if (contentType === "code") return capsule("tool_call", content.language || "code", data);
  return capsule("raw", contentType, data);
}

function base(role, text, id, raw, events) { return { role, text: text || "", id, raw, events }; }

function capsule(kind, label, raw) {
  return { kind, label, raw, text: extractText(raw?.message || raw?.input_message || raw, raw) || summarizeRaw(raw) };
}

function oauthCapsule(raw) {
  const href = findFirstUrl(raw);
  return { kind: "oauth", label: "Sign-in / OAuth", raw, text: summarizeRaw(raw), action: href ? { href, label: "Open sign-in" } : null };
}

function normalizeRole(role) {
  if (role === "user") return "user";
  if (role === "model") return "assistant";
  if (role === "tool") return "tool";
  return "assistant";
}

function extractText(message, input) {
  const content = message?.content || {};
  if (Array.isArray(content.parts)) return content.parts.map(partToText).filter(Boolean).join("\n");
  if (Array.isArray(content.thoughts)) return content.thoughts.map(partToText).filter(Boolean).join("\n") || "Thinking…";
  if (typeof content.text === "string") return content.text;
  if (typeof input?.text === "string") return input.text;
  if (typeof input?.dataNoJSON === "string") return input.dataNoJSON;
  if (input?.type && !message?.content) return summarizeEvent(input);
  return "";
}

function partToText(part) {
  if (typeof part === "string") return part;
  if (part?.text) return part.text;
  if (part?.summary) return part.summary;
  if (part?.name || part?.arguments || part?.input) return JSON.stringify(part, null, 2);
  return "";
}

function collectEvents(input) {
  const events = [];
  if (input?.awtsmoos?.otherEvents) events.push(...input.awtsmoos.otherEvents.map(classifyTransportEvent));
  if (input?.type || input?.event || input?.data || input?.message?.content?.content_type) events.push(classifyTransportEvent(input));
  return events;
}

function summarizeEvent(event) { return `Transport event: ${event.type || event.message?.content?.content_type || "event"}`; }

function summarizeRaw(raw) {
  try { return JSON.stringify(raw, null, 2).slice(0, 1200); } catch { return String(raw || ""); }
}

function findFirstUrl(raw) {
  const text = summarizeRaw(raw);
  return text.match(/https?:\/\/[^\s"')]+/)?.[0] || null;
}
