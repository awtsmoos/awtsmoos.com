//B"H
const { json, readBody } = require("./http.cjs");
const { cookieHeader } = require("./cookieJar.cjs");
const { requireAccessToken, publicAuthError } = require("./authState.cjs");
const runs = new Map();
const listeners = new Set();

/**
 * Chapter 11: The Relay Learned To Keep Turning In The Night.
 *
 * The browser extension owns automation when it exists. The Node relay must be
 * able to wear the same crown: staged state, verified sends, scheduled next
 * turns, and progress that tests or UIs can poll while the run is still alive.
 */
async function handleAutomationApi(req, res, config, path) {
  if (path === "/automation-start") return start(req, res, config);
  if (path === "/automation-stop") return stop(req, res);
  if (path === "/automation-status") return status(req, res);
  if (path === "/automation-events") return events(req, res);
  json(res, { ok:false, error:"automation_api_not_found" }, 404);
}

async function start(req, res, config) {
  const payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const conversationId = payload.conversationId;
  if (!conversationId) return json(res, { ok:false, status:"bad_request", error:"conversationId_required", safeHint:"Pass conversationId before starting relay automation." }, 400);
  const settings = normalizeSettings(payload.settings || {});
  const run = {
    id:`BH_RELAY_AUTO_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    enabled:true,
    conversationId,
    settings,
    graph:payload.graph || null,
    prompt:settings.prompt,
    turns:0,
    pendingTurn:0,
    status:"armed",
    phase:"armed",
    nextRunAt:0,
    events:[],
    streamEvents:[],
    startedAt:Date.now(),
    updatedAt:Date.now(),
    busy:false,
    config
  };
  runs.set(conversationId, run);
  record(run, "state", { status:"armed", turns:0, maxTurns:settings.maxTurns });
  schedule(run, 10);
  json(res, publicRun(run));
}

async function stop(req, res) {
  const payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const run = runs.get(payload.conversationId) || [...runs.values()].find(item => item.enabled);
  if (!run) return json(res, { ok:true, status:"off", enabled:false });
  run.enabled = false;
  run.status = payload.reason || "stopped";
  run.phase = run.status;
  run.pendingTurn = 0;
  run.nextRunAt = 0;
  if (run.timer) clearTimeout(run.timer);
  record(run, "state", { status:run.status, turns:run.turns });
  json(res, publicRun(run));
}

async function status(req, res) {
  const url = new URL(req.url, "http://relay.local");
  const conversationId = url.searchParams.get("conversationId");
  const run = conversationId ? runs.get(conversationId) : [...runs.values()].at(-1);
  json(res, run ? publicRun(run) : { ok:true, enabled:false, status:"off", events:[] });
}

async function events(req, res) {
  const url = new URL(req.url, "http://relay.local");
  const conversationId = url.searchParams.get("conversationId");
  const after = Number(url.searchParams.get("after") || 0);
  const run = conversationId ? runs.get(conversationId) : [...runs.values()].at(-1);
  json(res, run ? { ok:true, conversationId:run.conversationId, cursor:run.events.length, events:run.events.slice(after), status:publicRun(run) } : { ok:true, cursor:0, events:[], status:{ enabled:false, status:"off" } });
}

function schedule(run, delayMs) {
  if (!run.enabled) return;
  if (run.timer) clearTimeout(run.timer);
  const ms = Math.max(10, Number(delayMs || 0));
  run.nextRunAt = Date.now() + ms;
  if (run.status !== "armed") run.status = "scheduled_next";
  run.phase = run.status;
  record(run, "state", { status:run.status, turns:run.turns, nextRunAt:run.nextRunAt });
  run.timer = setTimeout(() => tick(run).catch(error => fail(run, error)), ms);
}

async function tick(run) {
  if (!run.enabled || run.busy) return;
  if (run.turns >= run.settings.maxTurns) return finish(run);
  run.busy = true;
  const pendingTurn = run.turns + 1;
  run.pendingTurn = pendingTurn;
  try {
    run.status = "sending";
    run.phase = "sending";
    record(run, "state", { status:"sending", pendingTurn, turns:run.turns });
    const prompt = choosePrompt(run, pendingTurn);
    const proof = await sendVerified(run, prompt, pendingTurn);
    run.turns = pendingTurn;
    run.pendingTurn = 0;
    run.lastReply = proof.text || run.lastReply || "";
    run.lastMessageId = proof.assistantMessageId || "";
    run.lastUserMessageId = proof.userMessageId || "";
    run.status = "committed";
    run.phase = "committed";
    record(run, "state", { status:"committed", turns:run.turns, textLength:String(run.lastReply || "").length, assistantMessageId:run.lastMessageId });
    if (!run.enabled) return;
    if (run.turns >= run.settings.maxTurns) return finish(run);
    run.busy = false;
    schedule(run, run.settings.delayMs);
  } catch (error) {
    run.busy = false;
    fail(run, error);
  }
}

function finish(run) {
  run.enabled = false;
  run.busy = false;
  run.pendingTurn = 0;
  run.status = "done:max-turns";
  run.phase = run.status;
  run.nextRunAt = 0;
  if (run.timer) clearTimeout(run.timer);
  record(run, "state", { status:run.status, turns:run.turns });
}

function fail(run, error) {
  run.enabled = false;
  run.busy = false;
  run.pendingTurn = 0;
  run.status = "error";
  run.phase = "error";
  run.safeError = publicAuthError(error);
  run.lastError = run.safeError.safeHint;
  if (run.timer) clearTimeout(run.timer);
  record(run, "error", { status:run.safeError.status, error:run.safeError.error, safeHint:run.safeError.safeHint, turns:run.turns });
}

async function sendVerified(run, prompt, turn) {
  const token = await authToken(run.config);
  const ready = await waitForReadyParent(run.config, run.conversationId, token);
  const userMessageId = uuid();
  const body = {
    action:"next",
    conversation_id:run.conversationId,
    parent_message_id:ready.parentNodeId,
    model:"auto",
    messages:[{ id:userMessageId, author:{ role:"user" }, content:{ content_type:"text", parts:[prompt] }, metadata:{} }]
  };
  record(run, "send", { turn, prompt, parentNodeId:ready.parentNodeId, userMessageId });
  const response = await relayFetch(run.config, "/backend-api/conversation", {
    method:"POST",
    headers:{ "content-type":"application/json", authorization:`Bearer ${token}` },
    body:JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Relay automation POST failed: ${response.status} ${await response.text().catch(() => "")}`);
  const live = await readSse(response, event => record(run, "stream", { turn, ...event }));
  const proof = await waitForSettledAssistantAfter({ config:run.config, conversationId:run.conversationId, token, parentNodeId:ready.parentNodeId, userMessageId, fallbackText:live.text });
  record(run, "verified", { turn, assistantMessageId:proof.assistantMessageId, textLength:String(proof.text || "").length });
  return proof;
}

