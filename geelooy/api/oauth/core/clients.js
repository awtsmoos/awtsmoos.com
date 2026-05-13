
// B"H

const { oauthClients } = require("../data/clients.js");

/**
 * B"H
 * Finds an OAuth client by id.
 * Each client is a little moon around the account sun,
 * reflecting only the scopes it is allowed to hold.
 *
 * @param {string} id OAuth client id.
 * @returns {object} Normalized OAuth client definition.
 */
function getClient(id) {
  const client = oauthClients[id] || oauthClients.chatgpt;

  return {
    ...client,
    redirectAllowed(uri) {
      return client.redirectUris.some(rule => {
        if (rule === "*") return true;
        if (rule.endsWith("*")) return uri.startsWith(rule.slice(0, -1));
        return uri === rule;
      });
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

module.exports = { getClient, listClients };
