// B"H

/**
 * B"H
 * Chapter 18: Messages, tools, and models braided into one breath.
 *
 * This builder is shared by browser AI and local agent scripts. It prepares an
 * OpenAI-compatible chat payload without knowing whether the river is Groq,
 * OpenRouter, or a future provider.
 */
export function buildChatPayload({ model, messages, tools, stream = true } = {}) {
  const safeMessages = Array.isArray(messages) && messages.length
    ? messages
    : [{ role: "user", content: "B'H" }];
  const payload = { model, messages: safeMessages, stream: !!stream };
  if (Array.isArray(tools) && tools.length) payload.tools = tools;
  if (payload.tools) payload.tool_choice = "auto";
  return payload;
}

/**
 * B"H
 * Converts raw text into provider message form.
 *
 * @param {string|object[]} input Prompt text or ready messages.
 * @returns {object[]} Chat messages.
 */
export function normalizeMessages(input) {
  if (Array.isArray(input)) return input;
  return [{ role: "user", content: String(input ?? "") }];
}

/**
 * B"H
 * Extracts a simple assistant answer from non-streaming compatible JSON.
 *
 * @param {object} json Provider response.
 * @returns {string} Assistant text.
 */
export function extractAssistantText(json = {}) {
  return json?.choices?.map(choice => choice?.message?.content || "").join("") || "";
}
