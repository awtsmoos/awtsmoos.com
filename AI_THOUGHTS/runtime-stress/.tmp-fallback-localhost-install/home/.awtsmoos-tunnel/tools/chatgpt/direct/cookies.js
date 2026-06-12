// B"H
const { version, ensurePage, cdpCall } = require("../../chrome/cdp.js");

const CHATGPT_COOKIE_URLS = ["https://chatgpt.com/", "https://chat.openai.com/"];
const DEFAULT_PORTS = [9223, 9222, 9224, 9225];
const FALLBACK_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

/**
 * B"H
 * Chapter 409: The Gate Searched Every Lit Chrome Window.
 *
 * The relay of geelooy/ai did not trust one brittle port. It listened for the
 * browser that already held the living cookies, copied the browser's user-agent
 * scent, and only then asked ChatGPT for a token. This module walks the same
 * path: port after port, cookie after cookie, until the hidden session spark is
 * found without touching the prompt composer.
 *
 * @param {object} payload ChatGPT action payload.
 * @returns {Promise<{ok:boolean,cookie:string,count:number,names:string[],port:number,userAgent:string,source:string}>} Cookie header summary.
 */
async function chatgptCookieHeader(payload = {}) {
  const ports = candidatePorts(payload);
  const failures = [];
  for (const port of ports) {
    const result = await cookieHeaderFromPort(port).catch(error => ({ ok: false, port, error: error.message }));
    if (result.ok && result.cookie) return result;
    failures.push(result);
  }
  return { ok: false, cookie: "", count: 0, names: [], port: ports[0] || 9223, userAgent: FALLBACK_USER_AGENT, source: "none", failures };
}

async function cookieHeaderFromPort(port) {
  await ensurePage(port);
  const info = await version(port).catch(() => ({}));
  const result = await readCookiesFromChrome();
  const cookies = Array.isArray(result.cookies) ? result.cookies : [];
  const usable = cookies.filter(isChatGptCookie);
  return {
    ok: true,
    port,
    cookie: usable.map(cookiePair).join("; "),
    count: usable.length,
    names: usable.map(cookie => cookie.name).slice(0, 24),
    userAgent: info["User-Agent"] || info.userAgent || FALLBACK_USER_AGENT,
    source: "chrome-devtools"
  };
}

async function readCookiesFromChrome() {
  try {
    return await cdpCall("Network.getCookies", { urls: CHATGPT_COOKIE_URLS }, 10000);
  } catch (networkError) {
    return await cdpCall("Storage.getCookies", {}, 10000);
  }
}

function candidatePorts(payload = {}) {
  const raw = [payload.port, payload.chromePort, payload.debugPort, process.env.AWTSMOOS_CHROME_DEBUG_PORT, ...DEFAULT_PORTS];
  return [...new Set(raw.map(Number).filter(Number.isFinite))];
}

function isChatGptCookie(cookie = {}) {
  const domain = String(cookie.domain || "chatgpt.com").replace(/^\./, "");
  return domain === "chatgpt.com" || domain.endsWith(".chatgpt.com") || domain === "openai.com" || domain.endsWith(".openai.com");
}

function cookiePair(cookie = {}) {
  return `${cookie.name}=${cookie.value}`;
}

module.exports = { chatgptCookieHeader, candidatePorts, CHATGPT_COOKIE_URLS, FALLBACK_USER_AGENT };
