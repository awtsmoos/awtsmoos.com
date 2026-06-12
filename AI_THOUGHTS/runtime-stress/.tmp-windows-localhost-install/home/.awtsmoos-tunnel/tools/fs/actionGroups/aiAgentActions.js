// B"H
const { loadConfig, saveConfigPatch } = require("../../../lib/config.js");
const { listProviders, providerFor } = require("./aiAgents/providers.js");
const { listAgents } = require("./aiAgents/registry.js");
const { sendAgentMessage } = require("./aiAgents/client.js");
const tasks = require("./aiAgents/taskRunner.js");

const NUMERIC_AI_KEYS = ["maxDepth", "maxChildrenPerTask", "maxTotalTasks", "pollIntervalMs", "promotionCycles", "agentCycles", "chapterCycles", "providerTimeoutMs"];

/**
 * B"H
 * Chapter 387: The agent council gained one public gate.
 * Old aiAgent* actions remain, while action=agent&mode=list/message/spawn/status
 * routes to the same living delegate system.
 */
function buildAiAgentActions(ctx) {
  const raw = actionPayload(ctx.payload);
  return {
    async agent() { return await consolidatedAgent(raw); },
    async aiAgentList() { return listAll(); },
    async aiAgentConfigSet() { return setConfig(raw); },
    async aiAgentSetProviderKey() { return setProviderKey(raw); },
    async aiAgentRemoveProviderKey() { return removeProviderKey(raw); },
    async aiAgentMessage() { return sendAgentMessage(loadConfig(), raw); },
    async aiAgentSpawnTask() { return tasks.spawnTask(loadConfig(), raw); },
    async aiAgentSpawnNovel() { return tasks.spawnTask(loadConfig(), { ...raw, kind: "novelOrchestra" }); },
    async aiAgentTaskStatus() { return tasks.status(raw); },
    async aiAgentTaskResult() { return tasks.result(raw); },
    async aiAgentTaskList() { return tasks.list(raw); }
  };
}

async function consolidatedAgent(payload = {}) {
  const mode = String(payload.mode || payload.agentMode || "message").trim();
  if (mode === "list") return listAll();
  if (mode === "config") return setConfig(payload);
  if (mode === "setKey") return setProviderKey(payload);
  if (mode === "removeKey") return removeProviderKey(payload);
  if (mode === "spawn") return tasks.spawnTask(loadConfig(), payload);
  if (mode === "novel") return tasks.spawnTask(loadConfig(), { ...payload, kind: "novelOrchestra" });
  if (mode === "status") return tasks.status(payload);
  if (mode === "result") return tasks.result(payload);
  if (mode === "tasks") return tasks.list(payload);
  return sendAgentMessage(loadConfig(), payload);
}

function actionPayload(payload = {}) { return { ...payload, ...parsePayloadJson(payload) }; }

function parsePayloadJson(payload = {}) {
  const fields = [payload.params, payload.content, payload.text, payload.body, payload.query, payload.goal];
  for (const field of fields) {
    const parsed = parseOne(field);
    if (Object.keys(parsed).length) return parsed;
  }
  return {};
}

function parseOne(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  const text = String(value || "").trim();
  if (!text) return {};
  if (text.startsWith("base64json:")) return parseOne(Buffer.from(text.slice(11), "base64").toString("utf8"));
  if (!text.startsWith("{")) return {};
  try { const json = JSON.parse(text); return json && typeof json === "object" ? json : {}; }
  catch { return {}; }
}

function listAll() {
  const config = loadConfig();
  return { ok: true, action: "aiAgentList", agents: listAgents(config), providers: listProviders(config), config: publicAiConfig(config), taskActions: taskActions(), paramsJson: true };
}

function setConfig(payload = {}) {
  const current = loadConfig();
  const patch = { ...current.aiAgents };
  for (const key of NUMERIC_AI_KEYS) if (payload[key] !== undefined) patch[key] = Number(payload[key]);
  if (payload.allowRecursiveSpawn !== undefined) patch.allowRecursiveSpawn = payload.allowRecursiveSpawn !== false && payload.allowRecursiveSpawn !== "false";
  const next = saveConfigPatch({ aiAgents: patch });
  return { ok: true, action: "aiAgentConfigSet", config: publicAiConfig(next) };
}

function setProviderKey(payload = {}) {
  const providerId = clean(payload.provider || payload.providerId);
  if (!knownProvider(providerId)) return failure("unknown_provider", { providerId });
  const apiKey = String(payload.apiKey || "").trim();
  if (!apiKey) return failure("missing_api_key", { providerId });
  const current = loadConfig();
  const providerKeys = { ...(current.aiAgents?.providerKeys || {}), [providerId]: apiKey };
  const next = saveConfigPatch({ aiAgents: { ...(current.aiAgents || {}), providerKeys } });
  return { ok: true, action: "aiAgentSetProviderKey", provider: providerId, providers: listProviders(next) };
}

function removeProviderKey(payload = {}) {
  const providerId = clean(payload.provider || payload.providerId);
  if (!knownProvider(providerId)) return failure("unknown_provider", { providerId });
  const current = loadConfig();
  const providerKeys = { ...(current.aiAgents?.providerKeys || {}) };
  delete providerKeys[providerId];
  const next = saveConfigPatch({ aiAgents: { ...(current.aiAgents || {}), providerKeys } });
  return { ok: true, action: "aiAgentRemoveProviderKey", provider: providerId, providers: listProviders(next) };
}

function publicAiConfig(config) {
  const ai = config.aiAgents || {};
  return { maxDepth: ai.maxDepth, maxChildrenPerTask: ai.maxChildrenPerTask, maxTotalTasks: ai.maxTotalTasks, pollIntervalMs: ai.pollIntervalMs, promotionCycles: ai.promotionCycles, agentCycles: ai.agentCycles, chapterCycles: ai.chapterCycles, providerTimeoutMs: ai.providerTimeoutMs, allowRecursiveSpawn: ai.allowRecursiveSpawn };
}

function knownProvider(providerId) { try { providerFor(providerId); return true; } catch (_) { return false; } }
function taskActions() { return ["agent", "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult", "aiAgentTaskList", "aiAgentConfigSet"]; }
function clean(value) { return String(value || "").trim().toLowerCase(); }
function failure(error, extra = {}) { return { ok: false, action: "aiAgent", error, ...extra }; }

module.exports = { actionPayload, buildAiAgentActions, consolidatedAgent };
