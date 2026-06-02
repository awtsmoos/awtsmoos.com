// B"H

import { buildMultimodalUserMessage } from "./multimodal.js";

/**
 * B"H
 * Chapter 18: Messages, tools, models, and now media braided into one breath.
 *
 * This builder is shared by browser AI and local agent scripts. It prepares an
 * OpenAI-compatible chat payload without knowing whether the river is Groq,
 * OpenRouter, MiniMax, Gemini, or a future provider. Media is only folded into
 * the final user message when the model declares a fitting vessel.
 */
export function buildChatPayload({ model, messages, tools, stream = true, extraBody = null } = {}) {
  const safeMessages = Array.isArray(messages) && messages.length
    ? messages
    : [{ role: "user", content: "B'H" }];
  const payload = { model, messages: safeMessages, stream: !!stream };
  if (Array.isArray(tools) && tools.length) payload.tools = tools;
  if (payload.tools) payload.tool_choice = "auto";
  if (extraBody && typeof extraBody === "object") payload.extra_body = extraBody;
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
 * Converts a prompt plus media attachments into chat messages.
 *
 * @param {object} options Prompt, model and attachment options.
 * @returns {object[]} Chat messages.
 */
export function normalizeMultimodalMessages(options = {}) {
  const base = normalizeMessages(options.messages || options.prompt || options.input || "");
  if (!Array.isArray(options.attachments) || !options.attachments.length) return base;
  const last = base[base.length - 1] || { role: "user", content: "" };
  if (last.role !== "user") {
    return [...base, buildMultimodalUserMessage({ text: "", attachments: options.attachments, model: options.modelMeta || {}, providerId: options.providerId || "" })];
  }
  const text = typeof last.content === "string" ? last.content : JSON.stringify(last.content || "");
  return [...base.slice(0, -1), buildMultimodalUserMessage({ text, attachments: options.attachments, model: options.modelMeta || {}, providerId: options.providerId || "" })];
}

/**
 * B"H
 * Extracts a simple assistant answer from non-streaming compatible JSON.
 *
 * @param {object} json Provider response.
 * @returns {string} Assistant text.
 */
export function extractAssistantText(json = {}) {
  const text = json?.choices?.map(choice => choice?.message?.content || "").join("") || "";
  return stripThinkingBlocks(text);
}

/**
 * B"H
 * Removes provider reasoning wrappers from non-stream responses.
 *
 * @param {string} text Raw assistant text.
 * @returns {string} User-visible answer.
 */
export function stripThinkingBlocks(text = "") {
  return String(text || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
