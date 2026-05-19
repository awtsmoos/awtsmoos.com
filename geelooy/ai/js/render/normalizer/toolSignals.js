//B"H

export function isToolCallSignal(raw = {}, message = raw.message || raw.input_message || raw) {
  const recipient = message.recipient || raw.recipient;
  const channel = message.channel || raw.channel;
  const content = message.content || raw.content || {};
  const type = content.content_type || raw.type || raw.event || "";
  if (recipient && recipient !== "all") return true;
  if (channel === "commentary" && recipient) return true;
  if (/tool|function|tool_call|function_call/i.test(String(type))) return true;
  return hasToolPayload(content) || hasToolPayload(raw);
}

export function isToolResultSignal(raw = {}, message = raw.message || raw.input_message || raw) {
  const role = message.author?.role || raw.author?.role || message.role || raw.role;
  const content = message.content || raw.content || {};
  const type = content.content_type || raw.type || raw.event || "";
  if (role === "tool") return true;
  if (/tool_result|function_result|tool_response|function_response/i.test(String(type))) return true;
  return Boolean(raw.tool_result || raw.function_result || raw.output || raw.result);
}

export function toolLabel(raw = {}, message = raw.message || raw.input_message || raw) {
  return message.recipient || raw.recipient || message.author?.name || raw.name || raw.tool_name || raw.function?.name || "tool";
}

function hasToolPayload(value = {}) {
  return Boolean(value.tool_calls || value.tool_call || value.function_call || value.recipient || value.arguments || value.input || value.action);
}
