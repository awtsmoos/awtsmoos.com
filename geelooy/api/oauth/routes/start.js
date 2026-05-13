
// B"H

const { json } = require("../tools/respond.js");
const { getQuery } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { fullUrlFor } = require("../tools/urls.js");
const { getUserId, publicUser } = require("../core/currentUser.js");

/**
 * B"H
 * Shows a clean beginning for OAuth.
 * If the traveler is lost, this hands them the login road and the authorize road.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON response with login and authorization helper URLs.
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
    message: "Open loginUrl if not logged in. Then open authorizeUrl.",
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
