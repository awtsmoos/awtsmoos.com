// B"H
const http = require("http");
const { URL } = require("url");
const { loadConfig, HOME } = require("./config.js");
const { buildToolCatalog } = require("./tool-schema-catalog.js");
const { handleFs } = require("../tools/fs/index.js");
const { handleCommand, ACTIONS: COMMAND_ACTIONS } = require("../tools/command/index.js");
const { handleChrome, ACTIONS: CHROME_ACTIONS } = require("../tools/chrome/index.js");
const { buildActions, AGENT_VERSION } = require("../tools/fs/actions.js");

const BODY_LIMIT = 8 * 1024 * 1024;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3977;

/**
 * B"H
 * Chapter 2: One Local Gate Served Names, Schemas, Manifest, And YAML.
 *
 * `/actions`, `/tools`, `/schemas`, and `/manifest` now drink from the same
 * `buildToolCatalog` vessel. The execution maps remain the source of action
 * names, while the catalog generator turns those names into JSON schemas and a
 * YAML view so no format drifts from the others.
 */
function createLocalApiServer(deps = {}) {
  const bag = makeDeps(deps);
  return http.createServer((req, res) => route(req, res, bag));
}

function startLocalApiServer(options = {}) {
  const log = options.log || (() => {});
  const config = (options.configLoader || loadConfig)();
  const settings = localSettings(config);
  if (!settings.enabled) return null;
  const server = createLocalApiServer(options);
  let port = settings.port;
  let attempts = 0;
  server.on("error", err => {
    if (err.code === "EADDRINUSE" && attempts < 20) { attempts++; port++; return server.listen(port, settings.host); }
    log("Local tunnel API error:", err.message);
  });
  server.listen(port, settings.host, () => { server.awtsmoosLocalUrl = `http://${settings.host}:${port}`; log("Local tunnel API:", server.awtsmoosLocalUrl); });
  return server;
}

function makeDeps(deps) {
  return { configLoader: deps.configLoader || loadConfig, fsHandler: deps.fsHandler || ((payload, ws) => handleFs(payload, ws)), commandHandler: deps.commandHandler || (payload => handleCommand(payload)), chromeHandler: deps.chromeHandler || (payload => handleChrome(payload)) };
}

function localSettings(config = {}) {
  const localApi = config.localApi || {};
  const enabledByEnv = process.env.AWTSMOOS_LOCAL_API !== "0";
  return { enabled: enabledByEnv && localApi.enabled !== false, host: process.env.AWTSMOOS_LOCAL_API_HOST || localApi.host || DEFAULT_HOST, port: bounded(process.env.AWTSMOOS_LOCAL_API_PORT || localApi.port, DEFAULT_PORT) };
}
function bounded(value, fallback) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(1, Math.min(65535, Math.floor(n))) : fallback; }

async function route(req, res, deps) {
  setCors(res);
  if (req.method === "OPTIONS") return endJson(res, 204, {});
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/health") return health(res, deps);
    if (req.method === "GET" && url.pathname === "/actions") return actions(res, deps);
    if (req.method === "GET" && url.pathname === "/tools") return tools(res, deps);
    if (req.method === "GET" && url.pathname === "/schemas") return schemas(res, deps);
    if (req.method === "GET" && url.pathname === "/manifest") return manifest(res, deps);
    if (req.method !== "POST") return endJson(res, 404, { ok: false, error: "unknown_local_api_route" });
    const body = await readJsonBody(req);
    const routes = { "/fs": () => callFs(res, deps, body), "/command": () => callCommand(res, deps, body), "/chrome": () => callChrome(res, deps, body), "/tool": () => callTool(res, deps, body), "/context": () => callFs(res, deps, { action: body.action || "aiContextPack", ...body }) };
    return (routes[url.pathname] || routes["/tool"])();
  } catch (e) {
    return endJson(res, 500, { ok: false, error: e.message });
  }
}

function health(res, deps) {
  const config = deps.configLoader();
  const catalog = makeCatalog(config);
  return endJson(res, 200, { ok: true, local: true, agentVersion: AGENT_VERSION, tunnelName: config.tunnelName, root: config.root || HOME, actions: catalog.actions, toolCatalog: { count: catalog.tools.length, names: catalog.names } });
}
function actions(res, deps) { return endJson(res, 200, catalogPayload(deps)); }
function tools(res, deps) { const catalog = makeCatalog(deps.configLoader()); return endJson(res, 200, { ok: true, tools: catalog.tools, actions: catalog.actions, names: catalog.names }); }
function schemas(res, deps) { const catalog = makeCatalog(deps.configLoader()); return endJson(res, 200, { ok: true, schemas: catalog.schemas, tools: catalog.tools, actions: catalog.actions }); }
function manifest(res, deps) { return endJson(res, 200, catalogPayload(deps)); }
function catalogPayload(deps) { return makeCatalog(deps.configLoader()); }

function makeCatalog(config) {
  const fsNames = Object.keys(buildActions(config, { action: "list" }, null));
  return buildToolCatalog({ config, fsActionNames: fsNames, commandActionNames: Object.keys(COMMAND_ACTIONS || {}), chromeActionNames: Object.keys(CHROME_ACTIONS || {}), agentVersion: AGENT_VERSION });
}

function normalizeTool(body = {}, deps) {
  const action = body.name || body.action || body.tool || body.function?.name || "";
  const args = body.arguments || body.args || body.payload || {};
  const payload = { ...args, action };
  const config = deps.configLoader();
  if (body.kind) payload.kind = body.kind;
  else if (buildActions(config, { action }, null)[action]) payload.kind = "fs";
  else if (COMMAND_ACTIONS?.[action]) payload.kind = "command";
  else if (CHROME_ACTIONS?.[action]) payload.kind = "chrome";
  else payload.kind = "fs";
  return payload;
}

async function callTool(res, deps, body) { const payload = normalizeTool(body, deps); const calls = { fs: callFs, command: callCommand, chrome: callChrome }; return (calls[payload.kind] || callFs)(res, deps, payload); }
async function callFs(res, deps, body) { return endJson(res, 200, await deps.fsHandler({ kind: "fs", ...body }, null)); }
async function callCommand(res, deps, body) { return endJson(res, 200, await deps.commandHandler({ kind: "command", ...body })); }
async function callChrome(res, deps, body) { return endJson(res, 200, await deps.chromeHandler({ kind: "chrome", ...body })); }

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", chunk => { total += chunk.length; if (total > BODY_LIMIT) { reject(new Error("local_api_body_too_large")); req.destroy(); return; } chunks.push(chunk); });
    req.on("error", reject);
    req.on("end", () => { const text = Buffer.concat(chunks).toString("utf8").trim(); resolve(text ? JSON.parse(text) : {}); });
  });
}

function setCors(res) { res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); res.setHeader("Access-Control-Allow-Headers", "content-type,x-awtsmoos-local-token"); }
function endJson(res, status, data) { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(status === 204 ? "" : JSON.stringify(data)); }

module.exports = { createLocalApiServer, startLocalApiServer, localSettings, makeCatalog };
