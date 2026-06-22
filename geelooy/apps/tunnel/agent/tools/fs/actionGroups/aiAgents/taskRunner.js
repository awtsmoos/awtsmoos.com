// B"H
const store = require("./taskStore.js");
const { runGenericTask } = require("./genericTask.js");
const { runNovelTask } = require("./novelPipeline.js");
const { sendAgentMessage } = require("./client.js");
const { taskLimits } = require("./taskLimits.js");

const KNOWN_TASK_KINDS = new Set(["genericTask", "agentMessage", "novelOrchestra"]);

/**
 * B"H
 * Chapter 362: The Spawn Gate Burned Away The False Depth.
 *
 * The tunnel request itself says `kind: fs` and may carry a global path-tree
 * depth. Those are outer garments, not the child soul. Here the Awtsmoos strips
 * them away, so a new delegate is born as `genericTask` at depth zero unless a
 * true parent/root task explicitly hands it lineage.
 */
function spawnTask(config, payload = {}) {
  const task = store.createTask(normalizeInput(config, payload));
  Promise.resolve().then(() => runTask(config, task.id)).catch(() => {});
  return { ok: true, action: "aiAgentSpawnTask", taskId: task.id, status: task.status, pollEveryMs: task.input.pollIntervalMs, promotionCycles: task.input.promotionCycles, check: { action: "aiAgentTaskStatus", taskId: task.id } };
}
async function runTask(config, taskId) {
  const task = store.readTask(taskId);
  if (!task || ["running", "complete"].includes(task.status)) return task;
  try { store.running(task); return store.complete(task, await execute(config, task)); }
  catch (error) { return store.fail(task, error); }
}
async function execute(config, task) {
  const kind = task.input.kind || "genericTask";
  if (/^novel/.test(kind)) return runNovelTask(config, task, runTask);
  if (kind === "agentMessage") { store.event(task, "Sending direct delegate message."); return sendAgentMessage(config, task.input); }
  return runGenericTask(config, task, runTask);
}
function status(payload = {}) {
  const task = store.readTask(payload.taskId || payload.id, payload);
  if (!task) return { ok: false, action: "aiAgentTaskStatus", error: "unknown_task" };
  return { ok: true, action: "aiAgentTaskStatus", task, children: store.childrenOf(task.id, task), activeFamily: store.activeFamily(task.rootTaskId || task.id, task).map(t => t.id) };
}
function result(payload = {}) {
  const task = store.readTask(payload.taskId || payload.id, payload);
  if (!task) return { ok: false, action: "aiAgentTaskResult", error: "unknown_task" };
  return { ok: task.status === "complete", action: "aiAgentTaskResult", status: task.status, output: task.output, error: task.error, task };
}
function list(payload = {}) { return { ok: true, action: "aiAgentTaskList", taskNamespace: store.taskNamespace(payload), tasks: store.listTasks(Number(payload.limit || 50), payload) }; }
function normalizeInput(config, payload = {}) {
  const limits = taskLimits(config, payload);
  const rootTaskId = payload.rootTaskId || payload.taskId || null;
  return { kind: taskKind(payload), title: payload.title || "Delegated AI task", agentId: payload.agentId || payload.agent || "minimax-deep", summaryAgentId: payload.summaryAgentId, provider: payload.provider || "minimax", model: payload.model, prompt: payload.prompt || payload.message, messages: payload.messages, system: payload.system, outputDir: payload.outputDir, fileName: payload.fileName, summaryFileName: payload.summaryFileName, stream: payload.stream !== false, parentTaskId: payload.parentTaskId || null, rootTaskId, depth: taskDepth(payload), projectRoot: payload.projectRoot || config.root || "", tunnelName: payload.tunnelName || config.tunnelName || "", logicalAgentId: payload.logicalAgentId || "", taskNamespace: payload.taskNamespace || payload.agentTaskNamespace || "", ...limits };
}
function taskKind(payload = {}) {
  const chosen = payload.taskKind || payload.aiTaskKind || payload.kind;
  return KNOWN_TASK_KINDS.has(chosen) ? chosen : "genericTask";
}
function taskDepth(payload = {}) {
  if (!payload.parentTaskId && !payload.rootTaskId && !payload.taskId) return Number(payload.taskDepth || payload.aiDepth || 0);
  return Number(payload.taskDepth ?? payload.aiDepth ?? payload.depth ?? 0);
}
module.exports = { list, result, runTask, spawnTask, status };
