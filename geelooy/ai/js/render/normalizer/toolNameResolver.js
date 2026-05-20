//B"H

/**
 * Chapter 17: The Instrument Remembered Its Name.
 *
 * While the stream still burns, the Awtsmoos draws the tool's true name from
 * every possible shard: recipient, function call, tool call, action, namespace,
 * or parsed JSON arguments. No vessel should be called merely "tool" when its
 * own letters are already glowing inside the packet.
 *
 * @param {object} raw Original packet or payload.
 * @param {object} message Message-like object inside the packet.
 * @returns {string} Best known tool namespace/name/action.
 */
export function resolveToolName(raw = {}, message = raw.message || raw.input_message || raw) {
  const content = message.content || raw.content || {};
  const payload = parsedPayload(content) || raw.request || raw.body || raw.input || {};
  return firstString(
    message.recipient,
    raw.recipient,
    message.author?.name,
    raw.name,
    raw.tool_name,
    raw.toolName,
    raw.function?.name,
    raw.function_call?.name,
    raw.tool_call?.function?.name,
    firstToolCallName(content.tool_calls || raw.tool_calls),
    content.function_call?.name,
    payload.recipient,
    payload.tool_name,
    payload.name,
    payload.action,
    raw.action,
    raw.type
  ) || "tool";
}

/**
 * Finds a likely action target inside tool arguments while still streaming.
 *
 * @param {object} raw Original packet or payload.
 * @param {object} message Message-like object inside the packet.
 * @returns {object} Parsed call payload or an empty object.
 */
export function resolveToolPayload(raw = {}, message = raw.message || raw.input_message || raw) {
  const content = message.content || raw.content || {};
  return parsedPayload(content) || raw.request || raw.body || raw.input || raw.arguments || {};
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

function firstString(...values) {
  return values.map(value => String(value || "").trim()).find(Boolean);
}
