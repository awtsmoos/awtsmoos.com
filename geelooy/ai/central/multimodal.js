// B"H
/**
 * @file multimodal.js
 * @description
 * Text, image, audio, video, and runtime snapshots are braided into provider
 * messages only when the selected model can receive them. Provider-specific
 * encoding lives in providerMedia so Gemini gets inlineData while OpenAI-style
 * rivers get image_url/input_audio/video_url blocks.
 */
import { toOpenAIContentPart } from "./providerMedia.js";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/m4a"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/avi", "video/quicktime", "video/x-matroska"]);

const PROVIDER_CAPABILITIES = Object.freeze({
  minimax: { images: true, audio: false, video: true, models: [/minimax-m3/i] },
  openai: { images: true, audio: true, video: false, models: [/gpt-4o/i, /gpt-4\.1/i, /gpt-5/i, /gpt-audio/i] },
  google: { images: true, audio: true, video: true, models: [/gemini/i] },
  openrouter: { images: true, audio: false, video: true, modelMetadata: true },
  groq: { images: true, audio: false, video: false, modelMetadata: true },
  xai: { images: true, audio: false, video: false, models: [/grok/i] },
  together: { images: true, audio: false, video: false, modelMetadata: true },
  cerebras: { images: false, audio: false, video: false }
});

export function multimodalSupport(model = {}, providerId = model.provider || "") {
  const base = PROVIDER_CAPABILITIES[providerId] || {};
  const id = String(model.id || model.model || "");
  const modalities = normalizeModalities(model);
  const modelMatch = Array.isArray(base.models) ? base.models.some(rule => rule.test(id)) : false;
  return {
    images: Boolean(modalities.has("image") || modalities.has("images") || modelMatch && base.images || base.modelMetadata && modelHintsImage(model)),
    audio: Boolean(modalities.has("audio") || modelMatch && base.audio || base.modelMetadata && modelHintsAudio(model)),
    video: Boolean(modalities.has("video") || modelMatch && base.video || base.modelMetadata && modelHintsVideo(model))
  };
}

export function attachmentParts(attachments = [], support = {}) {
  const parts = [];
  const skipped = [];
  for (const item of attachments || []) {
    const mime = String(item.type || item.mimeType || "").toLowerCase();
    const url = item.dataUrl || item.url || item.image_url || item.audio_url || item.video_url || "";
    if (!url) { skipped.push({ name: item.name || "attachment", reason: "missing_url_or_dataUrl" }); continue; }
    if (IMAGE_TYPES.has(mime)) pushMedia(parts, skipped, support.images, item, "image_not_supported_by_model");
    else if (AUDIO_TYPES.has(mime)) pushMedia(parts, skipped, support.audio, item, "audio_not_supported_by_model");
    else if (VIDEO_TYPES.has(mime)) pushMedia(parts, skipped, support.video, item, "video_not_supported_by_model");
    else skipped.push({ name: item.name || "attachment", type: mime, reason: "unsupported_mime" });
  }
  return { parts, skipped };
}

export function buildMultimodalUserMessage({ text = "", attachments = [], model = {}, providerId = "" } = {}) {
  const support = multimodalSupport(model, providerId || model.provider);
  const { parts, skipped } = attachmentParts(attachments, support);
  if (!parts.length) return skipped.length ? { role: "user", content: `${text}\n\n[Unsupported attachments skipped: ${skipped.map(item => item.name).join(", ")}]` } : { role: "user", content: text };
  return { role: "user", content: [{ type: "text", text: String(text || "") }, ...parts], awtsmoosSkippedAttachments: skipped };
}

export function attachSnapshotForAgent(messages = [], snapshot = null, options = {}) {
  if (!snapshot) return messages;
  const text = [
    "B'H runtime snapshot attached.",
    "Inspect it. If the interface needs improvement, call tools or request subagents before finalizing.",
    snapshot.text ? `Visible text: ${String(snapshot.text).slice(0, 1200)}` : "",
    snapshot.image?.backend ? `Snapshot backend: ${snapshot.image.backend}` : ""
  ].filter(Boolean).join("\n");
  const attachments = snapshot.dataUrl ? [{ name: "simulateRuntime-snapshot.png", type: "image/png", dataUrl: snapshot.dataUrl }] : [];
  const message = buildMultimodalUserMessage({ text, attachments, model: options.model || {}, providerId: options.providerId || options.provider || "" });
  return [...messages, message];
}

function pushMedia(parts, skipped, allowed, item, reason) {
  if (!allowed) { skipped.push({ name: item.name || "attachment", type: item.type, reason }); return; }
  parts.push(toOpenAIContentPart(item));
}

function normalizeModalities(model = {}) { return new Set([...(model.input_modalities || []), ...(model.output_modalities || []), ...(model.architecture?.input_modalities || [])].map(item => String(item).toLowerCase())); }
function modelHintsImage(model = {}) { return JSON.stringify(model).toLowerCase().includes("image") || JSON.stringify(model).toLowerCase().includes("vision"); }
function modelHintsAudio(model = {}) { return JSON.stringify(model).toLowerCase().includes("audio") || JSON.stringify(model).toLowerCase().includes("speech"); }
function modelHintsVideo(model = {}) { return JSON.stringify(model).toLowerCase().includes("video"); }

export const AWTSMOOS_MULTIMODAL_TYPES = Object.freeze({ IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES, PROVIDER_CAPABILITIES });
