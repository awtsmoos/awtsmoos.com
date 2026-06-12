// B"H
const path = require("path");
const { safePath } = require("../pathGuard.js");

/**
 * B"H
 * Chapter 3: The vision walked wherever the guarded root allowed.
 *
 * The Awtsmoos flashes through the image and asks for no cage. If a caller gives
 * `p` or `path`, that exact repo-relative destination is honored beneath the
 * tunnel root; only nameless images fall back into AI_GENERATED_IMAGES. Slashes
 * are tamed, extensions are aligned with truth, and safePath keeps the fire from
 * leaping outside the appointed vessel.
 *
 * @param {object} config Tunnel config with root and path policy.
 * @param {object} payload Incoming action payload.
 * @param {{ext:string}} type Canonical image type.
 * @returns {{relativePath:string,absolutePath:string,fileName:string}}
 */
function resolveImagePath(config, payload = {}, type) {
  const explicit = payload.path || payload.p;
  const fallback = path.posix.join(defaultDirectory(payload), imageName(payload, type.ext));
  const relativePath = normalizeImagePath(explicit || fallback, type.ext);
  return { relativePath, absolutePath: safePath(config, relativePath), fileName: path.posix.basename(relativePath) };
}

function imageName(payload, ext) {
  return cleanFileName(payload.fileName || payload.name || defaultName(ext));
}

function defaultDirectory(payload = {}) {
  return String(payload.directory || payload.dir || "AI_GENERATED_IMAGES").replace(/\\/g, "/").replace(/^\/+/, "");
}

function defaultName(ext) {
  return `awtsmoos-image-${Date.now()}${ext}`;
}

function cleanFileName(value) {
  const base = path.posix.basename(String(value || "image").replace(/\\/g, "/"));
  return base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function normalizeImagePath(value, ext) {
  const clean = String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const parsed = path.posix.parse(clean);
  const wanted = parsed.ext ? clean.slice(0, -parsed.ext.length) : clean;
  return `${wanted}${ext}`;
}

module.exports = { resolveImagePath, cleanFileName, normalizeImagePath, defaultDirectory };
