// B"H
const { handleChrome } = require("../chrome/index.js");
const { cdpCall, ensurePage } = require("../chrome/cdp.js");
const { loadConfig } = require("../../lib/config.js");
const { rememberStaticResponse } = require("./streams.js");
const { loadJar, saveJar, jarName, listJars, listCookies, setCookie, deleteCookie, clearJar } = require("../fs/httpCookieJar.js");

const CHATGPT_DOMAINS = ["chatgpt.com", "openai.com"];

/**
 * Chapter 20: Fetch Returned Into The Browser That Owned The Breath.
 *
 * Cookies alone can still be refused when Node reaches ChatGPT from outside the
 * browser. This file therefore exposes both raw CDP and in-page `fetch`, letting
 * the logged-in Chrome context carry credentials, headers, origin, and browser
 * protections that cannot be copied into a plain Node request.
 *
 * @param {object} payload Browser or cookie-jar relay action.
 * @returns {Promise<object>} Routed browser/jar result.
 */
async function handleBrowserRelay(payload = {}) {
  const action = payload.action || payload.browserAction || payload.relayAction || "relayBrowserStatus";
  if (action === "relayBrowserStatus") return await handleChrome({ ...payload, action: "chromeStatus" });
  if (action === "relayBrowserLaunch") return await handleChrome({ ...payload, action: "chromeLaunch", url: payload.url || "https://chatgpt.com" });
  if (action === "relayBrowserNavigate") return await handleChrome({ ...payload, action: "chromeNavigate" });
  if (action === "relayBrowserEval") return await handleChrome({ ...payload, action: "chromeEval" });
  if (action === "relayBrowserRun") return await handleChrome({ ...payload, action: "chromeRunScript" });
  if (action === "relayBrowserFetch") return await browserPageFetch(payload);
  if (action === "relayBrowserCookies") return await handleChrome({ ...payload, action: "chromeCookies", includeValues: payload.includeValues === true });
  if (action === "relayBrowserSetCookie") return await handleChrome({ ...payload, action: "chromeCookieSet" });
  if (action === "relayBrowserDeleteCookie") return await handleChrome({ ...payload, action: "chromeCookieDelete" });
  if (action === "relayBrowserStorage") return await handleChrome({ ...payload, action: "chromeStorage" });
  if (action === "relayBrowserStorageSet") return await handleChrome({ ...payload, action: "chromeStorageSet" });
  if (action === "relayBrowserStorageDelete") return await handleChrome({ ...payload, action: "chromeStorageDelete" });
  if (action === "relayBrowserSessionExport") return await handleChrome({ ...payload, action: "chromeSessionExport", includeValues: payload.includeValues === true });
  if (action === "relayBrowserSessionImport") return await handleChrome({ ...payload, action: "chromeSessionImport" });
  if (action === "relayBrowserCdp") return await rawCdp(payload);
  if (action === "relayJarList") return await listJars();
  if (action === "relayJarCookies") return await listCookies(payload);
  if (action === "relayJarSetCookie") return await setCookie(payload);
  if (action === "relayJarDeleteCookie") return await deleteCookie(payload);
  if (action === "relayJarClear") return await clearJar(payload);
  if (action === "relaySyncChromeToJar") return await syncChromeToJar(payload);
  if (action === "relaySyncJarToChrome") return await syncJarToChrome(payload);
  if (action === "relayChatgptCookieHeader") return await chatgptCookieHeader(payload);
  return { ok: false, action, error: "unknown_browser_relay_action" };
}

async function browserPageFetch(payload = {}) {
  const target = String(payload.url || payload.href || "");
  if (!target) return { ok: false, action: "relayBrowserFetch", error: "missing_url" };
  const config = loadConfig();
  await ensurePage(Number(payload.port || config.chrome?.port || 9222));
  const options = payload.options || {};
  const browserOptions = {
    method: payload.method || options.method || "GET",
    headers: { ...(options.headers || {}), ...(payload.headers || {}) },
    body: payload.body ?? options.body,
    credentials: payload.credentials || options.credentials || "include",
    cache: payload.cache || options.cache || "no-store"
  };
  const expression = `(${browserFetchSource})(${JSON.stringify(target)}, ${JSON.stringify(browserOptions)})`;
  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, Number(payload.timeoutMs || 60000));
  const value = result.result?.value || { ok: false, status: 0, error: result.exceptionDetails?.text || "browser_fetch_failed" };
  const metadata = rememberStaticResponse({ status: value.status, ok: value.ok, headers: value.headers || [], url: value.url || target, redirected: value.redirected }, value.body || "");
  return { ...metadata, browserFetch: true, browserOk: value.ok, browserError: value.error || null };
}

