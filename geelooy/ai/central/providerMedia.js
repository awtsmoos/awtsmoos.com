// B"H
/**
 * @file providerMedia.js
 * @description
 * One media object, many rivers. OpenAI-compatible providers receive image_url
 * blocks with data URLs; Gemini receives inlineData with MIME and raw base64;
 * audio receives input_audio only where that shape is supported.
 */

export function normalizeMediaAttachment(item = {}) {
  const type = String(item.type || item.mimeType || item.mime || "").toLowerCase();
  const name = item.name || item.filename || "attachment";
  const dataUrl = item.dataUrl || item.url || item.image_url || item.audio_url || item.video_url || "";
  return { name, type, dataUrl, base64: stripDataPrefix(dataUrl), mimeType: mimeFromDataUrl(dataUrl) || type };
}

export function toOpenAIContentPart(item = {}) {
  const media = normalizeMediaAttachment(item);
  if (media.mimeType.startsWith("image/")) return { type: "image_url", image_url: { url: ensureDataUrl(media) } };
  if (media.mimeType.startsWith("audio/")) return { type: "input_audio", input_audio: { data: media.base64, format: audioFormat(media.mimeType) } };
  if (media.mimeType.startsWith("video/")) return { type: "video_url", video_url: { url: ensureDataUrl(media) } };
  return { type: "text", text: `[Unsupported attachment: ${media.name}]` };
}

export function toGeminiPart(item = {}) {
  const media = normalizeMediaAttachment(item);
  if (!media.base64) return { text: `[Attachment missing data: ${media.name}]` };
  return { inlineData: { mimeType: media.mimeType || "application/octet-stream", data: media.base64 } };
}

export function ensureDataUrl(media = {}) {
  if (String(media.dataUrl || "").startsWith("data:")) return media.dataUrl;
  const mime = media.mimeType || media.type || "application/octet-stream";
  return `data:${mime};base64,${media.base64 || ""}`;
}

export function stripDataPrefix(value = "") {
  return String(value || "").replace(/^data:[^,]+,/, "");
}

export function mimeFromDataUrl(value = "") {
  const match = String(value || "").match(/^data:([^;,]+)[;,]/);
  return match?.[1] || "";
}

function audioFormat(type = "") {
  if (type.includes("wav")) return "wav";
  if (type.includes("webm")) return "webm";
  if (type.includes("ogg")) return "ogg";
  return "mp3";
}
