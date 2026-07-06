// B"H
const crypto = require("crypto");
const { continuationPath } = require("../storage/paths.js");
const { readJson, writeJson } = require("../storage/jsonStore.js");
const { idFromUrl } = require("../conversations/registry.js");

function newId(prefix = "chatgpt_loop") { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`; }
async function readState() { return await readJson(continuationPath(), { loops: {}, current: null }); }
async function writeState(state) { return await writeJson(continuationPath(), state); }
function cleanUrl(url = "") { return String(url || "").trim(); }
function conversationIdFrom(input = {}) { return input.conversationId || idFromUrl(input.conversationUrl || input.url || "") || ""; }
function urlFrom(input = {}) {
  const url = cleanUrl(input.conversationUrl || input.url || "");
  const id = conversationIdFrom(input);
  return url || (id ? `https://chatgpt.com/c/${encodeURIComponent(id)}` : "https://chatgpt.com/");
}

async function upsert(loop) {
  const state = await readState();
  state.current = loop.loopId;
  state.loops[loop.loopId] = { ...(state.loops[loop.loopId] || {}), ...loop, updatedAt: new Date().toISOString() };
  await writeState(state);
  return state.loops[loop.loopId];
}

async function get(loopId = "") {
  const state = await readState();
  const id = loopId || state.current;
  return id ? state.loops[id] || null : null;
}

async function list() {
  const state = await readState();
  return { current: state.current, loops: Object.values(state.loops || {}) };
}

async function stop(loopId = "", reason = "user_stop") {
  const loop = await get(loopId);
  if (!loop) return null;
  return await upsert({ ...loop, status: "stopped", stoppedAt: new Date().toISOString(), stopReason: reason });
}

function makeLoop(input = {}) {
  const now = new Date().toISOString();
  const loopId = input.loopId || newId();
  return { loopId, status: "active", createdAt: now, turnsSent: 0, failures: 0, events: [], conversationId: conversationIdFrom(input), url: urlFrom(input), prompt: input.prompt, maxTurns: input.maxTurns, profile: input.profile || input.profileName || "default", port: Number(input.port || input.chromePort || 9223), agentSessionId: input.agentSessionId || "", logicalAgentId: input.logicalAgentId || "", roomId: input.roomId || "", missionId: input.missionId || "", conclusionAction: input.conclusionAction || "chatgptContinuationConclusion" };
}

module.exports = { conversationIdFrom, get, list, makeLoop, stop, upsert, urlFrom };
