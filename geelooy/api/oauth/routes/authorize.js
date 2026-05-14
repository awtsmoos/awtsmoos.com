
// B"H

const { getClient } = require("../core/clients.js");
const { saveCode } = require("../core/codeStore.js");
const { validateScope } = require("../core/scopes.js");
const { getQuery, getBody } = require("../tools/requestData.js");
const { json, html, redirect } = require("../tools/respond.js");
const { localUrlFor, urlWithParams } = require("../tools/urls.js");
const { getUserId } = require("../core/currentUser.js");

function esc(x) {
  return String(x ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;");
}

function buildAuthorizeUrl(opts) {
  return localUrlFor("/api/oauth/authorize", {
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    scope: opts.scope,
    state: opts.state || ""
  });
}

function approvalHtml(opts) {
  return "<!doctype html>" +
    "<html><head><meta charset='utf-8'><title>Approve OAuth</title>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
    "<style>" +
    "body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 10% 0,rgba(137,215,255,.24),transparent 34%),linear-gradient(135deg,#050712,#10172d,#171127);color:#fbfcff;font-family:system-ui}" +
    "main{width:min(760px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.15);border-radius:30px;padding:34px;background:rgba(255,255,255,.08);box-shadow:0 32px 110px rgba(0,0,0,.45);backdrop-filter:blur(16px)}" +
    "h1{font-size:clamp(38px,7vw,68px);line-height:.92;letter-spacing:-.06em;margin:0 0 14px}" +
    "p{color:#c3cae0;line-height:1.55}code{color:#89d7ff;word-break:break-all}" +
    "a.button{display:inline-block;margin-top:16px;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#89d7ff,#d3a1ff);color:#07101d;text-decoration:none;font-weight:950}" +
    ".box{margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,.15);border-radius:18px;background:rgba(0,0,0,.22)}" +
    "</style></head><body><main>" +
    "<h1>B&quot;H Allow Access?</h1>" +
    "<p><strong>" + esc(opts.client.name) + "</strong> wants OAuth access to your Awtsmoos account.</p>" +
    "<p>User: <code>" + esc(opts.userId) + "</code></p>" +
    "<p>Scopes: <code>" + esc(opts.scope) + "</code></p>" +
    "<a class='button' href='" + esc(opts.approveUrl) + "'>Allow</a>" +
    "<div class='box'><p>If the button does nothing, copy this URL:</p><code>" + esc(opts.approveUrl) + "</code></div>" +
    "</main></body></html>";
}

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
    const next = buildAuthorizeUrl({
      clientId: client.id,
      redirectUri,
      scope,
      state
    });

    return html($i,
      "<!doctype html><html><head><meta charset='utf-8'><title>Login required</title>" +
      "<meta name='viewport' content='width=device-width, initial-scale=1'></head>" +
      "<body style='margin:0;font-family:system-ui;background:#050712;color:white;display:grid;place-items:center;min-height:100vh'>" +
      "<main style='width:min(720px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.15);border-radius:28px;padding:32px;background:rgba(255,255,255,.08)'>" +
      "<h1>B&quot;H Login required</h1>" +
      "<p>Log in to Awtsmoos, then OAuth will continue.</p>" +
      "<a style='display:inline-block;margin-top:16px;padding:13px 18px;border-radius:999px;background:linear-gradient(135deg,#89d7ff,#d3a1ff);color:#06101d;text-decoration:none;font-weight:900' href='/login?next=" + encodeURIComponent(next) + "'>Login to Awtsmoos</a>" +
      "</main></body></html>",
      401
    );
  }

  if (!client.autoApprove && approve !== "1") {
    const approveUrl = buildAuthorizeUrl({
      clientId: client.id,
      redirectUri,
      scope,
      state
    }) + "&approve=1";

    return html($i, approvalHtml({
      client,
      userId,
      scope,
      approveUrl
    }));
  }

  const code = await saveCode({
    userId,
    clientId: client.id,
    redirectUri,
    scope,
    state
  });

  /*
   * Critical:
   * redirectUri is external, e.g. https://chat.openai.com/aip/g-.../oauth/callback
   * Do NOT use localUrlFor here.
   */
  return redirect($i, urlWithParams(redirectUri, {
    code,
    state
  }));
}

module.exports = { authorize };
