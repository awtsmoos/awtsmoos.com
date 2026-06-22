// B"H
const http = require("http");
const { URL } = require("url");
const { loadConfig, HOME } = require("./config.js");
const { handleLocalBrowserRelay } = require("./local-browser-relay.js");
const { buildToolCatalog } = require("./tool-schema-catalog.js");
const { handleFs } = require("../tools/fs/index.js");
const { handleCommand, ACTIONS: COMMAND_ACTIONS } = require("../tools/command/index.js");
const { handleChrome, ACTIONS: CHROME_ACTIONS } = require("../tools/chrome/index.js");
const { handleRelay, jsonRelay, ACTIONS: RELAY_ACTIONS } = require("../tools/relay/index.js");
const { handleStreaming, ACTIONS: STREAMING_ACTIONS } = require("../tools/streaming/index.js");
const { buildActions, AGENT_VERSION } = require("../tools/fs/actions.js");
const BODY_LIMIT = 16 * 1024 * 1024;
const BINARY_LIMIT = 64 * 1024 * 1024;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3977;
const LISTEN_BACKLOG = 4096;
const CATALOG_CACHE_MS = 1000;
let catalogCache = null;
function createLocalApiServer(deps = {}) { return http.createServer((req, res) => route(req, res, makeDeps(deps))); }
function startLocalApiServer(options = {}) {
  const log = options.log || (() => {}); const config = (options.configLoader || loadConfig)(); const settings = localSettings(config); if (!settings.enabled) return null;
  const server = createLocalApiServer(options); let port = settings.port, attempts = 0;
  server.keepAliveTimeout = 65000; server.headersTimeout = 70000; server.requestTimeout = 0; server.maxRequestsPerSocket = 0;
  server.on("clientError", err => log("Local tunnel API client error:", err.code || err.message));
  server.on("error", err => { if (err.code === "EADDRINUSE" && attempts < 20) { attempts++; port++; return server.listen(port, settings.host, LISTEN_BACKLOG); } log("Local tunnel API error:", err.message); });
  server.listen(port, settings.host, LISTEN_BACKLOG, () => { server.awtsmoosLocalUrl = `http://${settings.host}:${port}`; log("Local tunnel API:", server.awtsmoosLocalUrl); log("Local ChatGPT browser relay:", `${server.awtsmoosLocalUrl}/relay/control`); }); return server;
}
function makeDeps(deps) { return { configLoader:deps.configLoader || loadConfig, fsHandler:deps.fsHandler || ((p,w)=>handleFs(p,w)), commandHandler:deps.commandHandler || (p=>handleCommand(p)), chromeHandler:deps.chromeHandler || (p=>handleChrome(p)), relayHandler:deps.relayHandler || ((p,c)=>handleRelay(p,c)), streamingHandler:deps.streamingHandler || (p=>handleStreaming(p)), jsonRelayHandler:deps.jsonRelayHandler || (p=>jsonRelay(p)) }; }
function localSettings(config = {}) { const localApi = config.localApi || {}; return { enabled:process.env.AWTSMOOS_LOCAL_API !== "0" && localApi.enabled !== false, host:process.env.AWTSMOOS_LOCAL_API_HOST || localApi.host || DEFAULT_HOST, port:bounded(process.env.AWTSMOOS_LOCAL_API_PORT || localApi.port, DEFAULT_PORT) }; }
async function route(req, res, deps) {
  setCors(res); if (req.method === "OPTIONS") return endJson(res, 204, {});
  try { const url = new URL(req.url || "/", "http://127.0.0.1"); if (await handleLocalBrowserRelay(req, res, deps, url)) return; if (req.method === "GET") return routeGet(res, deps, url); if (req.method !== "POST") return endJson(res, 404, { ok:false, error:"unknown_local_api_route" }); return routePost(req, res, deps, url); }
  catch (e) { return endJson(res, 500, { ok:false, error:e.message }); }
}
async function routeGet(res, deps, url) { const routes = { "/health":health, "/healthz":healthz, "/actions":actions, "/tools":tools, "/schemas":schemas, "/manifest":manifest, "/relay/health":relayHealth, "/relay/open-login":relayOpenLogin, "/relay/cookies":relayCookies, "/streaming":streamingStatus, "/streaming/status":streamingStatus }; return routes[url.pathname] ? routes[url.pathname](res, deps, url) : endJson(res, 404, { ok:false, error:"unknown_local_api_route" }); }
async function routePost(req, res, deps, url) {
  const binary = binaryHlsMatch(url.pathname); if (binary) return callStreamingBinary(req, res, deps, binary);
  const body = await readBody(req, BODY_LIMIT, true); const routes = { "/fs":callFs, "/command":callCommand, "/chrome":callChrome, "/tool":callTool, "/context":callContext, "/relay":callRelay, "/relay/fetch":callRelayFetch, "/relay/body":callRelayBody, "/relay/json":callJsonRelay, "/json-relay":callJsonRelay, "/jason/relay":callJasonRelay, "/streaming":callStreaming, "/streaming/start":callStreamingStart, "/streaming/chunk":callStreamingChunk, "/streaming/stop":callStreamingStop, "/streaming/status":callStreamingStatus };
  return (routes[url.pathname] || routes["/tool"])(res, deps, body);
}
function binaryHlsMatch(path) { const m = /^\/streaming\/hls-segment\/([^/]+)\/([^/]+)$/.exec(path); return m && { sessionId:decodeURIComponent(m[1]), name:decodeURIComponent(m[2]) }; }
async function callStreamingBinary(req, res, deps, match) {
  const chunk = await readBody(req, BINARY_LIMIT, false); const payload = { kind:"streaming", action:"streamingHlsSegmentPush", sessionId:match.sessionId, name:match.name, duration:Number(req.headers["x-awtsmoos-duration"] || 2), index:Number(req.headers["x-awtsmoos-index"] || 0), contentType:req.headers["content-type"] || "video/mp2t", chunk64:chunk.toString("base64") };
  return endJson(res, 200, await deps.streamingHandler(payload));
}
function health(res, deps, url) {
  const config = deps.configLoader();
  if (url?.searchParams?.get("summary") === "1" || url?.searchParams?.get("summary") === "true") return endJson(res, 200, healthSummary(config));
  const catalog = cachedCatalog(config);
  return endJson(res, 200, { ...healthSummary(config), browserRelay:{ controlUrl:"http://127.0.0.1:3977/relay/control", chatgptUrl:"http://127.0.0.1:3977/chatgpt" }, actions:catalog.actions, toolCatalog:{ count:catalog.tools.length, names:catalog.names }, streaming:{ actions:Object.keys(STREAMING_ACTIONS), binaryHls:"/streaming/hls-segment/:sessionId/:name" } });
}
function healthz(res, deps) { return endJson(res, 200, healthSummary(deps.configLoader())); }
function healthSummary(config = {}) { return { ok:true, local:true, agentVersion:AGENT_VERSION, tunnelName:config.tunnelName, root:config.root || HOME }; }
function actions(res, deps) { return endJson(res, 200, cachedCatalog(deps.configLoader())); }
function tools(res, deps) { const c = cachedCatalog(deps.configLoader()); return endJson(res, 200, { ok:true, tools:c.tools, actions:c.actions, names:c.names }); }
function schemas(res, deps) { const c = cachedCatalog(deps.configLoader()); return endJson(res, 200, { ok:true, schemas:c.schemas, tools:c.tools, actions:c.actions }); }
function manifest(res, deps) { return endJson(res, 200, cachedCatalog(deps.configLoader())); }
function makeCatalog(config) { const fsNames = Object.keys(buildActions(config, { action:"list" }, null)); const catalog = buildToolCatalog({ config, fsActionNames:fsNames, commandActionNames:Object.keys(COMMAND_ACTIONS || {}), chromeActionNames:Object.keys(CHROME_ACTIONS || {}), relayActionNames:Object.keys(RELAY_ACTIONS || {}), agentVersion:AGENT_VERSION }); catalog.actions.streaming = Object.keys(STREAMING_ACTIONS || {}); catalog.names = [...new Set([...catalog.names, ...catalog.actions.streaming])]; return catalog; }
function cachedCatalog(config = {}) {
  const key = [AGENT_VERSION, config.tunnelName || "", config.root || HOME].join("|");
  const now = Date.now();
  if (catalogCache && catalogCache.key === key && now - catalogCache.createdAt <= CATALOG_CACHE_MS) return catalogCache.value;
  catalogCache = { key, createdAt:now, value:makeCatalog(config) };
  return catalogCache.value;
}
function normalizeTool(body = {}, deps) { const action = body.name || body.action || body.tool || body.function?.name || ""; const args = body.arguments || body.args || body.payload || {}; const payload = { ...args, action }; const config = deps.configLoader(); if (body.kind) payload.kind = body.kind; else if (STREAMING_ACTIONS?.[action]) payload.kind = "streaming"; else if (RELAY_ACTIONS?.[action]) payload.kind = "relay"; else if (COMMAND_ACTIONS?.[action]) payload.kind = "command"; else if (CHROME_ACTIONS?.[action]) payload.kind = "chrome"; else if (buildActions(config, { action }, null)[action]) payload.kind = "fs"; else payload.kind = "fs"; return payload; }
async function callTool(res, deps, body) { const payload = normalizeTool(body, deps); const calls = { fs:callFs, command:callCommand, chrome:callChrome, relay:callRelay, streaming:callStreaming }; return (calls[payload.kind] || callFs)(res, deps, payload); }
async function callContext(res, deps, body) { return callFs(res, deps, { action:body.action || "aiContextPack", ...body }); }
async function callFs(res, deps, body) { return endJson(res, 200, await deps.fsHandler({ kind:"fs", ...body }, null)); }
async function callCommand(res, deps, body) { return endJson(res, 200, await deps.commandHandler({ kind:"command", ...body })); }
async function callChrome(res, deps, body) { return endJson(res, 200, await deps.chromeHandler({ kind:"chrome", ...body })); }
async function callRelay(res, deps, body) { return endJson(res, 200, await deps.relayHandler({ kind:"relay", ...body }, deps.configLoader())); }
async function callStreaming(res, deps, body) { return endJson(res, 200, await deps.streamingHandler({ kind:"streaming", ...body })); }
async function callStreamingStart(res, deps, body) { return callStreaming(res, deps, { ...body, action:"streamingSessionStart" }); }
async function callStreamingChunk(res, deps, body) { return callStreaming(res, deps, { ...body, action:"streamingChunkPush" }); }
async function callStreamingStop(res, deps, body) { return callStreaming(res, deps, { ...body, action:"streamingSessionStop" }); }
async function callStreamingStatus(res, deps, body) { return callStreaming(res, deps, { ...body, action:"streamingSessionStatus" }); }
async function streamingStatus(res, deps) { return callStreaming(res, deps, { action:"streamingSessionStatus" }); }
async function callRelayFetch(res, deps, body) { return callRelay(res, deps, { ...body, action:"relayFetch" }); }
async function callRelayBody(res, deps, body) { return callRelay(res, deps, { ...body, action:"relayBody" }); }
async function callJsonRelay(res, deps, body) { return endJson(res, 200, await deps.jsonRelayHandler({ ...body, action:"jsonRelay" })); }
async function callJasonRelay(res, deps, body) { return endJson(res, 200, await deps.jsonRelayHandler({ ...body, action:"jasonRelay" })); }
async function relayHealth(res, deps) { return endJson(res, 200, await deps.relayHandler({ action:"relayHealth" }, deps.configLoader())); }
async function relayOpenLogin(res, deps) { return endJson(res, 200, await deps.relayHandler({ action:"relayOpenLogin" }, deps.configLoader())); }
async function relayCookies(res, deps) { return endJson(res, 200, await deps.relayHandler({ action:"relayCookies" }, deps.configLoader())); }
function readBody(req, limit, parseJson) { return new Promise((resolve, reject) => { const chunks = []; let total = 0; req.on("data", chunk => { total += chunk.length; if (total > limit) { reject(new Error("local_api_body_too_large")); req.destroy(); return; } chunks.push(chunk); }); req.on("error", reject); req.on("end", () => { const buf = Buffer.concat(chunks); if (!parseJson) return resolve(buf); const text = buf.toString("utf8").trim(); resolve(text ? JSON.parse(text) : {}); }); }); }
function bounded(value, fallback) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(1, Math.min(65535, Math.floor(n))) : fallback; }
function setCors(res) { res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); res.setHeader("Access-Control-Allow-Headers", "content-type,x-awtsmoos-local-token,x-awtsmoos-duration,x-awtsmoos-index"); }
function endJson(res, status, data) { res.writeHead(status, { "content-type":"application/json; charset=utf-8" }); res.end(status === 204 ? "" : JSON.stringify(data)); }
module.exports = { createLocalApiServer, startLocalApiServer, localSettings, makeCatalog };
