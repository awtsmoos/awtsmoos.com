// B"H
/**
 * @file multimodal-adapter.js
 * @description
 * Chapter 2: The code studio found the same eye as the central AI altar. This
 * bridge keeps provider files small while letting images, audio, video, and
 * runtime snapshots pass through one shared capability table.
 */

import {
  attachmentParts,
  attachSnapshotForAgent,
  buildMultimodalUserMessage,
  multimodalSupport
} from "../../../../../ai/central/multimodal.js";

export { attachmentParts, attachSnapshotForAgent, buildMultimodalUserMessage, multimodalSupport };

export function sanitizeMessagesForProvider(messages = [], model = {}, providerId = "") {
  const support = multimodalSupport(model, providerId || model.provider || "");
  return messages.map(message => sanitizeOneMessage(message, support));
}

function sanitizeOneMessage(message = {}, support = {}) {
  if (!Array.isArray(message.content)) return message;
  const kept = [];
  const skipped = [];
  for (const part of message.content) {
    if (part.type === "text") kept.push(part);
    else if (part.type === "image_url" && support.images) kept.push(part);
    else if (part.type === "input_audio" && support.audio) kept.push(part);
    else if (part.type === "video_url" && support.video) kept.push(part);
    else skipped.push(part.type || "unknown");
  }
  if (skipped.length) kept.push({ type: "text", text: `\n[Unsupported media omitted for this model: ${skipped.join(", ")}]` });
  return { ...message, content: kept.length ? kept : "" };
}

export function toGeminiParts(content) {
  if (!Array.isArray(content)) return [{ text: String(content || "") }];
  return content.map(part => {
    if (part.type === "text") return { text: part.text || "" };
    if (part.type === "image_url") return inlineDataPart(part.image_url?.url, "image/png");
    if (part.type === "input_audio") return inlineDataPart(part.input_audio?.data, audioMime(part.input_audio?.format));
    if (part.type === "video_url") return inlineDataPart(part.video_url?.url, "video/mp4");
    return { text: `[Unsupported part: ${part.type || "unknown"}]` };
  });
}

function inlineDataPart(value = "", fallbackMime = "application/octet-stream") {
  const text = String(value || "");
  const match = text.match(/^data:([^;]+);base64,(.+)$/);
  return { inlineData: { mimeType: match?.[1] || fallbackMime, data: match?.[2] || text.replace(/^data:[^,]+,/, "") } };
}

function audioMime(format = "") {
  const value = String(format || "").toLowerCase();
  if (value === "wav") return "audio/wav";
  if (value === "webm") return "audio/webm";
  if (value === "ogg") return "audio/ogg";
  return "audio/mpeg";
}