async function readSse(response, onPacket) {
  const reader = response.body?.getReader?.();
  if (!reader) return { text:"" };
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let seq = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream:true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() || "";
    for (const block of parts) {
      const data = block.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n").trim();
      if (!data || data === "[DONE]") continue;
      const parsed = safeJson(data);
      const msg = parsed?.message || parsed?.data?.message;
      const nextText = messageText(msg);
      if (nextText) text = nextText;
      onPacket({ seq:++seq, textLength:String(text || "").length, messageId:msg?.id || "" });
    }
  }
  return { text, seq };
}

async function waitForReadyParent(config, conversationId, token) {
  for (let i = 0; i < 45; i++) {
    const convo = await getConversation(config, conversationId, token);
    const node = currentMessage(convo);
    if (node?.author?.role === "assistant" && isSettledAssistant(node)) return { convo, parentNodeId:convo.current_node, parent:node };
    await sleep(300 + i * 60);
  }
  throw new Error("Relay automation could not find a settled assistant parent.");
}

async function waitForSettledAssistantAfter({ config, conversationId, token, parentNodeId, userMessageId, fallbackText = "" }) {
  for (let i = 0; i < 90; i++) {
    const convo = await getConversation(config, conversationId, token);
    const proof = verifyAdvance({ convo, parentNodeId, userMessageId, fallbackText });
    if (proof.ok) return proof;
    await sleep(350 + i * 80);
  }
  throw new Error("Relay automation conversation did not advance to a settled assistant.");
}

