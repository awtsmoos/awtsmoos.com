// B"H
const { relaySettings, CHATGPT } = require("./settings.js");
const { openLogin } = require("./chromeCookies.js");
const { browserPageFetch, chatgptCookieHeader, syncChromeToJar } = require("./browserApi.js");
const { rememberResponse, readRelayBody } = require("./streams.js");

/**
 * Chapter 23: The Tunnel Learned The Else.
 *
 * A tunnel relay must not be a single brittle doorway. The Awtsmoos first asks
 * the logged-in browser to fetch, because that vessel owns the session. If that
 * browser vessel errors, times out, or returns a challenge/failure, the relay can
 * fall through to the Node path with the full Chrome cookie header or persistent
 * jar. Callers may disable this with `fallback: false`, or force one path with
 * `fetchMode: "browser"` / `fetchMode: "node"`.
 *
 * @param {object} payload Relay action payload.
 * @param {object} config Tunnel config.
 * @returns {Promise<object>} Relay action result.
 */
async function handleChatgptRelay(payload = {}, config = {}) {
  const settings = relaySettings(config);
  const action = payload.action || payload.relayAction || "health";
  if (action === "relayHealth" || action === "health") return health(settings, config);
  if (action === "relayOpenLogin" || action === "openLogin") return await openLogin(settings);
  if (action === "relayCookies" || action === "cookies") return await cookies(payload);
  if (action === "relayFetch" || action === "fetch") return await startFetch(payload);
  if (action === "relayBody" || action === "body") return { ok: true, result: await readRelayBody(payload) };
  throw new Error("unknown_relay_action:" + action);
}

function health(settings, config) {
  return { ok: true, relay: true, kind: "chatgpt", port: settings.port, debugPort: settings.debugPort, debugPortCandidates: settings.debugPortCandidates, profile: settings.profile, tunnelName: config.tunnelName || "" };
}

async function cookies(payload = {}) {
  const cookieStatus = await chatgptCookieHeader({ ...payload, url: payload.url || CHATGPT, includeValues: payload.includeValues === true });
  if (payload.syncToJar !== false) {
    const sync = await syncChromeToJar({ ...payload, url: payload.url || CHATGPT, jar: payload.jar || payload.cookieJarName || "chatgpt" }).catch(error => ({ ok: false, error: error.message }));
    return { ...cookieStatus, syncedJar: sync };
  }
  return cookieStatus;
}

async function startFetch(payload) {
  const target = new URL(payload.url || payload.href || "");
  if (target.origin !== CHATGPT) throw new Error("Only chatgpt.com requests are allowed.");
  if (payload.fetchMode === "node") return await nodeFetch(payload, target, null);
  const browserResult = await safeBrowserFetch(payload, target);
  if (shouldKeepBrowserResult(payload, browserResult)) return browserResult;
  if (payload.fetchMode === "browser" || payload.fallback === false) return browserResult;
  return await nodeFetch(payload, target, browserResult);
}

async function safeBrowserFetch(payload, target) {
  try {
    const result = await browserPageFetch({ ...payload, action: "relayBrowserFetch", url: target.href });
    return { ...result, primaryFetch: "browser" };
  } catch (error) {
    return { ok: false, status: 0, browserFetch: true, primaryFetch: "browser", browserError: error.message || String(error), error: error.message || String(error) };
  }
}

function shouldKeepBrowserResult(payload, result) {
  if (payload.fallback === false || payload.fetchMode === "browser") return true;
  if (!result || result.ok === false) return false;
  if (Number(result.status) >= 400) return false;
  return true;
}

async function nodeFetch(payload, target, fallbackFrom = null) {
  const options = payload.options || {};
  const headers = browserHeaders(cleanHeaders(options.headers || payload.headers || {}));
  const cookieStatus = await chatgptCookieHeader({ ...payload, url: target.href, includeValues: true, source: payload.cookieSource || "chrome" });
  headers.cookie = cookieStatus.cookieHeader || "";
  const response = await fetch(target, { method: options.method || payload.method || "GET", headers, body: options.body || payload.body, cache: "no-store" });
  const metadata = rememberResponse(response);
  return { ...metadata, nodeFetch: true, primaryFetch: fallbackFrom ? "node-fallback" : "node", fallbackFrom: summarizeFallback(fallbackFrom), cookieCount: cookieStatus.count || 0, cookieBytes: cookieStatus.cookieBytes || 0 };
}

function summarizeFallback(result) {
  if (!result) return null;
  return { ok: result.ok, status: result.status || 0, browserFetch: !!result.browserFetch, browserError: result.browserError || result.error || null, id: result.id || result.streamId || null };
}

function cleanHeaders(input) {
  const h = {};
  for (const [k, v] of Object.entries(input || {})) if (!/^(host|origin|cookie|content-length)$/i.test(k)) h[k] = v;
  return h;
}

function browserHeaders(headers) {
  return { accept: "application/json, text/event-stream, */*", "accept-language": "en-US,en;q=0.9", "user-agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome Safari/537.36", referer: CHATGPT + "/", ...headers };
}

module.exports = { handleChatgptRelay };
