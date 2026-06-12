// B"H
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { assertNotSecret } = require("../pathGuard.js");
const { parseImagePayload } = require("./imagePayload.js");
const { assertMagic } = require("./imageTypes.js");
const { resolveImagePath } = require("./imagePath.js");
const { buildImageUrls } = require("./imageUrl.js");

/**
 * B"H
 * Chapter 5: The image crossed from dream to disk.
 *
 * The generated picture descends like lightning into bytes. This action refuses
 * masquerades, guards the root, writes the complete binary file, and returns the
 * exact path plus optional URL data so apps can drink from the new spring.
 *
 * @param {object} config Tunnel config.
 * @param {object} payload Action payload with imageBase64, dataUrl, or content64.
 * @param {string} action Public action name used by the caller.
 * @returns {Promise<object>} Write result and app-facing location metadata.
 */
async function writeImage(config, payload = {}, action = "writeImage") {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const parsed = parseImagePayload(payload);
  const maxBytes = Math.max(1, Number(payload.maxBytes || 25 * 1024 * 1024));
  if (parsed.buffer.length > maxBytes) throw new Error("image_too_large");
  assertMagic(parsed.buffer, parsed.type);
  const target = resolveImagePath(config, payload, parsed.type);
  assertNotSecret(config, target.absolutePath);
  await fsp.mkdir(path.dirname(target.absolutePath), { recursive: true });
  await fsp.writeFile(target.absolutePath, parsed.buffer);
  const sha256 = crypto.createHash("sha256").update(parsed.buffer).digest("hex");
  const urls = buildImageUrls(payload, target.relativePath.replace(/\\/g, "/"));
  return { ok: true, action, path: target.relativePath, absolutePath: target.absolutePath, fileName: target.fileName, bytes: parsed.buffer.length, sha256, mime: parsed.type.mime, ext: parsed.type.ext, source: parsed.source, ...urls };
}

module.exports = { writeImage };
