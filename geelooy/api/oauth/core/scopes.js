
// B"H

/**
 * B"H
 * Cleans requested OAuth scopes against allowed scopes.
 *
 * Returns only allowed scopes. If none are requested, default to profile.
 */
function cleanScope(requested, allowed) {
  const allowedSet = new Set(allowed || []);

  const chosen = String(requested || "")
    .replace(/\+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(s => allowedSet.has(s));

  if (chosen.length) return chosen.join(" ");

  if (allowedSet.has("profile")) return "profile";

  return allowed && allowed[0] ? allowed[0] : "profile";
}

/**
 * B"H
 * Strict check for debugging.
 */
function invalidScopes(requested, allowed) {
  const allowedSet = new Set(allowed || []);

  return String(requested || "")
    .replace(/\+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(s => !allowedSet.has(s));
}

module.exports = {
  cleanScope,
  invalidScopes
};
