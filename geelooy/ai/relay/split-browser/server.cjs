//B"H
const http = require("http");
const { json, html, send, readBody } = require("./http.cjs");
const { renderControlPage } = require("./controlPage.cjs");
const { proxyChatGpt } = require("./proxy.cjs");
const { handleRelayApi } = require("./relayApi.cjs");
const { cookieSummary } = require("./cookieJar.cjs");
const { log } = require("./logger.cjs");
const { normalizeRouteUrl } = require("./routeNormalize.cjs");
const { recordClientState, clientStateSummary } = require("./clientState.cjs");
const { handleDebugApi } = require("./debugApi.cjs");

/**
 * Chapter 6: The Server Became A Quiet Throne.
 *
 * One small server receives the user's local tab, exposes health/control URLs,
 * and routes ChatGPT rendering through Node. It also accepts safe browser-state
 * breadcrumbs from the shim so storage/navigation changes can be inspected.
 *
 * @param {{port:number,host:string,targetOrigin:string,verbose:boolean,allowedOrigins:string[]}} config Runtime config.
 * @returns {import('http').Server} Listening HTTP server.
 */
function startServer(config) {
  const server = http.createServer((req, res) => route(req, res, config));
  server.listen(config.port, config.host, () => {
    console.log(`B"H Awtsmoos Split Browser at http://${config.host}:${config.port}/control`);
    console.log(`B"H Node-rendered ChatGPT test at http://${config.host}:${config.port}/chatgpt`);
  });
  return server;
}

async function route(req, res, config) {
  try {
    if (req.method === "OPTIONS") return send(res, 204, "");
    const normalizedUrl = normalizeRouteUrl(req.url);
    const path = new URL(normalizedUrl, `http://${config.host}:${config.port}`).pathname;
    log(config, "route:incoming", { method: req.method, path, url: req.url, normalizedUrl });
    req.url = normalizedUrl;
    if (path === "/control") return html(res, renderControlPage(config));
    if (path === "/health") return json(res, health(config));
    if (path === "/control-url") return json(res, { ok: true, url: `http://${config.host}:${config.port}/control` });
    if (path === "/client-state") return await handleClientState(req, res);
    if (path.startsWith("/debug/")) return await handleDebugApi(req, res, config);
    if (path === "/fetch" || path === "/body") return await handleRelayApi(req, res, config);
    if (path === "/chatgpt") return await proxyChatGpt(req, res, config);
    if (path.startsWith("/chatgpt/") || path === "/proxy") return await proxyChatGpt(req, res, config);
    log(config, "route:fallback-proxy", { path });
    return await proxyChatGpt(req, res, config);
  } catch (error) {
    json(res, { ok: false, error: error.stack || error.message || String(error) }, 500);
  }
}

async function handleClientState(req, res) {
  if (req.method === "GET") return json(res, clientStateSummary());
  const payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  return json(res, { ok: true, event: recordClientState(payload) });
}

function health(config) {
  return {
    ok: true,
    mode: "split-browser",
    controlUrl: `http://${config.host}:${config.port}/control`,
    chatgptUrl: `http://${config.host}:${config.port}/chatgpt`,
    targetOrigin: config.targetOrigin,
    allowedOrigins: config.allowedOrigins,
    clientState: clientStateSummary(),
    cookies: cookieSummary()
  };
}

module.exports = { startServer };
