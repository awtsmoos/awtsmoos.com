//B"H
import { resolveToolName, resolveToolPayload, resolveToolPreview } from "./toolNameResolver.js";

/**
 * Chapter 43: The Gate Learned The Difference Between A Knock And A Mission.
 *
 * Some streamed packets merely point at the assistant with no content. Others
 * carry a real tool invocation in preview metadata, function calls, arguments,
 * or an action payload. Only the latter may become visible trace cards.
 */
export function isToolCallSignal(raw = {}, message = raw.message || raw.input_message || raw) {
  const recipient = message.recipient || raw.recipient;
  const channel = message.channel || raw.channel;
  const content = message.content || raw.content || {};
  const type = content.content_type || raw.type || raw.event || "";
  const payload = resolveToolPayload(raw, message);
  const preview = resolveToolPreview(raw, message);
  if (hasConcreteToolPayload(preview?.params) || hasConcreteToolPayload(payload)) return true;
  if (/tool_call|function_call/i.test(String(type))) return true;
  if (hasToolPayload(content) || hasToolPayload(raw)) return true;
  if (channel === "commentary" && recipient && recipient !== "all" && !/^assistant$/i.test(String(recipient))) return true;
  return false;
}

export function isToolResultSignal(raw = {}, message = raw.message || raw.input_message || raw) {
  const role = message.author?.role || raw.author?.role || message.role || raw.role;
  const content = message.content || raw.content || {};
  const type = content.content_type || raw.type || raw.event || "";
  if (role === "tool" && hasVisibleOrStructuredResult(raw, message)) return true;
  if (/tool_result|function_result|tool_response|function_response/i.test(String(type))) return true;
  return Boolean(raw.tool_result || raw.function_result || raw.output || raw.result);
}

export function toolLabel(raw = {}, message = raw.message || raw.input_message || raw) {
  return resolveToolName(raw, message);
}

function hasVisibleOrStructuredResult(raw = {}, message = {}) {
  const text = contentText(message.content || raw.content || {});
  return Boolean(text.trim() || raw.ok !== undefined || raw.output || raw.result || raw.error || raw.status);
}

function hasConcreteToolPayload(value = {}) {
  return Boolean(value && (value.action || value.command || value.path || value.p || value.url || value.operation || value.tool_name || value.name));
}

function hasToolPayload(value = {}) {
  return Boolean(value.tool_calls || value.tool_call || value.function_call || value.arguments || value.input || value.action);
}

function contentText(content = {}) {
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || "").filter(Boolean).join("\n");
  return "";
}
