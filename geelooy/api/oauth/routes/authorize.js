
// B"H
const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { validateScope } = require("../core/scopes.js");
const { getQuery, getBody } = require("../tools/requestData.js");
const { json, html, browserRedirect, redirect } = require("../tools/respond.js");
const { localUrlFor, urlWithParams, fullUrlFor } = require("../tools/urls.js");
const { getUserId } = require("../core/currentUser.js");

function esc(x) {
  return String(x ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;");
}

function isApproved(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "approve", "approved"].includes(v);
}

function buildAuthorizeUrl(opts) {
  return localUrlFor("/api/oauth/authorize", {
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    scope: opts.scope,
    state: opts.state || "",
    approve: opts.approve || ""
  });
}

function approvalHtml(opts) {
  return [
    "<!doctype html><title>Approve OAuth</title>",
    "<h1>B\"H Allow Access?</h1>",
    "<p>" + esc(opts.client.name) + " wants OAuth access.</p>",
    "<p>User: <code>" + esc(opts.userId) + "</code></p>",
    "<p>Scopes: <code>" + esc(opts.scope) + "</code></p>",
    "<p><a href=\"" + esc(opts.approveUrl) + "\">Allow</a></p>",
    "<p>If the button does nothing, copy this URL:</p>",
    "<pre>" + esc(opts.approveUrl) + "</pre>"
  ].join("");
}

function loginUrl($i, nextPath) {
  return fullUrlFor($i, "/login", {
    next: fullUrlFor($i, nextPath)
  });
}

async function authorize($i) {
  const q = getQuery($i);
  const post = await getBody($i);

  const clientId = q.client_id || post.client_id || "chatgpt";
  const responseType = q.response_type || post.response_type || "code";
  const redirectUri = q.redirect_uri || post.redirect_uri || "";
  const requestedScope = q.scope || post.scope || "";
  const state = q.state || post.state || "";
  const approveRaw = q.approve || post.approve || "";

  if (responseType !== "code") {
    return json($i, { BH: "B\"H", ok: false, error: "unsupported_response_type" }, 400);
  }

  const client = getClient(clientId);
  if (!client) {
    return json($i, { BH: "B\"H", ok: false, error: "invalid_client" }, 400);
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
    const next = buildAuthorizeUrl({ clientId: client.id, redirectUri, scope, state });
    return redirect($i, loginUrl($i, next));
  }

  if (!client.autoApprove && !isApproved(approveRaw)) {
    const approvePath = buildAuthorizeUrl({
      clientId: client.id,
      redirectUri,
      scope,
      state,
      approve: "1"
    });
    return html($i, approvalHtml({
      client,
      userId,
      scope,
      approveUrl: fullUrlFor($i, approvePath)
    }));
  }

  const code = await saveCode({
    userId,
    clientId: client.id,
    redirectUri,
    scope,
    state
  });

  return browserRedirect($i, urlWithParams(redirectUri, { code, state }));
}

module.exports = { authorize };
