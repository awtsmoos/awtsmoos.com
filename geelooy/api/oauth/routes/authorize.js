
// B"H

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { approvalPage } = require("../views/approvalPage.js");
const { loginPage } = require("../views/loginPage.js");

function json($i, data, status = 200) {
  try {
    $i.response.statusCode = status;
    $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return JSON.stringify(data, null, 2);
}

function getQuery($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

function getPost($i) {
  return $i.paramKinds?.POST || $i.$_POST || {};
}

function getUserId($i) {
  const user = $i.request?.user;
  return user?.info?.userId || user?.userId || user?.id || null;
}

function urlWithParams(base, params) {
  const u = new URL(base);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      u.searchParams.set(k, String(v));
    }
  }

  return u.toString();
}

function isRedirectAllowed(client, redirectUri) {
  if (!redirectUri) return false;

  const list = client.redirectUris || client.redirectURIs || client.allowedRedirectUris || [];

  return list.includes(redirectUri);
}

function scopeAllowed(client, requestedScope) {
  const allowed = new Set(client.scopes || []);
  const requested = String(requestedScope || client.defaultScope || "")
    .split(/\s+/)
    .filter(Boolean);

  if (!requested.length) return client.defaultScope || "";

  for (const scope of requested) {
    if (!allowed.has(scope)) {
      return null;
    }
  }

  return requested.join(" ");
}

async function authorize($i) {
  const q = getQuery($i);
  const post = getPost($i);

  const clientId = q.client_id || post.client_id;
  const responseType = q.response_type || post.response_type || "code";
  const redirectUri = q.redirect_uri || post.redirect_uri;
  const requestedScope = q.scope || post.scope;
  const approve = q.approve || post.approve;

  if (responseType !== "code") {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "unsupported_response_type"
    }, 400);
  }

  const client = getClient(clientId);

  if (!client) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "invalid_client"
    }, 400);
  }

  if (!isRedirectAllowed(client, redirectUri)) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "redirect_uri_not_allowed",
      redirect_uri: redirectUri
    }, 400);
  }

  const scope = scopeAllowed(client, requestedScope);

  if (!scope) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "invalid_scope",
      requestedScope
    }, 400);
  }

  const userId = getUserId($i);

  if (!userId) {
    if (typeof loginPage === "function") {
      return loginPage({
        client,
        clientId,
        redirectUri,
        responseType,
        scope
      });
    }

    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "login_required",
      loginUrl: "/login",
      continueUrl: "/api/oauth/authorize?client_id=" + encodeURIComponent(clientId) +
        "&response_type=code&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent(scope)
    }, 401);
  }

  if (!client.autoApprove && approve !== "1") {
    if (typeof approvalPage === "function") {
      return approvalPage({
        client,
        userId,
        clientId,
        redirectUri,
        responseType,
        scope
      });
    }

    return [
      "<!doctype html><html><body>",
      "<h1>B\"H Allow Access?</h1>",
      "<p>" + client.name + " wants access.</p>",
      "<p>User: <code>" + userId + "</code></p>",
      "<p>Scopes: <code>" + scope + "</code></p>",
      "<a href=\"/api/oauth/authorize?client_id=" + encodeURIComponent(clientId) +
        "&response_type=code&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent(scope) +
        "&approve=1\">Allow</a>",
      "</body></html>"
    ].join("");
  }

  const code = saveCode({
    userId,
    clientId: client.id,
    redirectUri,
    scope
  });

  return {
    redirect: urlWithParams(redirectUri, { code })
  };
}

module.exports = { authorize };
