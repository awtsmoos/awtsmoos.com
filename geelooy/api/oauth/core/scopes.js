
// B"H

function splitScopes(scope) {
  return String(scope || "")
    .replace(/\+/g, " ")
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

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

function cleanScope(requested, allowed) {
  const allowedSet = new Set(allowed || []);
  const chosen = splitScopes(requested).filter(s => allowedSet.has(s));

  if (chosen.length) return chosen.join(" ");
  if (allowedSet.has("profile")) return "profile";

  return allowed && allowed[0] ? allowed[0] : "profile";
}

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
