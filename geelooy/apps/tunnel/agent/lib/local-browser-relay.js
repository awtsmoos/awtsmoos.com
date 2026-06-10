// B"H
const { renderControlPage } = require("../ai/relay/split-browser/controlPage.cjs");
const { proxyChatGpt } = require("../ai/relay/split-browser/proxy.cjs");
const { cookieSummary } = require("../ai/relay/split-browser/cookieJar.cjs");
const { sessionStatus } = require("../ai/relay/split-browser/authState.cjs");
const { clientStateSummary } = require("../ai/relay/split-browser/clientState.cjs");

const TARGET_ORIGIN = "https://chatgpt.com";
const ALLOWED_ORIGINS = [
  "https://chatgpt.com",
  "https://auth.openai.com",
  "https://accounts.google.com",
  "https://ogs.google.com",
  "https://ssl.gstatic.com",
  "https://www.gstatic.com"
];

/**
 * Chapter 26: Every Handled Door Returned With Its Seal.
 *
 * A route that writes a response must say: I handled this. Otherwise the next
 * gate writes again and the vessel cracks. The Awtsmoos teaches the tunnel to
 * answer once: control page, control URL, health, or the local ChatGPT proxy.
 *
 * @param {import("http").IncomingMessage} req Local request.
 * @param {import("http").ServerResponse} res Local response.
 * @param {object} deps Local API dependency bag.
 * @param {URL} url Parsed local URL.
 * @returns {Promise<boolean>} True when this module handled the route.
 */
async function handleLocalBrowserRelay(req, res, deps, url) {
  const path = url.pathname;
  if (path === "/control" || path === "/relay/control") {
    html(res, renderControlPage(browserConfig(req, deps)));
    return true;
  }
  if (path === "/control-url" || path === "/relay/control-url") {
    json(res, { ok: true, url: `${baseUrl(req)}/relay/control`, chatgptUrl: `${baseUrl(req)}/chatgpt` });
    return true;
  }
  if (path === "/relay/browser-health") {
    json(res, await browserHealth(req, deps));
    return true;
  }
  if (path === "/chatgpt" || path.startsWith("/chatgpt/") || path === "/proxy") {
    await proxyChatGpt(req, res, browserConfig(req, deps));
    return true;
  }
  return false;
}

async function browserHealth(req, deps) {
  const config = browserConfig(req, deps);
  return {
    ok: true,
    mode: "tunnel-local-browser-relay",
    controlUrl: `${baseUrl(req)}/relay/control`,
    chatgptUrl: `${baseUrl(req)}/chatgpt`,
    targetOrigin: config.targetOrigin,
    allowedOrigins: config.allowedOrigins,
    clientState: clientStateSummary(),
    cookies: cookieSummary(),
    session: await sessionStatus(config)
  };
}

function browserConfig(req, deps) {
  const config = deps.configLoader();
  return {
    ...config,
    host: host(req),
    port: port(req),
    targetOrigin: TARGET_ORIGIN,
    allowedOrigins: ALLOWED_ORIGINS,
    verbose: !!config.relayTools?.verbose
  };
}

function baseUrl(req) {
  return `http://${host(req)}:${port(req)}`;
}

function host(req) {
  return String(req.headers.host || "127.0.0.1:3977").split(":")[0] || "127.0.0.1";
}

function port(req) {
  const raw = String(req.headers.host || "127.0.0.1:3977").split(":")[1];
  return Number(raw || 3977);
}

function html(res, body) {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(body);
}

function json(res, data, status = 200) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

module.exports = { handleLocalBrowserRelay, browserHealth };
