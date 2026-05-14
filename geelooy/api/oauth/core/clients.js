
// B"H
const { oauthClients } = require("../data/clients.js");

/**
 * B"H
 * Escapes regex characters inside a wildcard redirect rule.
 *
 * @param {string} text Raw text.
 * @returns {string} Regex-safe text.
 */
function escapeRegex(text) {
  return String(text).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * B"H
 * Converts a simple wildcard rule into a RegExp.
 *
 * Example:
 * https://chat.openai.com/aip/g-*/oauth/callback
 *
 * @param {string} rule Redirect URI rule.
 * @returns {RegExp}
 */
function wildcardToRegex(rule) {
  const escaped = escapeRegex(rule).replace(/\\\*/g, ".*").replace(/\*/g, ".*");
  return new RegExp("^" + escaped + "$");
}

/**
 * B"H
 * Creates equivalent URL forms for origin and slash-origin cases.
 *
 * @param {string} uri Redirect URI.
 * @returns {string[]}
 */
function uriForms(uri) {
  const out = new Set();

  if (uri) out.add(String(uri));

  try {
    const u = new URL(uri);
    out.add(u.toString());

    if (u.pathname === "/" && !u.search && !u.hash) {
      out.add(u.origin);
      out.add(u.origin + "/");
    }
  } catch (e) {}

  return [...out];
}

/**
 * B"H
 * Checks whether one redirect rule allows one URI.
 *
 * Exact match is preferred.
 * Wildcard match is intentionally narrow and controlled by data/clients.js.
 *
 * @param {string} uri Redirect URI.
 * @param {string} rule Redirect rule.
 * @returns {boolean}
 */
function ruleAllows(uri, rule) {
  if (!uri || !rule) return false;

  const forms = uriForms(uri);

  for (const form of forms) {
    if (form === rule) return true;

    if (String(rule).includes("*") && wildcardToRegex(rule).test(form)) {
      return true;
    }
  }

  return false;
}

/**
 * B"H
 * Gets a normalized OAuth client.
 *
 * If client_id is blank during GPT setup mistakes, fall back to chatgpt.
 * Still set Client ID to "chatgpt" in GPT Builder.
 *
 * @param {string} id OAuth client id.
 * @returns {object|null} OAuth client object.
 */
function getClient(id) {
  const key = id || "chatgpt";
  const client = oauthClients[key] || null;

  if (!client) return null;

  const normalized = {
    ...client,

    clientSecret: client.clientSecret || client.secret || "",
    secret: client.secret || client.clientSecret || "",

    redirectAllowed(uri) {
      const rules = client.redirectUris || client.redirectURIs || client.allowedRedirectUris || [];
      return rules.some(rule => ruleAllows(uri, rule));
    },

    secretAllowed(secret) {
      const expected = client.clientSecret || client.secret || "";

      /**
       * Empty expected secret means testing mode.
       */
      if (!expected) return true;

      return String(secret || "") === expected;
    }
  };

  return normalized;
}

/**
 * B"H
 * Lists public OAuth client metadata.
 *
 * @returns {Array<object>}
 */
function listClients() {
  return Object.values(oauthClients).map(c => ({
    id: c.id,
    name: c.name,
    scopes: c.scopes,
    defaultScope: c.defaultScope,
    autoApprove: c.autoApprove
  }));
}

module.exports = {
  getClient,
  listClients,
  ruleAllows,
  wildcardToRegex,
  uriForms
};
