// B"H
const { loadConfig } = require("../../../../../apps/tunnel/agent/lib/config.js");
const { listProviders } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/providers.js");
const { listAgents } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/registry.js");
const { sendAgentMessage } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js");
const {
  REMOTE_WARNING,
  accountProviderSummaries,
  actionPayload,
  mergeAccountKeys,
  removeAccountProviderKey,
  saveAccountProviderKey
} = require("../../core/accountAiConfigStore.js");

const tasks = [];
const AI_ACTIONS = new Set([
  "aiAgentList",
  "aiAgentMessage",
  "aiAgentSpawnTask",
  "aiAgentTaskList",
  "aiAgentTaskStatus",
  "aiAgentTaskResult",
  "aiAgentSetProviderKey",
  "aiAgentRemoveProviderKey"
]);

/**
 * B"H
 * Chapter 4: The Virtual OS found the remote well.
 *
 * The hosted vessel cannot read a user's local ~/.awtsmoos-secrets directory.
 * It can only use provider keys that the user explicitly saved into the
 * Awtsmoos account store. Thus MiniMax becomes available in Virtual OS only
 * after consent, and every save action returns the remote-storage warning.
 */
function isVirtualAiAction(action = "") { return AI_ACTIONS.has(String(action)); }

async function handleVirtualAiAction(action, payload = {}, dispatch) {
  const merged = actionPayload(payload);
  if (action === "aiAgentList") return listVirtualAgents(merged);
  if (action === "aiAgentMessage") return messageVirtualOs(merged, dispatch);
  if (action === "aiAgentSpawnTask") return spawnVirtualTask(merged, dispatch);
  if (action === "aiAgentTaskList") return listVirtualTasks(merged);
  if (action === "aiAgentTaskStatus") return taskStatus(merged);
  if (action === "aiAgentTaskResult") return taskResult(merged);
  if (action === "aiAgentSetProviderKey") return setRemoteProviderKey(merged);
  if (action === "aiAgentRemoveProviderKey") return removeRemoteProviderKey(merged);
  return { ok: false, action, error: "unsupported_virtual_ai_action" };
}

function config(payload = {}) {
  const cfg = mergeAccountKeys(loadConfig(), payload.__awtsmoosUserId);
  const provider = String(payload.provider || payload.providerId || "").trim().toLowerCase();
  const apiKey = String(payload.apiKey || "").trim();
  if (!provider || !apiKey) return cfg;
  return { ...cfg, aiAgents: { ...(cfg.aiAgents || {}), providerKeys: { ...(cfg.aiAgents?.providerKeys || {}), [provider]: apiKey } } };
}

function listVirtualAgents(payload = {}) {
  const cfg = config(payload);
  return {
    ok: true,
    action: "aiAgentList",
    vessel: "virtual-os",
    agents: listAgents(cfg),
    providers: markRemoteProviders(listProviders(cfg), payload.__awtsmoosUserId),
    accountProviderKeys: accountProviderSummaries(payload.__awtsmoosUserId),
    remoteProviderKeyWarning: REMOTE_WARNING,
    taskActions: [...AI_ACTIONS].filter(x => x.startsWith("aiAgentTask") || x === "aiAgentSpawnTask"),
    virtualOs: { availableWithoutLocalTunnel: true, secureBy: "server-auth-plus-user-scoped-account-ai-config" }
  };
}

async function messageVirtualOs(payload, dispatch) {
  const context = await readContext(payload, dispatch);
  const got = await sendAgentMessage(config(payload), {
    ...payload,
    agentId: payload.agentId || "minimax-deep",
    provider: payload.provider || "minimax",
    model: payload.model || "MiniMax-M2.7",
    message: promptForVirtualOs(payload, context),
    stream: payload.stream === true
  });
  return { ...got, action: "aiAgentMessage", vessel: "virtual-os", virtualOsContext: context.publicContext };
}

async function spawnVirtualTask(payload, dispatch) {
  const task = makeTask(payload);
  tasks.unshift(task); trimTasks();
  runTask(task, payload, dispatch).catch(error => failTask(task, error));
  return { ok: true, action: "aiAgentSpawnTask", vessel: "virtual-os", taskId: task.id, status: task.status, check: { action: "aiAgentTaskStatus", taskId: task.id } };
}

