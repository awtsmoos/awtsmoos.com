// B"H
const crypto = require("crypto");
const { chatgptCookieHeader, FALLBACK_USER_AGENT } = require("./cookies.js");
const { readSessionCache, saveSessionCache, hasCachedAuth } = require("./sessionCache.js");

const CHATGPT_ORIGIN = "https://chatgpt.com";

/**
 * B"H
 * Chapter 410: The Old Token Cache Returned From Exile.
 *
 * geelooy/ai's old working law was simple: fetch `/api/auth/session`, read
 * `accessToken`, cache it, and send backend requests with bearer authority. The
 * tunnel now follows that law with three vessels: live Chrome cookies first,
 * saved local session second, and redacted status always. No composer scraping.
 *
 * @param {object} payload ChatGPT action payload.
 * @returns {Promise<{ok:boolean,authenticated:boolean,token:string,cookie:string,userAgent:string,session:object}>} Auth vessel.
 */
async function directAuth(payload = {}) {
  const profile = payload.profile || payload.profileName || "default";
  const live = await authFromLiveChrome(payload).catch(error => ({ ok: false, error: error.message }));
  if (live.authenticated && live.token) {
    await saveSessionCache(profile, { token: live.token, cookie: live.cookie, userAgent: live.userAgent, port: live.port, session: live.session });
    return live;
  }
  const cache = await readSessionCache(profile);
  if (hasCachedAuth(cache)) {
    const cached = await authFromSaved(cache).catch(error => ({ ok: false, authenticated: false, error: error.message }));
    if (cached.authenticated && cached.token) {
      await saveSessionCache(profile, { token: cached.token, cookie: cached.cookie, userAgent: cached.userAgent, session: cached.session });
      return cached;
    }
    if (cache.token) return cachedTokenAuth(cache, cached);
  }
  return unauthenticated(live, cache);
}

async function authFromLiveChrome(payload = {}) {
  const cookies = await chatgptCookieHeader(payload);
  if (!cookies.cookie) return { ok: false, authenticated: false, token: "", cookie: "", userAgent: cookies.userAgent || FALLBACK_USER_AGENT, port: cookies.port, session: safeSession({ status: 0, body: {}, token: "", cookies, source: "chrome-empty" }) };
  return await authFromMaterial({ cookie: cookies.cookie, userAgent: cookies.userAgent, port: cookies.port, source: "chrome-devtools", cookies });
}

async function authFromSaved(cache = {}) {
  return await authFromMaterial({ cookie: cache.cookie || "", token: cache.token || "", userAgent: cache.userAgent || FALLBACK_USER_AGENT, port: cache.port || 0, source: "saved-session", cookies: { count: cookieCount(cache.cookie), names: cookieNames(cache.cookie) } });
}

async function authFromMaterial(material = {}) {
  const response = await fetch(`${CHATGPT_ORIGIN}/api/auth/session`, {
    headers: sessionHeaders(material),
    redirect: "manual"
  });
  const body = await response.json().catch(() => ({}));
  const token = tokenFrom(body) || material.token || "";
  return {
    ok: response.ok,
    authenticated: Boolean(token || body?.user || body?.expires),
    token,
    cookie: material.cookie || "",
    userAgent: material.userAgent || FALLBACK_USER_AGENT,
    port: material.port || 0,
    source: material.source || "unknown",
    session: safeSession({ status: response.status, body, token, cookies: material.cookies || {}, source: material.source || "unknown" })
  };
}

function cachedTokenAuth(cache = {}, attempted = {}) {
  return {
    ok: Boolean(cache.token),
    authenticated: Boolean(cache.token),
    token: cache.token || "",
    cookie: cache.cookie || "",
    userAgent: cache.userAgent || FALLBACK_USER_AGENT,
    port: cache.port || 0,
    source: "saved-token-fallback",
    session: { ...(attempted.session || {}), authenticated: Boolean(cache.token), tokenSummary: summarizeToken(cache.token), cacheFallback: true }
  };
}

function sessionHeaders(material = {}) {
  return requestHeaders({ ...material, accept: "application/json", contentType: "" });
}

function requestHeaders(material = {}) {
  const headers = {
    accept: material.accept || "application/json, text/event-stream, */*",
    "accept-language": material.acceptLanguage || "en-US,en;q=0.9",
    "user-agent": material.userAgent || FALLBACK_USER_AGENT,
    referer: `${CHATGPT_ORIGIN}/`,
    origin: CHATGPT_ORIGIN
  };
  if (material.contentType) headers["content-type"] = material.contentType;
  if (material.token) headers.authorization = `Bearer ${material.token}`;
  if (material.cookie) headers.cookie = material.cookie;
  return headers;
}

function tokenFrom(body = {}) {
  return body.accessToken || body.access_token || body.token || body.auth?.accessToken || "";
}

function safeSession({ status, body, token, cookies, source }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    source,
    authenticated: Boolean(token || body?.user || body?.expires),
    user: body?.user ? { id: body.user.id || "", email: body.user.email || "", name: body.user.name || "" } : null,
    expires: body?.expires || null,
    tokenSummary: token ? summarizeToken(token) : null,
    cookieSummary: { count: cookies.count || 0, names: cookies.names || [] }
  };
}

function unauthenticated(live, cache) {
  return { ok: false, authenticated: false, token: "", cookie: "", userAgent: FALLBACK_USER_AGENT, source: "none", session: { ok: false, authenticated: false, live: redactAttempt(live), cachePresent: hasCachedAuth(cache) } };
}

function redactAttempt(value = {}) {
  return { ok: Boolean(value.ok), authenticated: Boolean(value.authenticated), source: value.source || "", error: value.error || "", session: value.session || null };
}

function summarizeToken(token) {
  const text = String(token || "");
  return text ? { length: text.length, sha256_12: crypto.createHash("sha256").update(text).digest("hex").slice(0, 12) } : null;
}

function cookieCount(cookie = "") { return String(cookie || "").split(";").filter(Boolean).length; }
function cookieNames(cookie = "") { return String(cookie || "").split(";").map(part => part.trim().split("=")[0]).filter(Boolean).slice(0, 24); }

module.exports = { directAuth, sessionHeaders, requestHeaders, tokenFrom, CHATGPT_ORIGIN };
