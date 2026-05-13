// B"H

const { oauthClients } = require("../data/clients.js");

/**
 * B"H
 * Turns a wildcard rule into a real RegExp.
 *
 * A rule like:
 * https://chatgpt.com/*
 *
 * becomes a gate that allows:
 * https://chatgpt.com/
 * https://chatgpt.com/anything
 *
 * And a rule like:
 * https://*.openai.com/*
 *
 * allows subdomains of openai.com.
 *
 * @param {string} rule OAuth redirect rule.
 * @returns {RegExp} Regex for the rule.
 */
function wildcardToRegex(rule) {
  const escaped = String(rule)
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp("^" + escaped + "$");
}

/**
 * B"H
 * Normalizes redirect URIs so bare origins and slash origins can both pass.
 *
 * @param {string} uri Redirect URI.
 * @returns {string[]} Equivalent URI forms.
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
 * Checks whether a redirect URI is allowed by a client rule.
 *
 * @param {string} uri Redirect URI from OAuth request.
 * @param {string} rule Redirect rule from client config.
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
 * Finds an OAuth client by id.
 *
 * @param {string} id OAuth client id.
 * @returns {object} Normalized OAuth client definition.
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
 * Lists public client metadata.
 *
 * @returns {Array<object>} Client list without private secrets.
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