async function runTask(task, payload, dispatch) {
  task.status = "running"; task.events.push(evt("Task started."));
  const got = await messageVirtualOs(payload, dispatch);
  task.output = got; task.status = got.ok === false ? "failed" : "complete";
  task.finishedAt = new Date().toISOString(); task.events.push(evt("Task completed."));
  if (payload.outputDir && payload.fileName && got.text) await writeOutput(payload, got.text, dispatch);
  return task;
}

function setRemoteProviderKey(payload = {}) {
  const saved = saveAccountProviderKey(payload.__awtsmoosUserId, payload);
  return { ...saved, action: "aiAgentSetProviderKey", vessel: "virtual-os", warning: saved.warning || REMOTE_WARNING };
}

function removeRemoteProviderKey(payload = {}) {
  const removed = removeAccountProviderKey(payload.__awtsmoosUserId, payload);
  return { ...removed, action: "aiAgentRemoveProviderKey", vessel: "virtual-os" };
}

function markRemoteProviders(providers, userId) {
  const remote = new Map(accountProviderSummaries(userId).map(item => [item.provider, item]));
  return providers.map(provider => remote.has(provider.id) ? { ...provider, keySource: "awtsmoosAccount", keyMask: remote.get(provider.id).keyMask, hasKey: true } : provider);
}

function listVirtualTasks(payload = {}) {
  return { ok: true, action: "aiAgentTaskList", vessel: "virtual-os", tasks: tasks.slice(0, Number(payload.limit || 50)) };
}

function taskStatus(payload = {}) {
  const task = findTask(payload);
  return task ? { ok: true, action: "aiAgentTaskStatus", vessel: "virtual-os", task } : missingTask();
}

function taskResult(payload = {}) {
  const task = findTask(payload);
  return task ? { ok: task.status === "complete", action: "aiAgentTaskResult", vessel: "virtual-os", status: task.status, output: task.output, task } : missingTask();
}

function findTask(payload = {}) { return tasks.find(t => t.id === (payload.taskId || payload.id)); }
function missingTask() { return { ok: false, vessel: "virtual-os", error: "unknown_virtual_ai_task" }; }

async function readContext(payload, dispatch) {
  const path = payload.path && payload.path !== "." ? payload.path : payload.contextPath || "";
  if (!path) return { publicContext: { path: "", read: false }, text: "" };
  const read = await dispatch({ ...payload, action: "read", path, maxChars: Number(payload.contextMaxChars || payload.maxChars || 4000) });
  return { publicContext: { path, read: read.ok !== false, error: read.error || null }, text: read.content || "" };
}

function promptForVirtualOs(payload, context) {
  return [
    "You are talking to the Awtsmoos Virtual OS, not a local tunnel.",
    `User task: ${payload.message || payload.prompt || "Inspect and respond."}`,
    context.text ? `Virtual OS file context:\n${context.text}` : "No file context was requested.",
    "Answer with concrete next steps and mention any Virtual OS actions you need."
  ].join("\n\n");
}

async function writeOutput(payload, text, dispatch) {
  return dispatch({ ...payload, action: "write", path: [payload.outputDir, payload.fileName].filter(Boolean).join("/"), content: text, confirm: true, dryRun: false });
}

function makeTask(payload = {}) {
  const now = new Date().toISOString();
  return { id: `vos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ok: true, status: "queued", input: safeInput(payload), output: null, events: [evt("Task queued.")], createdAt: now, updatedAt: now };
}

function safeInput(payload = {}) {
  const copy = { ...payload };
  delete copy.apiKey; delete copy.content; delete copy.__awtsmoosUserId;
  return copy;
}

function failTask(task, error) {
  task.status = "failed"; task.error = error.message;
  task.finishedAt = new Date().toISOString(); task.events.push(evt("Task failed."));
}
function evt(message) { return { at: new Date().toISOString(), message }; }
function trimTasks() { tasks.splice(200); }
module.exports = { handleVirtualAiAction, isVirtualAiAction, tasks };
