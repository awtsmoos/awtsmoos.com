//B"H
const crypto = require("crypto");
const { cookieHeader } = require("./cookieJar.cjs");

class RelayAuthError extends Error {
  constructor(status, error, safeHint, facts = {}) {
    super(`${status}: ${safeHint}`);
    this.name = "RelayAuthError";
    this.status = status;
    this.error = error;
    this.safeHint = safeHint;
    this.facts = facts;
  }
}

/**
 * Chapter 12: The Token Stayed Behind The Curtain.
 *
 * The Awtsmoos sends life into every letter, yet this vessel refuses to reveal
 * the king's seal. It asks the upstream session page whether a login spark is
 * present, returns only redacted summaries, and hands the raw token only to the
 * backend request that must carry it. No browser UI, event stream, or test log
 * receives the secret flame.
 *
 * @param {{targetOrigin:string}} config Relay runtime configuration.
 * @returns {Promise<{ok:boolean,status:string,error?:string,safeHint:string,httpStatus?:number,auth:{hasToken:boolean,tokenSummary:null|object,userSummary:null|object}}>} Safe session report.
 */
async function sessionStatus(config) {
  try {
    const response = await fetch(new URL("/api/auth/session", config.targetOrigin), {
      headers: requestHeaders(config.targetOrigin),
      redirect: "manual"
    });
    if (response.status === 401 || response.status === 403) return notLoggedIn(response.status, "upstream rejected the session cookie");
    if (!response.ok) return failure("session_endpoint_failed", response.status, "ChatGPT session endpoint did not return a usable JSON response.");
    const body = await response.json().catch(() => null);
    const token = findToken(body);
    if (!token) return notLoggedIn(response.status, "session JSON did not contain an access token");
    return {
      ok: true,
      status: "logged_in",
      safeHint: "A token is present and redacted. Backend-only relay requests may use it.",
      httpStatus: response.status,
      auth: { hasToken: true, tokenSummary: summarizeToken(token), userSummary: summarizeUser(body?.user) }
    };
  } catch (error) {
    return failure("session_status_failed", 0, "Could not reach the ChatGPT session endpoint through the relay.", error);
  }
}

/**
 * @param {{targetOrigin:string}} config Relay runtime configuration.
 * @returns {Promise<string>} Raw token for backend-only use.
 * @throws {RelayAuthError} Structured safe auth failure.
 */
async function requireAccessToken(config) {
  const response = await fetch(new URL("/api/auth/session", config.targetOrigin), {
    headers: requestHeaders(config.targetOrigin),
    redirect: "manual"
  }).catch(error => { throw new RelayAuthError("session_unreachable", "session_status_failed", "Could not reach the ChatGPT session endpoint.", { cause: String(error?.message || error) }); });
  if (response.status === 401 || response.status === 403) throw new RelayAuthError("not_logged_in", "auth_required", "Login cookies are missing or expired. Open /control, sign in, then retry.", { httpStatus: response.status });
  if (!response.ok) throw new RelayAuthError(classifyHttp(response.status), "session_endpoint_failed", safeHttpHint(response.status), { httpStatus: response.status });
  const body = await response.json().catch(() => null);
  const token = findToken(body);
  if (!token) throw new RelayAuthError("missing_token", "token_absent", "Session loaded but did not include an access token. Refresh ChatGPT login and retry.", { httpStatus: response.status });
  return token;
}

function requestHeaders(origin) {
  const headers = { accept: "application/json", referer: origin + "/", origin };
  const cookie = cookieHeader();
  if (cookie) headers.cookie = cookie;
  return headers;
}

function findToken(body) {
  return body?.accessToken || body?.token || body?.access_token || body?.auth?.accessToken || "";
}

function summarizeToken(token) {
  const text = String(token || "");
  return { length: text.length, sha256_12: crypto.createHash("sha256").update(text).digest("hex").slice(0, 12), redacted: redactToken(text) };
}

function redactToken(token) {
  const text = String(token || "");
  if (!text) return "";
  if (text.length <= 10) return "[redacted]";
  return `${text.slice(0, 4)}…${text.slice(-4)} (${text.length} chars)`;
}

function summarizeUser(user) {
  if (!user || typeof user !== "object") return null;
  return { hasUser: true, idPresent: Boolean(user.id), emailPresent: Boolean(user.email), namePresent: Boolean(user.name) };
}

function notLoggedIn(httpStatus, reason) {
  return { ok: true, status: "not_logged_in", safeHint: "Open /control, render ChatGPT through Node, finish login, then check again.", httpStatus, auth: { hasToken: false, tokenSummary: null, userSummary: null }, reason };
}

function failure(status, httpStatus, safeHint, error = null) {
  return { ok: false, status, error: status, safeHint, httpStatus, auth: { hasToken: false, tokenSummary: null, userSummary: null }, detail: error ? String(error?.message || error) : undefined };
}

function classifyHttp(status) {
  if (status === 401 || status === 403) return "not_logged_in";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "upstream_unavailable";
  return "session_endpoint_failed";
}

function safeHttpHint(status) {
  if (status === 429) return "ChatGPT is rate limiting session checks. Pause and retry.";
  if (status === 401 || status === 403) return "Login cookies are missing or expired. Open /control and sign in.";
  if (status >= 500) return "ChatGPT session service returned a server error. Retry later.";
  return "ChatGPT session endpoint returned an unexpected status.";
}

function publicAuthError(error) {
  if (error instanceof RelayAuthError) return { ok: false, status: error.status, error: error.error, safeHint: error.safeHint, facts: error.facts || {} };
  return { ok: false, status: "relay_error", error: "relay_error", safeHint: "Relay automation failed before a verified turn was committed.", facts: { message: String(error?.message || error) } };
}

module.exports = { RelayAuthError, sessionStatus, requireAccessToken, publicAuthError, redactToken };
