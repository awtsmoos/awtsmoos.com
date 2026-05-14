
// B"H

const { json, html, redirect } = require("../tools/respond.js");
const { getQuery } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { getUserId, publicUser } = require("../core/currentUser.js");
const { cleanScope } = require("../core/scopes.js");
const { createCode } = require("../core/codeStore.js");
const { approvalPage } = require("../views/approvalPage.js");
const { loginPage } = require("../views/loginPage.js");
const { currentFullUrl, urlWithParams } = require("../tools/urls.js");

/**
 * B"H
 * OAuth authorization endpoint.
 *
 * If the user is not logged in, it opens a manual login page.
 * If the user is logged in, it shows an approval page.
 * If approval is present, it creates a one-use code and redirects back.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<object>} OAuth authorize response.
 */
async function authorize($i) {
  const q = getQuery($i);
  const client = getClient(q.client_id || "chatgpt");
  const redirectUri = q.redirect_uri;
  const responseType = q.response_type || "code";
  const state = q.state || "";
  const scope = cleanScope(q.scope || client.defaultScope, client.scopes);

  if (!redirectUri) {
    return json($i, { BH: "B\"H", ok: false, error: "missing_redirect_uri" }, 400);
  }

  if (!client.redirectAllowed(redirectUri)) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "redirect_uri_not_allowed",
      redirect_uri: redirectUri
    }, 400);
  }

  if (responseType !== "code") {
    return redirect($i, urlWithParams(redirectUri, {
      error: "unsupported_response_type",
      error_description: "Only response_type=code is supported.",
      state
    }));
  }

  const userId = getUserId($i);

  if (!userId) {
    return html($i, loginPage({
      clientName: client.name,
      loginUrl: "/login",
      continueUrl: currentFullUrl($i)
    }), 401);
  }

  if (!client.autoApprove && q.approve !== "1") {
    return html($i, approvalPage({
      client,
      userId,
      scope,
      approveUrl: urlWithParams(currentFullUrl($i), { approve: "1" })
    }));
  }

  const code = await createCode({
    userId,
    user: publicUser($i),
    clientId: client.id,
    redirectUri,
    scope,
    state
  });

  return redirect($i, urlWithParams(redirectUri, { code, state }));
}

module.exports = { authorize };
