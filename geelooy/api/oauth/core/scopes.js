
// B"H

/**
 * B"H
 * Cleans requested scopes against allowed scopes.
 * A scope is a vessel. A forbidden scope is not a vessel, only smoke.
 *
 * @param {string} requested Space-separated requested scopes.
 * @param {Array<string>} allowed Allowed scope list.
 * @returns {string} Cleaned space-separated scopes.
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
