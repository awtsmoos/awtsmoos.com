// B"H
const { relaySettings, CHATGPT } = require("./settings.js");
const { cookieHeader, openLogin } = require("./chromeCookies.js");
const { rememberResponse, readRelayBody } = require("./streams.js");

/**
 * Chapter 5: The ChatGPT Relay Entered The Tunnel Palace.
 *
 * The old standalone relay becomes a callable tunnel feature. It still guards
 * origin, uses browser-shaped headers, attaches ChatGPT cookies, and stores the
 * response body for read/resume/text/json/blob actions.
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
  if (action === "relayCookies" || action === "cookies") return { ok: true, cookieBytes: (await cookieHeader(settings)).length };
  if (action === "relayFetch" || action === "fetch") return await startFetch(payload, settings);
  if (action === "relayBody" || action === "body") return { ok: true, result: await readRelayBody(payload) };
  throw new Error("unknown_relay_action:" + action);
}

function health(settings, config) {
  return { ok: true, relay: true, kind: "chatgpt", port: settings.port, debugPort: settings.debugPort, debugPortCandidates: settings.debugPortCandidates, profile: settings.profile, tunnelName: config.tunnelName || "" };
}

async function startFetch(payload, settings) {
  const target = new URL(payload.url || payload.href || "");
  if (target.origin !== CHATGPT) throw new Error("Only chatgpt.com requests are allowed.");
  const options = payload.options || {};
  const headers = browserHeaders(cleanHeaders(options.headers || payload.headers || {}));
  headers.cookie = await cookieHeader(settings);
  const response = await fetch(target, { method: options.method || payload.method || "GET", headers, body: options.body || payload.body, cache: "no-store" });
  return rememberResponse(response);
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
