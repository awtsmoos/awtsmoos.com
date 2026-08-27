//B"H

/**
 * Chapter 19: The Route Data Refused The Painter's Brush.
 *
 * Remix loader responses, APIs, JavaScript, workers, and challenge payloads
 * must return exactly as ChatGPT gives them. Only document HTML may receive the
 * local control shim. Everything else is dynamic upstream truth, byte for byte.
 *
 * @param {URL} local Local request URL.
 * @param {string} type Upstream content-type.
 * @returns {boolean} True when body may be rewritten.
 */
function mayRewriteBody(local, type) {
  if (local.searchParams.has("_data")) return false;
  if (/javascript|json|event-stream|octet-stream|wasm|font|image|audio|video/i.test(type || "")) return false;
  return /text\/html/i.test(type || "");
}

module.exports = { mayRewriteBody };
