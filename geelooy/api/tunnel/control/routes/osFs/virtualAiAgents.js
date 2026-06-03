// B"H
const { loadConfig } = require("../../../../../apps/tunnel/agent/lib/config.js");
const { listProviders } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/providers.js");
const { listAgents } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/registry.js");
const { sendAgentMessage } = require("../../../../../apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js");

const tasks = [];
const AI_ACTIONS = new Set(["aiAgentList", "aiAgentMessage", "aiAgentSpawnTask", "aiAgentTaskList", "aiAgentTaskStatus", "aiAgentTaskResult"]);

/**
 * B"H
 * Chapter 376: MiniMax Spoke Into A Hosted Root Without Local Metal.
 *
 * The Virtual OS is user-scoped by the dispatcher that hands us `dispatch`.
 * This module never receives or invents raw filesystem authority. It asks the
 * provided Virtual OS dispatcher to read/write, and MiniMax only receives a
 * textual summary/result. Thus one user's sparks cannot cross another user's
 * alias wall, even when no local tunnel agent is running.
 */
function isVirtualAiAction(action = "") { return AI_ACTIONS.has(String(action)); }
async function handleVirtualAiAction(action, payload = {}, dispatch) {
  if (action === "aiAgentList") return listVirtualAgents();
  if (action === "aiAgentMessage") return messageVirtualOs(payload, dispatch);
  if (action === "aiAgentSpawnTask") return spawnVirtualTask(payload, dispatch);
  if (action === "aiAgentTaskList") return listVirtualTasks(payload);
  if (action === "aiAgentTaskStatus") return taskStatus(payload);
  if (action === "aiAgentTaskResult") return taskResult(payload);
  return { ok: false, action, error: "unsupported_virtual_ai_action" };
}
function config() { return loadConfig(); }
function listVirtualAgents() {
  const cfg = config();
  return { ok: true, action: "aiAgentList", vessel: "virtual-os", agents: listAgents(cfg), providers: listProviders(cfg), taskActions: [...AI_ACTIONS].filter(x => x.startsWith("aiAgentTask") || x === "aiAgentSpawnTask"), virtualOs: { availableWithoutLocalTunnel: true, secureBy: "server-auth-plus-user-scoped-os-dispatch" } };
}
async function messageVirtualOs(payload, dispatch) {
  const context = await readContext(payload, dispatch);
  const got = await sendAgentMessage(config(), { ...payload, agentId: payload.agentId || "minimax-deep", provider: payload.provider || "minimax", model: payload.model || "MiniMax-M2.7", message: promptForVirtualOs(payload, context), stream: payload.stream === true });
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
  task.output = got; task.status = got.ok === false ? "failed" : "complete"; task.finishedAt = new Date().toISOString(); task.events.push(evt("Task completed."));
  if (payload.outputDir && payload.fileName && got.text) await writeOutput(payload, got.text, dispatch);
  return task;
}
function listVirtualTasks(payload = {}) { return { ok: true, action: "aiAgentTaskList", vessel: "virtual-os", tasks: tasks.slice(0, Number(payload.limit || 50)) }; }
function taskStatus(payload = {}) { const task = findTask(payload); return task ? { ok: true, action: "aiAgentTaskStatus", vessel: "virtual-os", task } : missingTask(); }
function taskResult(payload = {}) { const task = findTask(payload); return task ? { ok: task.status === "complete", action: "aiAgentTaskResult", vessel: "virtual-os", status: task.status, output: task.output, task } : missingTask(); }
function findTask(payload = {}) { return tasks.find(t => t.id === (payload.taskId || payload.id)); }
function missingTask() { return { ok: false, vessel: "virtual-os", error: "unknown_virtual_ai_task" }; }
async function readContext(payload, dispatch) {
  const path = payload.path && payload.path !== "." ? payload.path : payload.contextPath || "";
  if (!path) return { publicContext: { path: "", read: false }, text: "" };
  const read = await dispatch({ ...payload, action: "read", path, maxChars: Number(payload.contextMaxChars || payload.maxChars || 4000) });
  return { publicContext: { path, read: read.ok !== false, error: read.error || null }, text: read.content || "" };
}
function promptForVirtualOs(payload, context) { return [`You are talking to the Awtsmoos Virtual OS, not a local tunnel.`, `User task: ${payload.message || payload.prompt || "Inspect and respond."}`, context.text ? `Virtual OS file context:\n${context.text}` : "No file context was requested.", `Answer with concrete next steps and mention any Virtual OS actions you need.`].join("\n\n"); }
async function writeOutput(payload, text, dispatch) { return dispatch({ ...payload, action: "write", path: [payload.outputDir, payload.fileName].filter(Boolean).join("/"), content: text, confirm: true, dryRun: false }); }
function makeTask(payload = {}) { const now = new Date().toISOString(); return { id: `vos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ok: true, status: "queued", input: safeInput(payload), output: null, events: [evt("Task queued.")], createdAt: now, updatedAt: now }; }
function safeInput(payload = {}) { const copy = { ...payload }; delete copy.apiKey; delete copy.content; return copy; }
function failTask(task, error) { task.status = "failed"; task.error = error.message; task.finishedAt = new Date().toISOString(); task.events.push(evt("Task failed.")); }
function evt(message) { return { at: new Date().toISOString(), message }; }
function trimTasks() { tasks.splice(200); }
module.exports = { handleVirtualAiAction, isVirtualAiAction, tasks };
