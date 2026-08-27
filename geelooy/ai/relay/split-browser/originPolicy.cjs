//B"H

/**
 * B"H — The generic relay keeps a gate, not a prison.
 *
 * ChatGPT remains the default mountain. Extra websites can be added through
 * config, and the mapper accepts them only when the origin is explicitly in the
 * local allow-list. This gives generic routing without silently becoming a wild
 * open proxy.
 */
function assertAllowedOrigin(url, config) {
  const origin = typeof url === "string" ? new URL(url).origin : url.origin;
  const allowed = new Set([config.targetOrigin, ...(config.allowedOrigins || [])]);
  if (!allowed.has(origin)) throw new Error(`Origin is not allowed by split-browser relay: ${origin}`);
  return origin;
}

module.exports = { assertAllowedOrigin };
