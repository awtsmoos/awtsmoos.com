//B"H
const { rewriteHtml } = require("./rewriteHtml.cjs");

/**
 * Chapter 14: The Script Learned To Turn At Every Gate.
 *
 * HTML is not the only place URLs hide. Scripts, CSS, manifests, and Remix
 * route data carry strings that can leap out of localhost unless rewritten.
 * This function bends only obvious upstream/root paths into the proxy stream.
 *
 * @param {Buffer} bytes Response bytes.
 * @param {string} type Content-Type.
 * @param {string} origin Upstream origin.
 * @returns {Buffer|string} Rewritten body or original bytes.
 */
function rewriteBody(bytes, type, origin) {
  if (/text\/html/i.test(type)) return rewriteHtml(bytes.toString("utf8"), origin);
  if (/javascript|ecmascript/i.test(type)) return bytes;
  if (!isText(type)) return bytes;
  return rewriteUrls(bytes.toString("utf8"), origin);
}

function isText(type) {
  return /javascript|json|text\/|css|manifest|svg|xml/i.test(type || "");
}

function rewriteUrls(text, origin) {
  const escaped = escapeRegExp(origin);
  return String(text)
    .replace(new RegExp(escaped + "([^'\"\\)\\s<>]*)", "g"), (_, path) => `/proxy?u=${encodeURIComponent(origin + path)}`)
    .replace(/(["'`])\/(?!\/)([^"'`\s<>]*)/g, (all, quote, path) => {
      if (/^(proxy|control|health|fetch|body|control-url)(\/|$|\?)/.test(path)) return all;
      return `${quote}/proxy?u=${encodeURIComponent(origin + "/" + path)}`;
    });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { rewriteBody, rewriteUrls };
