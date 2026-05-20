//B"H
import { interpretedEvent, textPanel } from "./event-ui/cards.js";

export function summarizeEvent(event = {}) {
  const kind = event.kind || "raw";
  if (kind === "thinking" || kind === "hidden") return textPanel(event.label || "Thinking", event.text || extractText(event) || "Thinking event.");
  if (kind === "status") return interpretedEvent(event);
  if (isToolKind(kind)) return interpretedEvent(event);
  if (kind === "oauth") return interpretedEvent(event);
  if (kind === "code") return textPanel(`Code · ${event.label || "code"}`, event.text || extractText(event));
  return interpretedEvent(event);
}

export function eventSearchKey(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  return [event.kind, event.label, raw.type, msg.id, msg.recipient, msg.channel, extractText(event).slice(0, 300)].filter(Boolean).join("::");
}

function isToolKind(kind = "") {
  return /^(tool_call|agent_tool|awtsmoos_tool|tool_result)$/.test(String(kind));
}

function isToolKind(kind = "") {
  return /^(tool_call|agent_tool|awtsmoos_tool|tool_result)$/.test(String(kind));
}

function extractText(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  if (event.text) return event.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || part?.summary || "").filter(Boolean).join("\n");
  return typeof content.text === "string" ? content.text : "";
}
