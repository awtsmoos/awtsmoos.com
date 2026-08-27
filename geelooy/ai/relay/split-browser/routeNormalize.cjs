//B"H

/**
 * Chapter 16: The Crooked Cloudflare Tunnel Found Its True Mouth.
 *
 * Some challenge scripts build relative URLs from their own nested path, so a
 * clean `/proxy?u=...` becomes `/cdn-cgi/.../proxy?u=...`. This normalizer
 * recognizes that buried proxy mouth and restores the intended local route.
 *
 * @param {string} rawUrl Incoming local URL.
 * @returns {string} URL corrected for local proxy routing.
 */
function normalizeRouteUrl(rawUrl) {
  const text = String(rawUrl || "/");
  const marker = "/proxy?u=";
  const index = text.indexOf(marker);
  if (index <= 0) return text;
  return text.slice(index);
}

module.exports = { normalizeRouteUrl };
