//B"H

/**
 * Chapter 39: The Instrument Spoke Its Real Name From The First Spark.
 *
 * Tool packets often arrive as previews before the final response body exists.
 * The Awtsmoos hides the useful action inside several vessels: direct payloads,
 * function calls, JIT preview metadata, or final response JSON. This resolver
 * gathers those sparks and rejects generic recipients like "all" so headers can
 * mature from "namespace" into "action + target" as soon as the stream reveals
 * enough truth.
 *
 * @param {object} raw Original packet or payload.
 * @param {object} message Message-like object inside the packet.
 * @returns {string} Best known tool namespace/name/action.
 */
export function resolveToolName(raw = {}, message = raw.message || raw.input_message || raw) {
  const content = message.content || raw.content || {};
  const payload = resolveToolPayload(raw, message);
  const preview = previewBody(raw, message);
  return firstUsefulString(
    preview?.operation,
    message.author?.name,
    raw.author?.name,
    raw.name,
    raw.tool_name,
    raw.toolName,
    raw.function?.name,
    raw.function_call?.name,
    raw.tool_call?.function?.name,
    firstToolCallName(content.tool_calls || raw.tool_calls),
    content.function_call?.name,
    payload.operation,
    payload.tool_name,
    payload.name,
    payload.action,
    preview?.params?.action,
    raw.action,
    message.recipient,
    raw.recipient,
    raw.type
  ) || "tool";
}

/**
 * Finds the richest likely action payload inside a streaming tool packet.
 *
 * @param {object} raw Original packet or payload.
 * @param {object} message Message-like object inside the packet.
 * @returns {object} Parsed call payload or an empty object.
 */
export function resolveToolPayload(raw = {}, message = raw.message || raw.input_message || raw) {
  const content = message.content || raw.content || {};
  const parsed = parsedPayload(content);
  const preview = previewBody(raw, message);
  return parsed || preview?.params || raw.request || raw.body || raw.input || raw.arguments || preview || {};
}

export function resolveToolPreview(raw = {}, message = raw.message || raw.input_message || raw) {
  return previewBody(raw, message) || {};
}

function previewBody(raw = {}, message = raw.message || raw.input_message || raw) {
  return message.metadata?.jit_plugin_data?.from_server?.body
    || raw.metadata?.jit_plugin_data?.from_server?.body
    || raw.jit_plugin_data?.from_server?.body
    || raw.from_server?.body
    || null;
}

function firstToolCallName(calls) {
  const call = Array.isArray(calls) ? calls[0] : calls;
  return call?.function?.name || call?.name || call?.tool_name || "";
}

function parsedPayload(content = {}) {
  const text = contentText(content) || content.arguments || content.input;
  if (!text || typeof text !== "string") return null;
  try { return JSON.parse(text); } catch { return null; }
}

function contentText(content = {}) {
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.parts)) return content.parts.map(part => typeof part === "string" ? part : part?.text || "").filter(Boolean).join("\n");
  return "";
}

function firstUsefulString(...values) {
  return values.map(value => String(value || "").trim()).find(isUsefulName);
}

function isUsefulName(value) {
  return Boolean(value && !/^(all|assistant|tool|next|null|undefined)$/i.test(value));
}
