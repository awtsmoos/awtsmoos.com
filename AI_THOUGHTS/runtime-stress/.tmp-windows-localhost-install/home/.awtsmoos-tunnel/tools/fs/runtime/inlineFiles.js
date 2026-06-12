// B"H
/**
 * @file inlineFiles.js
 * @description
 * Chapter 7: When the user pours HTML straight into the tunnel, the Awtsmoos
 * grants it a true name, index.html, so no one mistakes a page for raw script.
 */

const { slash, isHtmlPath, isJsPath } = require("./pathUtils.js");

function inlineEntryForHtml(entryRaw) {
  const raw = slash(entryRaw || "index.html");
  return isHtmlPath(raw) ? raw : slash(raw.replace(/\/+$/, "") + "/index.html").replace(/^\.\//, "");
}

function inlineRuntimeFiles(payload, entryRaw) {
  const html = payload.html || payload.content;
  if (html) {
    const entry = inlineEntryForHtml(entryRaw);
    return { entry, files: { [entry]: String(html) } };
  }
  if (payload.testCode) {
    const entry = isJsPath(entryRaw) ? slash(entryRaw) : inlineEntryForHtml(entryRaw);
    return { entry, files: { [entry]: `<script src="./test.js"></script>`, "test.js": String(payload.testCode) } };
  }
  return null;
}

function parseObject(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    const raw = String(value);
    const decoded = /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length % 4 === 0 ? Buffer.from(raw, "base64").toString("utf8") : raw;
    return JSON.parse(decoded);
  } catch (_) {
    return fallback;
  }
}

module.exports = { inlineRuntimeFiles, parseObject, inlineEntryForHtml };
