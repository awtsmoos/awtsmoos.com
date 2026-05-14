
// B"H
const { oauthClients } = require("../data/clients.js");

function escapeRegex(text) {
  return String(text).replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

function wildcardToRegex(rule) {
  const escaped = escapeRegex(rule).replace(/\\\*/g, ".*").replace(/\*/g, ".*");
  return new RegExp("^" + escaped + "$");
}

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

function getClient(id) {
  const key = id || "chatgpt";
  const client = oauthClients[key] || null;

  if (!client) return null;

  return {
    ...client,

    clientSecret: client.clientSecret || client.secret || "",
    secret: client.secret || client.clientSecret || "",

    redirectAllowed(uri) {
      const rules = client.redirectUris || client.redirectURIs || client.allowedRedirectUris || [];
      return rules.some(rule => ruleAllows(uri, rule));
    },

    secretAllowed(secret) {
      const expected = client.clientSecret || client.secret || "";
      if (!expected) return true;
      return String(secret || "") === expected;
    }
  };
}

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
