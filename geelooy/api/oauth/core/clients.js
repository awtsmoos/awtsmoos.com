
// B"H

const { oauthClients } = require("../data/clients.js");

/**
 * B"H
 * Escapes regex characters inside a wildcard redirect rule.
 *
 * @param {string} text Raw rule text.
 * @returns {string} Regex-safe text.
 */
function escapeRegex(text) {
  return String(text).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * B"H
 * Converts a wildcard redirect rule into a regular expression.
 *
 * @param {string} rule Redirect URI rule.
 * @returns {RegExp} Regex for matching the redirect URI.
 */
function wildcardToRegex(rule) {
  const escaped = escapeRegex(rule).replace(/\*/g, ".*");
  return new RegExp("^" + escaped + "$");
}

/**
 * B"H
 * Creates equivalent forms for bare origins and slash origins.
 *
 * @param {string} uri Redirect URI.
 * @returns {Array<string>} Equivalent redirect URI forms.
 */
function uriForms(uri) {
  const out = new Set();
  out.add(uri);

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
 * @param {string} uri Redirect URI.
 * @param {string} rule Redirect rule.
 * @returns {boolean} True if allowed.
 */
function ruleAllows(uri, rule) {
  if (rule === "*") return true;

  const forms = uriForms(uri);

  for (const form of forms) {
    if (form === rule) return true;

    if (rule.endsWith("/*")) {
      const originRule = rule.slice(0, -2);
      if (form === originRule || form === originRule + "/") return true;
    }

    if (rule.includes("*") && wildcardToRegex(rule).test(form)) {
      return true;
    }
  }

  return false;
}

/**
 * B"H
 * Gets a normalized OAuth client.
 *
 * @param {string} id OAuth client id.
 * @returns {object} OAuth client object.
 */
function getClient(id) {
  const client = oauthClients[id] || oauthClients.chatgpt;

  return {
    ...client,

    redirectAllowed(uri) {
      if (!uri) return false;
      return client.redirectUris.some(rule => ruleAllows(uri, rule));
    },

    secretAllowed(secret) {
      if (!client.clientSecret) return true;
      return secret === client.clientSecret;
    }
  };
}

/**
 * B"H
 * Lists public OAuth client metadata.
 *
 * @returns {Array<object>} Client list.
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
