
// B"H

/**
 * B"H
 * Cleans requested OAuth scopes against allowed scopes.
 *
 * @param {string} requested Requested scope string.
 * @param {Array<string>} allowed Allowed scope list.
 * @returns {string} Cleaned scope string.
 */
function cleanScope(requested, allowed) {
  const allowedSet = new Set(allowed || []);
  const chosen = String(requested || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter(s => allowedSet.has(s));

  if (chosen.length) return chosen.join(" ");
  return allowed && allowed[0] ? allowed[0] : "profile";
}

module.exports = { cleanScope };
