//B"H

/**
 * Chapter 87: The Image And The File Found Their Names In The Fire.
 *
 * Text is not only plain text. A provider may send image URLs, asset pointers,
 * file names, citations, or nested multimodal parts. This extractor turns each
 * visible shard into a tiny markdown reference so the renderer preserves order
 * without pinning the whole raw provider body in RAM.
 */
export function normalizeRole(role) {
  if (role === "user") return "user";
  if (role === "model") return "assistant";
  if (role === "tool") return "tool";
  return "assistant";
}

export function visibleContentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(partToText).filter(Boolean).join("\n");
  if (Array.isArray(content.content)) return content.content.map(partToText).filter(Boolean).join("\n");
  if (typeof content.text === "string") return content.text;
  if (typeof content.result === "string") return content.result;
  if (typeof content.output === "string") return content.output;
  if (typeof content.message === "string") return content.message;
  return partToText(content);
}

export function extractVisibleText(message, input) {
  const text = visibleContentText(message?.content || {});
  if (text) return text;
  if (typeof input?.text === "string" && !looksLikeTransport(input)) return input.text;
  return "";
}

export function extractEventText(input) {
  const message = input?.message || input?.input_message || input;
  return visibleContentText(message?.content || input?.content || input) || String(input?.text || "");
}

export function partToText(part) {
  if (!part) return "";
  if (typeof part === "string") return part;
  if (part.text) return typeof part.text === "string" ? part.text : partToText(part.text);
  if (part.summary) return part.summary;
  if (part.content) return visibleContentText(part.content);
  const image = imageUrl(part);
  if (image) return `![image](${image})`;
  const file = fileRef(part);
  if (file) return `[${file.label}](${file.url || "#"})`;
  if (part.value) return String(part.value);
  return "";
}

export function findFirstUrl(raw) {
  try { return JSON.stringify(raw).match(/https?:\/\/[^\s"')]+/)?.[0] || null; }
  catch { return null; }
}

function imageUrl(part = {}) {
  return part.image_url?.url || part.image_url || part.url || part.asset_pointer || part.file_url || "";
}

function fileRef(part = {}) {
  const file = part.file || part.attachment || part.file_reference || part;
  const url = file.url || file.download_url || file.asset_pointer || file.file_url || "";
  const name = file.name || file.filename || file.title || file.file_name || file.id || "file";
  if (!url && !/file|attachment|asset/i.test(String(part.type || part.content_type || ""))) return null;
  return { label: name, url };
}

function looksLikeTransport(input = {}) {
  return Boolean(input.data || input.event || input.dataNoJSON || input.type);
}
