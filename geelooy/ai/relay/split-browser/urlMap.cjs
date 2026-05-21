//B"H

/**
 * Chapter 12: Every Path Remembered Its Mountain.
 *
 * ChatGPT's client asks for route data, scripts, workers, images, and auth
 * turns using absolute and root-relative paths. This mapper keeps those paths
 * exact while threading them through the local proxy vessel.
 *
 * @param {URL} local Localhost URL.
 * @param {string} origin Upstream origin.
 * @returns {string} Upstream URL.
 */
function toUpstream(local, origin) {
  if (local.pathname === "/chatgpt") return origin + "/" + local.search;
  if (local.pathname.startsWith("/chatgpt/")) return origin + local.pathname.slice("/chatgpt".length) + local.search;
  if (local.pathname !== "/proxy") return origin + local.pathname + local.search;
  const given = local.searchParams.get("u");
  if (!given) return origin + "/";
  const url = new URL(given, origin);
  if (url.origin !== origin) throw new Error("Only the configured target origin is allowed.");
  return url.href;
}

/** @param {string|null} value @param {string} origin */
function toLocal(value, origin) {
  if (!value) return "/chatgpt";
  const url = new URL(value, origin);
  return url.origin === origin ? `/proxy?u=${encodeURIComponent(url.href)}` : value;
}

module.exports = { toUpstream, toLocal };