function verifyAdvance({ convo, parentNodeId, userMessageId, fallbackText }) {
  const currentNodeId = convo?.current_node || "";
  const current = currentMessage(convo);
  const chain = chainToRoot(convo, currentNodeId);
  const text = messageText(current) || fallbackText || "";
  return {
    ok:Boolean(currentNodeId && currentNodeId !== parentNodeId && current?.author?.role === "assistant" && isSettledAssistant(current) && text && chain.includes(parentNodeId) && chain.includes(userMessageId)),
    conversationId:convo?.conversation_id || convo?.id || "",
    assistantMessageId:current?.id || currentNodeId,
    currentNodeId,
    parentNodeId,
    userMessageId,
    text
  };
}

async function getConversation(config, conversationId, token) {
  const response = await relayFetch(config, `/backend-api/conversation/${conversationId}`, { headers:{ authorization:`Bearer ${token}` } });
  if (!response.ok) throw new Error(`Relay automation conversation load failed: ${response.status}`);
  return await response.json();
}

async function authToken(config) {
  return await requireAccessToken(config);
}

function relayFetch(config, path, options = {}) {
  const url = new URL(path, config.targetOrigin);
  return fetch(url, { ...options, headers:requestHeaders(options.headers || {}, url.origin), redirect:"manual", ...(options.body ? { duplex:"half" } : {}) });
}

function requestHeaders(headers, origin) {
  const clean = { accept:"application/json, text/event-stream, */*", referer:origin + "/", origin };
  for (const [key, value] of Object.entries(headers || {})) if (!/^(host|cookie|content-length)$/i.test(key)) clean[key] = value;
  const cookie = cookieHeader();
  if (cookie) clean.cookie = cookie;
  return clean;
}

function choosePrompt(run, turn) {
  const nodes = run.graph?.nodes || [];
  const start = run.graph?.start;
  const node = nodes.find(item => item.id === start) || nodes.find(item => item.type === "send");
  return String(node?.prompt || run.prompt || run.settings.prompt || "continue").replace(/\{\{turn\}\}/g, String(turn));
}

function currentMessage(convo) { return convo?.mapping?.[convo?.current_node]?.message || null; }
function chainToRoot(convo, nodeId) {
  const mapping = convo?.mapping || {};
  const out = [];
  const seen = new Set();
  let id = nodeId;
  while (id && mapping[id] && !seen.has(id) && out.length < 500) {
    out.push(id);
    seen.add(id);
    id = mapping[id].parent || mapping[id].parent_id || "";
  }
  return out;
}
function isSettledAssistant(node) {
  if (node?.author?.role !== "assistant") return false;
  const status = String(node.status || node.metadata?.status || "");
  if (/progress|stream|running|pending|queued|incomplete/i.test(status)) return false;
  if (node.metadata?.is_complete === false || node.metadata?.finished === false) return false;
  return Boolean(messageText(node) || /finished|complete|success|stop/i.test(status));
}
function messageText(node) {
  const content = node?.content || {};
  if (Array.isArray(content.parts)) return content.parts.find(part => typeof part === "string" && part.trim()) || content.parts.find(part => typeof part === "string") || "";
  return typeof content.text === "string" ? content.text : "";
}
function publicRun(run) {
  return {
    ok:run.status !== "error",
    owner:"node-relay",
    enabled:Boolean(run.enabled),
    conversationId:run.conversationId,
    status:run.status,
    phase:run.phase,
    turns:run.turns,
    pendingTurn:run.pendingTurn,
    nextRunAt:run.nextRunAt,
    error:run.safeError?.error || "",
    safeHint:run.safeError?.safeHint || "",
    lastError:run.lastError || "",
    lastReply:run.lastReply || "",
    lastMessageId:run.lastMessageId || "",
    settings:run.settings,
    eventCursor:run.events.length,
    events:run.events.slice(-30)
  };
}
function record(run, type, detail = {}) {
  const event = { index:run.events.length, at:Date.now(), iso:new Date().toISOString(), type, detail };
  run.updatedAt = event.at;
  run.events.push(event);
  if (run.events.length > 500) run.events.splice(0, run.events.length - 500);
  for (const listener of listeners) listener(event, run);
}
function normalizeSettings(settings = {}) {
  return { enabled:true, maxTurns:Math.max(1, Number(settings.maxTurns || 3)), delayMs:Math.max(0, Number(settings.delayMs || 1000)), prompt:String(settings.prompt || "continue"), stopOnError:settings.stopOnError !== false };
}
function safeJson(text) { try { return JSON.parse(text); } catch { return null; } }
function uuid() { return `BH_RELAY_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
module.exports = { handleAutomationApi, runs };
