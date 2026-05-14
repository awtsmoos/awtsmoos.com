
// B"H

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { validateScope } = require("../core/scopes.js");
const { getQuery, getBody } = require("../tools/requestData.js");
const { json, html, redirect } = require("../tools/respond.js");
const { urlWithParams } = require("../tools/urls.js");
const { getUserId } = require("../core/currentUser.js");
const { approvalPage } = require("../views/approvalPage.js");

/**
 * B"H
 * Builds the OAuth authorize URL to continue after login.
 *
 * @param {object} opts OAuth params.
 * @returns {string}
 */
function authorizeUrl(opts) {
  return urlWithParams("/api/oauth/authorize", {
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    scope: opts.scope,
    state: opts.state || ""
  });
}

/**
 * B"H
 * OAuth authorization endpoint.
 *
 * @param {object} $i Awtsmoos dynamic route context.
 * @returns {Promise<object|string>}
 */
async function authorize($i) {
  const q = getQuery($i);
  const post = await getBody($i);

  const clientId = q.client_id || post.client_id || "chatgpt";
  const responseType = q.response_type || post.response_type || "code";
  const redirectUri = q.redirect_uri || post.redirect_uri || "";
  const requestedScope = q.scope || post.scope || "";
  const state = q.state || post.state || "";
  const approve = q.approve || post.approve || "";

  if (responseType !== "code") {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "unsupported_response_type",
      response_type: responseType
    }, 400);
  }

  const client = getClient(clientId);

  if (!client) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "invalid_client",
      client_id: clientId
    }, 400);
  }

  if (!client.redirectAllowed(redirectUri)) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "redirect_uri_not_allowed",
      redirect_uri: redirectUri,
      allowed: client.redirectUris
    }, 400);
  }

  const scopeCheck = validateScope(requestedScope || client.defaultScope, client.scopes);

  if (!scopeCheck.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "invalid_scope",
      requestedScope,
      invalid: scopeCheck.invalid,
      allowed: client.scopes
    }, 400);
  }

  const scope = scopeCheck.scope || client.defaultScope;
  const userId = getUserId($i);

  if (!userId) {
    const next = authorizeUrl({
      clientId: client.id,
      redirectUri,
      scope,
      state
    });

    return html($i, `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Login required</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{margin:0;font-family:system-ui;background:#050712;color:#fbfcff;display:grid;place-items:center;min-height:100vh}
    main{width:min(720px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.15);border-radius:28px;padding:32px;background:rgba(255,255,255,.08);box-shadow:0 30px 100px rgba(0,0,0,.45)}
    a{display:inline-block;margin-top:16px;padding:13px 18px;border-radius:999px;background:linear-gradient(135deg,#89d7ff,#d3a1ff);color:#06101d;text-decoration:none;font-weight:900}
    code{word-break:break-all;color:#89d7ff}
  </style>
</head>
<body>
  <main>
    <h1>B"H Login required</h1>
    <p>Log in to Awtsmoos, then OAuth will continue.</p>
    <p><code>${next}</code></p>
    <a href="/login?next=${encodeURIComponent(next)}">Login to Awtsmoos</a>
  </main>
</body>
</html>`, 401);
  }

  if (!client.autoApprove && approve !== "1") {
    const approveUrl = urlWithParams("/api/oauth/authorize", {
      response_type: "code",
      client_id: client.id,
      redirect_uri: redirectUri,
      scope,
      state,
      approve: "1"
    });

    if (typeof approvalPage === "function") {
      return approvalPage({
        client,
        userId,
        scope,
        approveUrl
      });
    }

    return html($i, `<!doctype html>
<html>
<body>
  <h1>B"H Allow Access?</h1>
  <p>${client.name} wants access.</p>
  <p>User: <code>${userId}</code></p>
  <p>Scopes: <code>${scope}</code></p>
  <a href="${approveUrl}">Allow</a>
</body>
</html>`);
  }

  const code = await saveCode({
    userId,
    clientId: client.id,
    redirectUri,
    scope,
    state
  });

  return redirect($i, urlWithParams(redirectUri, {
    code,
    state
  }));
}

module.exports = { authorize };
