// B"H
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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
function ensureTaskRoot(namespace = "") { fs.mkdirSync(taskRoot(namespace), { recursive: true }); }
function taskRoot(namespace = "") { return namespace ? path.join(TASK_ROOT, safeName(namespace)) : TASK_ROOT; }
function taskPath(id, namespace = "") { return path.join(taskRoot(namespace), id + ".json"); }
function now() { return new Date().toISOString(); }
function makeTaskId(prefix = "task") {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function createTask(input = {}) {
  const namespace = taskNamespace(input);
  ensureTaskRoot(namespace);
  const id = input.taskId || makeTaskId(input.kind || "task");
  return saveTask({
    id, ok: true, status: "queued", input, taskNamespace: namespace,
    parentTaskId: input.parentTaskId || null,
    rootTaskId: input.rootTaskId || input.taskId || id,
    childTaskIds: [], events: [], output: null, error: null,
    createdAt: now(), updatedAt: now(), finishedAt: null
  });
}

function saveTask(task) {
  const namespace = task.taskNamespace || taskNamespace(task.input || {});
  task.taskNamespace = namespace;
  ensureTaskRoot(namespace); task.updatedAt = now();
  fs.writeFileSync(taskPath(task.id, namespace), JSON.stringify(task, null, 2), "utf8");
  memory.set(memoryKey(namespace, task.id), task); return task;
}

function readTask(id, scope = null) {
  if (!id) return null;
  const namespace = scope ? taskNamespace(scope) : "";
  if (namespace && memory.has(memoryKey(namespace, id))) return memory.get(memoryKey(namespace, id));
  if (!namespace) {
    for (const [key, task] of memory.entries()) if (key.endsWith(":" + id)) return task;
  }
  const file = namespace ? taskPath(id, namespace) : findTaskPath(id);
  if (!fs.existsSync(file)) return null;
  const task = JSON.parse(fs.readFileSync(file, "utf8"));
  memory.set(memoryKey(task.taskNamespace || namespace || taskNamespace(task.input || {}), task.id), task); return task;
}

function allTasks(scope = null) {
  const namespace = scope ? taskNamespace(scope) : "";
  ensureTaskRoot(namespace);
  return taskFiles(namespace).map(file => {
    try {
      const task = JSON.parse(fs.readFileSync(file, "utf8"));
      memory.set(memoryKey(task.taskNamespace || namespace || taskNamespace(task.input || {}), task.id), task);
      return task;
    } catch (_) {
      return null;
    }
  }).filter(Boolean);
}

function listTasks(limit = 50, scope = null) {
  return allTasks(scope).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, limit);
}

function family(rootId, scope = null) {
  return allTasks(scope).filter(t => t.id === rootId || t.rootTaskId === rootId || t.input?.rootTaskId === rootId);
}

function countFamily(rootId, scope = null) { return family(rootId, scope).length; }
function activeFamily(rootId, scope = null) { return family(rootId, scope).filter(t => ["queued", "running"].includes(t.status)); }
function childrenOf(parentId, scope = null) { return allTasks(scope).filter(t => t.parentTaskId === parentId || t.input?.parentTaskId === parentId); }

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

function taskNamespace(input = {}) {
  const explicit = input.taskNamespace || input.agentTaskNamespace;
  if (explicit) return safeName(explicit);
  const projectRoot = input.projectRoot || input.root || "";
  const tunnelName = input.tunnelName || "";
  const logicalAgentId = input.logicalAgentId || "";
  const basis = [projectRoot, tunnelName, logicalAgentId].filter(Boolean).join("\0") || "default";
  return "ns_" + crypto.createHash("sha256").update(basis).digest("hex").slice(0, 24);
}
function safeName(value) {
  const clean = String(value || "").trim().replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return clean.slice(0, 80) || "default";
}
function memoryKey(namespace, id) { return `${namespace || "legacy"}:${id}`; }
function taskFiles(namespace = "") {
  const root = taskRoot(namespace);
  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .flatMap(item => {
        const full = path.join(root, item.name);
        if (item.isFile() && item.name.endsWith(".json")) return [full];
        if (!namespace && item.isDirectory()) return taskFiles(item.name);
        return [];
      });
  } catch (_) {
    return [];
  }
}
function findTaskPath(id) {
  return taskFiles("").find(file => path.basename(file) === id + ".json") || taskPath(id);
}

module.exports = { TASK_ROOT, activeFamily, allTasks, attachChild, childrenOf, complete, countFamily, createTask, event, fail, family, listTasks, readTask, running, saveTask, taskNamespace };
