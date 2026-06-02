// B"H
const store = require("./taskStore.js");
const { runGenericTask } = require("./genericTask.js");
const { runNovelTask } = require("./novelPipeline.js");
const { sendAgentMessage } = require("./client.js");
const { taskLimits } = require("./taskLimits.js");

/**
 * B"H
 * Chapter 359: The Gate Opened Instantly While The Forest Worked.
 *
 * Spawn returns a task id at once. The real labor continues in a detached
 * promise, like lightning entering a vessel and leaving a visible ledger trail
 * for every poll, child, promotion cycle, failure, and finished file.
 */
function spawnTask(config, payload = {}) {
  const task = store.createTask(normalizeInput(config, payload));
  Promise.resolve().then(() => runTask(config, task.id)).catch(() => {});
  return {
    ok: true,
    action: "aiAgentSpawnTask",
    taskId: task.id,
    status: task.status,
    pollEveryMs: task.input.pollIntervalMs,
    promotionCycles: task.input.promotionCycles,
    check: { action: "aiAgentTaskStatus", taskId: task.id }
  };
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
  if (kind === "agentMessage") {
    store.event(task, "Sending direct delegate message.");
    return sendAgentMessage(config, task.input);
  }
  return runGenericTask(config, task, runTask);
}

function status(payload = {}) {
  const task = store.readTask(payload.taskId || payload.id);
  if (!task) return { ok: false, action: "aiAgentTaskStatus", error: "unknown_task" };
  return { ok: true, action: "aiAgentTaskStatus", task, children: store.childrenOf(task.id), activeFamily: store.activeFamily(task.rootTaskId || task.id).map(t => t.id) };
}

function result(payload = {}) {
  const task = store.readTask(payload.taskId || payload.id);
  if (!task) return { ok: false, action: "aiAgentTaskResult", error: "unknown_task" };
  return { ok: task.status === "complete", action: "aiAgentTaskResult", status: task.status, output: task.output, error: task.error, task };
}

function list(payload = {}) {
  return { ok: true, action: "aiAgentTaskList", tasks: store.listTasks(Number(payload.limit || 50)) };
}

function normalizeInput(config, payload = {}) {
  const limits = taskLimits(config, payload);
  const rootTaskId = payload.rootTaskId || payload.taskId || null;
  return {
    kind: payload.kind || payload.taskKind || "genericTask",
    title: payload.title || "Delegated AI task",
    agentId: payload.agentId || payload.agent || "minimax-deep",
    summaryAgentId: payload.summaryAgentId,
    provider: payload.provider || "minimax",
    model: payload.model,
    prompt: payload.prompt || payload.message,
    messages: payload.messages,
    system: payload.system,
    outputDir: payload.outputDir,
    fileName: payload.fileName,
    summaryFileName: payload.summaryFileName,
    stream: payload.stream !== false,
    parentTaskId: payload.parentTaskId || null,
    rootTaskId,
    depth: Number(payload.depth || 0),
    ...limits
  };
}

module.exports = { list, result, runTask, spawnTask, status };
