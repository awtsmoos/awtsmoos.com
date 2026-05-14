
// B"H

/**
 * B"H
 * Turns "a+b c" into ["a", "b", "c"].
 *
 * @param {string} scope Scope string.
 * @returns {string[]}
 */
function splitScopes(scope) {
  return String(scope || "")
    .replace(/\+/g, " ")
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * B"H
 * Strictly validates a requested scope list.
 *
 * @param {string} requested Requested scope string.
 * @param {string[]} allowed Allowed scopes.
 * @returns {{ok:boolean, scope:string, invalid:string[]}}
 */
function validateScope(requested, allowed) {
  const allowedSet = new Set(allowed || []);
  const wanted = splitScopes(requested);
  const invalid = wanted.filter(s => !allowedSet.has(s));

  if (invalid.length) {
    return {
      ok: false,
      scope: "",
      invalid
    };
  }

  return {
    ok: true,
    scope: wanted.join(" "),
    invalid: []
  };
}

/**
 * B"H
 * Cleans requested OAuth scopes against allowed scopes.
 *
 * Kept for compatibility with current code, but authorize.js below uses
 * validateScope for clear errors.
 *
 * @param {string} requested Requested scope string.
 * @param {string[]} allowed Allowed scopes.
 * @returns {string}
 */
function cleanScope(requested, allowed) {
  const allowedSet = new Set(allowed || []);

  const chosen = splitScopes(requested)
    .filter(s => allowedSet.has(s));

  if (chosen.length) return chosen.join(" ");

  if (allowedSet.has("profile")) return "profile";

  return allowed && allowed[0] ? allowed[0] : "profile";
}

/**
 * B"H
 * Returns invalid scopes.
 *
 * @param {string} requested Requested scope string.
 * @param {string[]} allowed Allowed scopes.
 * @returns {string[]}
 */
function invalidScopes(requested, allowed) {
  const allowedSet = new Set(allowed || []);
  return splitScopes(requested).filter(s => !allowedSet.has(s));
}

module.exports = {
  splitScopes,
  validateScope,
  cleanScope,
  invalidScopes
};
