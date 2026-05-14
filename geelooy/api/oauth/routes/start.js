
// B"H

const { json } = require("../tools/respond.js");
const { getQuery } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { fullUrlFor } = require("../tools/urls.js");
const { getUserId, publicUser } = require("../core/currentUser.js");

/**
 * B"H
 * Gives a human-readable OAuth starting point.
 *
 * This is useful for manual testing and for APIs that want to discover
 * the login URL and authorize URL before beginning the OAuth flow.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON response with useful OAuth URLs.
 */
async function start($i) {
  const q = getQuery($i);
  const client = getClient(q.client_id || "chatgpt");

  const authorizeUrl = fullUrlFor($i, "/api/oauth/authorize", {
    client_id: client.id,
    response_type: "code",
    redirect_uri: q.redirect_uri || client.exampleRedirectUri,
    scope: q.scope || client.defaultScope,
    state: q.state || ""
  });

  return json($i, {
    BH: "B\"H",
    ok: true,
    message: "Open loginUrl if you are not logged in. Then open authorizeUrl.",
    loggedIn: !!getUserId($i),
    user: publicUser($i),
    client: {
      id: client.id,
      name: client.name,
      scopes: client.scopes
    },
    loginUrl: fullUrlFor($i, "/login"),
    authorizeUrl
  });
}

module.exports = { start };
