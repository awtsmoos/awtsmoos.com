//B"H
const http = require("http");
const { json, html, send } = require("./http.cjs");
const { renderControlPage } = require("./controlPage.cjs");
const { proxyChatGpt } = require("./proxy.cjs");
const { handleRelayApi } = require("./relayApi.cjs");
const { cookieSummary } = require("./cookieJar.cjs");
const { log } = require("./logger.cjs");
const { normalizeRouteUrl } = require("./routeNormalize.cjs");

/**
 * Chapter 6: The Server Became A Quiet Throne.
 *
 * One small server receives the user's local tab, exposes health/control URLs,
 * and routes ChatGPT rendering through Node. No installer, no old relay change:
 * just `node index.js` inside this directory for the first experiment.
 *
 * @param {{port:number,host:string,targetOrigin:string,verbose:boolean}} config Runtime config.
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
    if (path === "/chatgpt") return redirect(res, "/");
    if (path === "/chatgpt") return redirect(res, "/");
    if (path === "/control") return html(res, renderControlPage(config));
    if (path === "/health") return json(res, health(config));
    if (path === "/control-url") return json(res, { ok: true, url: `http://${config.host}:${config.port}/control` });
    if (path === "/fetch" || path === "/body") return await handleRelayApi(req, res, config);
    if (path === "/chatgpt" || path.startsWith("/chatgpt/") || path === "/proxy") return await proxyChatGpt(req, res, config);
    log(config, "route:fallback-proxy", { path });
    return await proxyChatGpt(req, res, config);
  } catch (error) {
    json(res, { ok: false, error: error.stack || error.message || String(error) }, 500);
  }
}

function redirect(res, location) {
  send(res, 302, "", { location });
}

function health(config) {
  return { ok: true, mode: "split-browser", controlUrl: `http://${config.host}:${config.port}/control`, chatgptUrl: `http://${config.host}:${config.port}/`, targetOrigin: config.targetOrigin, cookies: cookieSummary() };
}

module.exports = { startServer };