async function rawCdp(payload = {}) {
  const config = loadConfig();
  const port = Number(payload.port || config.chrome?.port || 9222);
  if (!payload.method) return { ok: false, action: "relayBrowserCdp", error: "missing_cdp_method" };
  await ensurePage(port);
  const result = await cdpCall(String(payload.method), payload.params || {}, Number(payload.timeoutMs || 30000));
  return { ok: true, action: "relayBrowserCdp", method: payload.method, result };
}

async function chatgptCookieHeader(payload = {}) {
  const source = payload.source || "chrome";
  const url = payload.url || "https://chatgpt.com";
  if (source === "jar") return await jarCookieHeader(payload.cookieJarName || payload.jar || "chatgpt", url, payload.includeValues === true);
  const chrome = await handleChrome({ ...payload, action: "chromeCookies", url, includeValues: true });
  if (chrome.ok === false) return chrome;
  const cookies = chatgptCookies(chrome.cookies || []);
  const header = cookieHeaderFromCookies(cookies);
  return { ok: true, action: "relayChatgptCookieHeader", source: "chrome", url, count: cookies.length, cookieBytes: header.length, cookieHeader: payload.includeValues === true ? header : "" };
}

async function syncChromeToJar(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "chatgpt";
  const url = payload.url || "https://chatgpt.com";
  const chrome = await handleChrome({ ...payload, action: "chromeCookies", url, includeValues: true });
  if (chrome.ok === false) return chrome;
  const jar = await loadJar(name);
  const incoming = chatgptCookies(chrome.cookies || []).map(cookie => ({ name: cookie.name, value: cookie.value, domain: String(cookie.domain || new URL(url).hostname).replace(/^\./, ""), path: cookie.path || "/", secure: !!cookie.secure, httpOnly: !!cookie.httpOnly, sameSite: cookie.sameSite || "", expires: cookie.expires ? Math.floor(Number(cookie.expires) * 1000) : null, createdAt: Date.now() }));
  for (const cookie of incoming) { jar.cookies = jar.cookies.filter(existing => !(existing.name === cookie.name && existing.domain === cookie.domain && existing.path === cookie.path)); jar.cookies.push(cookie); }
  await saveJar(name, jar);
  return { ok: true, action: "relaySyncChromeToJar", jarName: jarName(name), copied: incoming.length, cookieBytes: cookieHeaderFromCookies(incoming).length };
}

async function syncJarToChrome(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "chatgpt";
  const url = payload.url || "https://chatgpt.com";
  const jar = await loadJar(name);
  let copied = 0;
  for (const cookie of jar.cookies.filter(cookie => domainAllowed(cookie.domain))) {
    const result = await handleChrome({ ...cookie, action: "chromeCookieSet", url, includeValues: false });
    if (result.ok) copied++;
  }
  return { ok: true, action: "relaySyncJarToChrome", jarName: jarName(name), copied, available: jar.cookies.length };
}

async function jarCookieHeader(name, url, includeValues = false) {
  const jar = await loadJar(name);
  const target = new URL(url);
  const cookies = jar.cookies.filter(cookie => cookieMatches(cookie, target));
  const header = cookieHeaderFromCookies(cookies);
  return { ok: true, action: "relayChatgptCookieHeader", source: "jar", url, jarName: jarName(name), count: cookies.length, cookieBytes: header.length, cookieHeader: includeValues ? header : "" };
}

function browserFetchSource(url, options) {
  return fetch(url, options).then(async response => ({ ok: response.ok, status: response.status, statusText: response.statusText, url: response.url, redirected: response.redirected, headers: Array.from(response.headers.entries()), body: await response.text() })).catch(error => ({ ok: false, status: 0, url, headers: [], body: "", error: error.message || String(error) }));
}
function chatgptCookies(cookies = []) { return cookies.filter(cookie => domainAllowed(cookie.domain)); }
function domainAllowed(domain = "") { const value = String(domain || "").replace(/^\./, "").toLowerCase(); return CHATGPT_DOMAINS.some(allowed => value === allowed || value.endsWith("." + allowed)); }
function cookieMatches(cookie, url) { if (!domainAllowed(cookie.domain)) return false; if (cookie.expires && cookie.expires < Date.now()) return false; if (cookie.secure && url.protocol !== "https:") return false; const host = url.hostname.toLowerCase(); const domain = String(cookie.domain || "").toLowerCase().replace(/^\./, ""); if (host !== domain && !host.endsWith("." + domain)) return false; return (url.pathname || "/").startsWith(cookie.path || "/"); }
function cookieHeaderFromCookies(cookies = []) { return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; "); }

module.exports = { handleBrowserRelay, browserPageFetch, chatgptCookieHeader, syncChromeToJar, syncJarToChrome };
