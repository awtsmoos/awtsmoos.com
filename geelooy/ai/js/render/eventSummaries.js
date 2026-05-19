//B"H
import { escapeHtml } from "./escapeHtml.js";

export function summarizeEvent(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  const kind = event.kind || msg.channel || content.content_type || raw.type || "raw";
  if (kind === "tool_call") return toolCard("Tool request", event, msg, content);
  if (kind === "tool_result") return toolCard("Tool response", event, msg, content);
  if (kind === "thinking" || kind === "hidden") return textCard(event.label || "Thinking", event.text || contentText(content) || "Thinking event.");
  if (kind === "oauth") return textCard("OAuth / sign-in", event.action?.href || "OAuth event.");
  if (kind === "status") return kvCard("Status", statusRows(event, raw, msg));
  if (kind === "code") return textCard(`Code · ${content.language || "code"}`, event.text || content.text || "Code event.");
  return genericCard(event, raw, msg, content);
}

export function eventSearchKey(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  return [event.kind, event.label, raw.type, msg.id, msg.recipient, msg.channel, contentText(msg.content || raw.content).slice(0, 300)].filter(Boolean).join("::");
}

function toolCard(title, event, msg, content) {
  const parsed = parsePayload(event.text || contentText(content));
  const rows = {
    tool: lastSegment(msg.recipient || event.label || msg.author?.name || "tool"),
    id: msg.id,
    channel: msg.channel,
    status: msg.status,
    action: parsed?.action || parsed?.fn || parsed?.method,
    path: parsed?.path || parsed?.p || parsed?.url || parsed?.cwd,
    command: parsed?.command
  };
  return `${kvCard(title, rows)}${payloadBlock("Parsed payload", parsed)}${payloadBlock("Full raw event", event.raw || event)}`;
}

function genericCard(event, raw, msg, content) {
  const rows = { type: raw.type || content.content_type, channel: msg.channel, recipient: msg.recipient, status: msg.status, id: msg.id };
  const body = event.text || contentText(content);
  return `${kvCard(event.label || "Event", rows)}${body ? textCard("Event text", body) : ""}`;
}

function statusRows(event, raw, msg) {
  return { label: event.label, type: raw.type, event: raw.event, marker: raw.marker, id: msg.id || raw.id, conversation: raw.conversation_id, message: raw.message_id };
}

function kvCard(title, rows = {}) {
  const chips = Object.entries(rows).filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => `<span class="event-chip"><b>${escapeHtml(k)}</b>${escapeHtml(short(v))}</span>`).join("");
  return `<div class="event-summary-card"><div class="event-summary-title">${escapeHtml(title)}</div><div class="event-chip-row">${chips || `<span class="event-chip">details below</span>`}</div></div>`;
}

function textCard(title, text) {
  return `<div class="event-summary-card"><div class="event-summary-title">${escapeHtml(title)}</div><div class="event-markdown-source">${escapeHtml(String(text || ""))}</div></div>`;
}

function payloadBlock(title, payload) {
  if (!payload) return "";
  return `<details class="event-payload"><summary>${escapeHtml(title)}</summary><pre><code>${escapeHtml(JSON.stringify(payload, null, 2))}</code></pre></details>`;
}

function contentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").filter(Boolean).join("\n");
  return typeof content.text === "string" ? content.text : "";
}

function parsePayload(text = "") { try { return JSON.parse(String(text || "")); } catch { return null; } }
function lastSegment(value = "") { return String(value).split(/[.\/]/).filter(Boolean).pop() || value; }
function short(value, max = 160) { const text = String(value).replace(/\s+/g, " ").trim(); return text.length > max ? `${text.slice(0, max)}…` : text; }
