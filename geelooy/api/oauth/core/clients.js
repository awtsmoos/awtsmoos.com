
// B"H
const { oauthClients } = require("../data/clients.js");

/**
 * B"H
 * Finds and normalizes an OAuth client.
 *
 * Empty client_id falls back to chatgpt because some GPT Builder retries
 * can temporarily send client_id as blank during setup mistakes.
 *
 * @param {string} id OAuth client id.
 * @returns {object|null}
 */
function getClient(id) {
  const key = id || "chatgpt";
  const client = oauthClients[key] || null;

  if (!client) return null;

  return {
    ...client,

    clientSecret: client.clientSecret || client.secret || "",
    secret: client.secret || client.clientSecret || "",

    redirectAllowed(uri) {
      if (!uri) return false;

      return (client.redirectUris || []).some(rule => {
        if (rule === "*") return true;
        if (rule.endsWith("*")) return uri.startsWith(rule.slice(0, -1));
        return uri === rule;
      });
    },

    secretAllowed(secret) {
      const expected = client.clientSecret || client.secret || "";
      if (!expected) return true;
      return secret === expected;
    }
  };
}

/**
 * B"H
 * Lists public client metadata.
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

module.exports = { getClient, listClients };
