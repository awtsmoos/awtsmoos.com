// B"H
const fs = require("fs");
const path = require("path");
const { ROOT } = require("../../../../lib/config.js");

const TASK_ROOT = path.join(ROOT, "ai-agent-tasks");
const memory = new Map();

/**
 * B"H
 * Chapter 355: The Ledger Learned To Remember Children.
 *
 * Every spawned delegate is a letter of speech inside the parent task. The
 * disk ledger records lineage, status, events, and results so the main agent
 * can poll without guessing while the Awtsmoos renews the forest in truth.
 */
function ensureTaskRoot() { fs.mkdirSync(TASK_ROOT, { recursive: true }); }
function taskPath(id) { return path.join(TASK_ROOT, id + ".json"); }
function now() { return new Date().toISOString(); }
function makeTaskId(prefix = "task") {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function createTask(input = {}) {
  ensureTaskRoot();
  const id = input.taskId || makeTaskId(input.kind || "task");
  return saveTask({
    id, ok: true, status: "queued", input,
    parentTaskId: input.parentTaskId || null,
    rootTaskId: input.rootTaskId || input.taskId || id,
    childTaskIds: [], events: [], output: null, error: null,
    createdAt: now(), updatedAt: now(), finishedAt: null
  });
}

function saveTask(task) {
  ensureTaskRoot(); task.updatedAt = now();
  fs.writeFileSync(taskPath(task.id), JSON.stringify(task, null, 2), "utf8");
  memory.set(task.id, task); return task;
}

function readTask(id) {
  if (!id) return null;
  if (memory.has(id)) return memory.get(id);
  const file = taskPath(id);
  if (!fs.existsSync(file)) return null;
  const task = JSON.parse(fs.readFileSync(file, "utf8"));
  memory.set(id, task); return task;
}

function allTasks() {
  ensureTaskRoot();
  return fs.readdirSync(TASK_ROOT).filter(n => n.endsWith(".json"))
    .map(n => readTask(n.replace(/\.json$/, ""))).filter(Boolean);
}

function listTasks(limit = 50) {
  return allTasks().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, limit);
}

function family(rootId) {
  return allTasks().filter(t => t.id === rootId || t.rootTaskId === rootId || t.input?.rootTaskId === rootId);
}

function countFamily(rootId) { return family(rootId).length; }
function activeFamily(rootId) { return family(rootId).filter(t => ["queued", "running"].includes(t.status)); }
function childrenOf(parentId) { return allTasks().filter(t => t.parentTaskId === parentId || t.input?.parentTaskId === parentId); }

function event(task, message, extra = {}) {
  task.events.push({ at: now(), message, ...extra }); return saveTask(task);
}

function running(task) { task.status = "running"; return event(task, "Task started."); }
function complete(task, output) { task.status = "complete"; task.output = output; task.finishedAt = now(); return event(task, "Task completed."); }
function fail(task, error) { task.status = "failed"; task.error = error?.stack || error?.message || String(error); task.finishedAt = now(); return event(task, "Task failed."); }

function attachChild(parent, child) {
  parent.childTaskIds = Array.from(new Set([...(parent.childTaskIds || []), child.id]));
  parent.output = parent.output || {};
  parent.output.childTaskIds = Array.from(new Set([...(parent.output.childTaskIds || []), child.id]));
  return event(parent, "Child delegate spawned.", { childTaskId: child.id, childKind: child.input?.kind });
}

module.exports = { TASK_ROOT, activeFamily, allTasks, attachChild, childrenOf, complete, countFamily, createTask, event, fail, family, listTasks, readTask, running, saveTask };
