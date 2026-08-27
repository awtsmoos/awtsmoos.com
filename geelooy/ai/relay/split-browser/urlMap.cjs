//B"H
const { assertAllowedOrigin } = require("./originPolicy.cjs");

/**
 * Chapter 12: Every Path Remembered Its Mountain.
 *
 * ChatGPT's client asks for route data, scripts, workers, images, and auth
 * turns using absolute and root-relative paths. This mapper keeps those paths
 * exact while threading them through the local proxy vessel. For generic AI and
 * browser work, `/proxy?u=` may carry any explicitly allowed origin.
 *
 * @param {URL} local Localhost URL.
 * @param {object|string} configOrOrigin Runtime config or legacy origin string.
 * @returns {string} Upstream URL.
 */
function toUpstream(local, configOrOrigin) {
  const config = normalizeConfig(configOrOrigin);
  if (local.pathname === "/chatgpt") return config.targetOrigin + "/" + local.search;
  if (local.pathname.startsWith("/chatgpt/")) return config.targetOrigin + local.pathname.slice("/chatgpt".length) + local.search;
  if (local.pathname !== "/proxy") return config.targetOrigin + local.pathname + local.search;
  const given = local.searchParams.get("u");
  if (!given) return config.targetOrigin + "/";
  const url = new URL(given, config.targetOrigin);
  assertAllowedOrigin(url, config);
  return url.href;
}

/** @param {string|null} value @param {object|string} configOrOrigin */
function toLocal(value, configOrOrigin) {
  const config = normalizeConfig(configOrOrigin);
  if (!value) return "/chatgpt";
  const url = new URL(value, config.targetOrigin);
  const sameDefault = url.origin === config.targetOrigin;
  const allowed = isAllowed(url, config);
  if (!allowed) return value;
  if (sameDefault) return url.pathname + url.search + url.hash;
  return `/proxy?u=${encodeURIComponent(url.href)}`;
}

function isAllowed(url, config) {
  try { assertAllowedOrigin(url, config); return true; }
  catch { return false; }
}

function normalizeConfig(configOrOrigin) {
  if (typeof configOrOrigin === "string") return { targetOrigin: configOrOrigin, allowedOrigins: [configOrOrigin] };
  return configOrOrigin || { targetOrigin: "https://chatgpt.com", allowedOrigins: ["https://chatgpt.com"] };
}

module.exports = { toUpstream, toLocal };
