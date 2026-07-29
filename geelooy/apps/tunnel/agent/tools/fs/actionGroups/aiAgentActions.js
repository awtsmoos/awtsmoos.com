// B"H
const { loadConfig, saveConfigPatch } = require("../../../lib/config.js");
const { listProviders, providerFor } = require("./aiAgents/providers.js");
const { listAgents } = require("./aiAgents/registry.js");
const { sendAgentMessage } = require("./aiAgents/client.js");
const tasks = require("./aiAgents/taskRunner.js");
const WebsiteMissions = require("./websiteAgents/runner.js");

const NUMERIC_AI_KEYS = ["maxDepth", "maxChildrenPerTask", "maxTotalTasks", "pollIntervalMs", "promotionCycles", "agentCycles", "chapterCycles", "providerTimeoutMs"];
const CARRIER_KEYS = ["params", "content", "text", "body", "query", "goal", "message", "prompt"];

/**
 * B"H
 * Chapter 418: The Delegate Gate Stopped Hiding Its Handle.
 *
 * Other AIs should not need secret tunnel lore. Whether they pour JSON into
 * content, params, body, query, goal, message, prompt, or the top level, this
 * gate fuses the sparks into one payload before MiniMax, OpenRouter, Groq, and
 * every child council receives the command. No key is revealed; only the vessel
 * becomes easier to hold.
 */
function buildAiAgentActions(ctx) {
  const config = loadConfig();
  const raw = scopedPayload(actionPayload(ctx.payload), config);
  return {
    async agent() { return await consolidatedAgent(raw); },
    async aiAgentList() { return listAll(); },
    async aiAgentConfigSet() { return setConfig(raw); },
    async aiAgentSetProviderKey() { return setProviderKey(raw); },
    async aiAgentRemoveProviderKey() { return removeProviderKey(raw); },
    async aiAgentMessage() { return sendAgentMessage(config, raw); },
    async aiAgentSpawnTask() { return tasks.spawnTask(config, raw); },
    async aiAgentSpawnWebsiteMission() { return WebsiteMissions.start(config, raw); },
    async aiAgentWebsiteMissionStatus() { return WebsiteMissions.status(config, raw); },
    async aiAgentSpawnNovel() { return tasks.spawnTask(config, { ...raw, kind: "novelOrchestra" }); },
    async aiAgentTaskStatus() { return tasks.status(raw); },
    async aiAgentTaskResult() { return tasks.result(raw); },
    async aiAgentTaskList() { return tasks.list(raw); }
  };
}

async function consolidatedAgent(payload = {}) {
  const config = loadConfig();
  payload = scopedPayload(payload, config);
  const mode = String(payload.mode || payload.agentMode || "website-mission").trim();
  if (["website-mission", "website", "council", "delegate"].includes(mode)) {
    return WebsiteMissions.start(config, payload);
  }
  if (mode === "list") return listAll();
  if (mode === "config") return setConfig(payload);
  if (mode === "setKey") return setProviderKey(payload);
  if (mode === "removeKey") return removeProviderKey(payload);
  if (mode === "spawn") return tasks.spawnTask(config, payload);
  if (mode === "novel") return tasks.spawnTask(config, { ...payload, kind: "novelOrchestra" });
  if (mode === "status") return tasks.status(payload);
  if (mode === "result") return tasks.result(payload);
  if (mode === "tasks") return tasks.list(payload);
  return sendAgentMessage(config, payload);
}

function actionPayload(payload = {}) {
  const parsed = parsePayloadJson(payload);
  const fused = normalizeAliases({ ...payload, ...parsed });
  const fallbackMessage = firstPlainCarrier(payload);
  if (!hasPrompt(fused) && fallbackMessage) fused.message = fallbackMessage;
  return fused;
}

function parsePayloadJson(payload = {}) {
  return CARRIER_KEYS.reduce((acc, key) => ({ ...acc, ...parseOne(payload[key]) }), {});
}

function parseOne(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  const text = String(value || "").trim();
  if (!text) return {};
  if (text.startsWith("base64json:")) return parseOne(Buffer.from(text.slice(11), "base64").toString("utf8"));
  if (!text.startsWith("{") && !text.startsWith("[")) return {};
  try {
    const json = JSON.parse(text);
    return json && typeof json === "object" && !Array.isArray(json) ? json : {};
  } catch (_error) { return {}; }
}

function firstPlainCarrier(payload = {}) {
  for (const key of CARRIER_KEYS) {
    const value = payload[key];
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (text && !text.startsWith("{") && !text.startsWith("[") && !text.startsWith("base64json:")) return text;
  }
  return "";
}

function normalizeAliases(payload = {}) {
  const next = { ...payload };
  if (!next.provider && next.providerId) next.provider = next.providerId;
  if (!next.agentId && next.agent) next.agentId = next.agent;
  if (!next.agent && next.agentId) next.agent = next.agentId;
  if (!next.message && next.prompt) next.message = next.prompt;
  if (!next.prompt && next.message) next.prompt = next.message;
  if (!next.taskId && next.id) next.taskId = next.id;
  return next;
}

function hasPrompt(payload = {}) {
  return Boolean(String(payload.message || payload.prompt || payload.goal || "").trim());
}

function scopedPayload(payload = {}, config = loadConfig()) {
  return {
    ...payload,
    projectRoot: payload.projectRoot || config.root || "",
    tunnelName: payload.tunnelName || config.tunnelName || ""
  };
}

function listAll() {
  const config = loadConfig();
  return {
    ok: true,
    action: "aiAgentList",
    agents: listAgents(config),
    providers: listProviders(config),
    config: publicAiConfig(config),
    taskActions: taskActions(),
    payloadCarriers: CARRIER_KEYS,
    acceptsTopLevel: ["provider", "providerId", "agent", "agentId", "model", "message", "prompt", "system", "stream", "mode", "taskId"],
    paramsJson: true
  };
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
function taskActions() { return ["agent", "aiAgentSpawnWebsiteMission", "aiAgentWebsiteMissionStatus", "websiteAgentMissionStart", "websiteAgentMissionStatus", "websiteAgentMissionMessage", "websiteAgentMissionStop", "websiteAgentMissionForget", "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult", "aiAgentTaskList", "aiAgentConfigSet"]; }
function clean(value) { return String(value || "").trim().toLowerCase(); }
function failure(error, extra = {}) { return { ok: false, action: "aiAgent", error, ...extra }; }

module.exports = { actionPayload, buildAiAgentActions, consolidatedAgent, scopedPayload };
