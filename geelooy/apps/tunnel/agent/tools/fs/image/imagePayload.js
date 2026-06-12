// B"H
const { typeFrom, typeFromPath } = require("./imageTypes.js");

/**
 * B"H
 * Chapter 2: The base64 river learned which banks may hold it.
 *
 * A generated image arrives as thunder without a body: data URL, content64, or
 * imageBase64. This parser gives it measured banks, names its MIME, and refuses
 * every crooked stream before it can touch the filesystem.
 *
 * @param {object} payload Tunnel action payload.
 * @returns {{buffer:Buffer,type:{ext:string,mime:string},source:string}}
 */
function parseImagePayload(payload = {}) {
  const picked = pickSource(payload);
  const data = parseDataUrl(picked.value) || { base64: picked.value, mime: payload.mimeType || payload.mime };
  const clean = String(data.base64 || "").replace(/\s+/g, "");
  if (!clean) throw new Error("missing_image_base64");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) throw new Error("invalid_base64_image_text");
  const buffer = Buffer.from(clean, "base64");
  if (!buffer.length) throw new Error("empty_image_buffer");
  const type = typeFrom(data.mime) || typeFromPath(payload.path || payload.p || payload.fileName) || typeFrom(payload.format || payload.ext || "png");
  if (!type) throw new Error("unsupported_image_type");
  return { buffer, type, source: picked.key };
}

function pickSource(payload) {
  const fields = ["dataUrl", "imageDataUrl", "imageBase64", "content64", "base64", "content"];
  for (const key of fields) if (payload[key]) return { key, value: payload[key] };
  throw new Error("missing_image_payload");
}

function parseDataUrl(value) {
  const text = String(value || "");
  const match = text.match(/^data:([^;,]+);base64,(.+)$/s);
  return match ? { mime: match[1], base64: match[2] } : null;
}

module.exports = { parseImagePayload, parseDataUrl };
