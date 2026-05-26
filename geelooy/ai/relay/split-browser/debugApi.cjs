//B"H
const { json, readBody } = require("./http.cjs");
const { toLocal } = require("./urlMap.cjs");
const { recordClientState, clientStateSummary } = require("./clientState.cjs");

const sessions = new Map();

/**
 * B"H — A tiny Puppeteer-style API for the split-browser relay.
 *
 * This is not Chrome DevTools. It is a server-side command ledger that mirrors
 * the browser control vocabulary: new page, goto, evaluate, click, type,
 * screenshot placeholder, and state inspection. Browser-executed code can poll
 * `/debug/commands` and report results to `/debug/result` later.
 */
async function handleDebugApi(req, res, config) {
  const url = new URL(req.url, `http://${config.host}:${config.port}`);
  if (url.pathname === "/debug/session") return json(res, createSession(config));
  if (url.pathname === "/debug/sessions") return json(res, { ok: true, sessions: [...sessions.values()] });
  if (url.pathname === "/debug/state") return json(res, clientStateSummary());
  if (url.pathname === "/debug/commands") return json(res, pendingCommands(url.searchParams.get("session")));
  if (url.pathname === "/debug/result") return await acceptResult(req, res);
  if (url.pathname === "/debug/goto") return await enqueue(req, res, config, "goto");
  if (url.pathname === "/debug/evaluate") return await enqueue(req, res, config, "evaluate");
  if (url.pathname === "/debug/click") return await enqueue(req, res, config, "click");
  if (url.pathname === "/debug/type") return await enqueue(req, res, config, "type");
  if (url.pathname === "/debug/screenshot") return await enqueue(req, res, config, "screenshot");
  return json(res, { ok: false, error: "debug_api_not_found" }, 404);
}

function createSession(config) {
  const id = `dbg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const session = { id, createdAt: Date.now(), targetOrigin: config.targetOrigin, commands: [], results: [] };
  sessions.set(id, session);
  return { ok: true, session, api: puppeteerApi(config, id) };
}

async function enqueue(req, res, config, action) {
  const body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const session = getSession(body.session, config);
  const command = { id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`, action, payload: normalizePayload(action, body, config), createdAt: Date.now(), status: "pending" };
  session.commands.push(command);
  recordClientState({ type: `debug.${action}`, session: session.id, command: command.id, url: command.payload.url || "", selector: command.payload.selector || "" });
  json(res, { ok: true, session: session.id, command });
}

async function acceptResult(req, res) {
  const body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const session = sessions.get(body.session);
  if (!session) return json(res, { ok: false, error: "session_not_found" }, 404);
  const command = session.commands.find(cmd => cmd.id === body.command);
  if (command) command.status = body.ok === false ? "error" : "done";
  session.results.push({ ...body, at: Date.now() });
  json(res, { ok: true });
}

function pendingCommands(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return { ok: false, error: "session_not_found" };
  return { ok: true, session: sessionId, commands: session.commands.filter(cmd => cmd.status === "pending") };
}

function getSession(id, config) {
  if (id && sessions.has(id)) return sessions.get(id);
  return createSession(config).session;
}

function normalizePayload(action, body, config) {
  if (action === "goto") return { url: toLocal(body.url || config.targetOrigin, config), waitUntil: body.waitUntil || "load" };
  if (action === "evaluate") return { expression: String(body.expression || body.code || "undefined") };
  if (action === "click") return { selector: String(body.selector || "") };
  if (action === "type") return { selector: String(body.selector || ""), text: String(body.text || "") };
  return { fullPage: body.fullPage !== false };
}

function puppeteerApi(config, session) {
  const base = `http://${config.host}:${config.port}`;
  return {
    session,
    goto: `${base}/debug/goto`,
    evaluate: `${base}/debug/evaluate`,
    click: `${base}/debug/click`,
    type: `${base}/debug/type`,
    screenshot: `${base}/debug/screenshot`,
    commands: `${base}/debug/commands?session=${encodeURIComponent(session)}`,
    result: `${base}/debug/result`
  };
}

module.exports = { handleDebugApi };
