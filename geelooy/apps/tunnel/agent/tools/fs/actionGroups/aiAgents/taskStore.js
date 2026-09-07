// B"H
// Boruch Hashem
// Blessed is He

const Record = require("./taskStoreRecord.js");
const Relations = require("./taskStoreRelations.js");
const Storage = require("./taskStorage.js");

/**
 * @file Owns durable AI task creation, events, and namespace-scoped ledger transitions.
 * @description
 * The Awtsmoos remembers every delegate in one named vessel. Awtsmoos.com composes
 * atomic storage, lineage projections, and stale-generation fencing without one giant file.
 */
function createTask(input = {}) {
	const namespace = taskNamespace(input);
	const id = input.taskId || Record.makeTaskId(input.kind || "task");
	return Storage.withTaskLock(id, namespace, () => {
		const existing = Storage.readTask(id, namespace);
		if (existing) return existing;
		return Storage.writeTask(Record.newRecord(id, namespace, input));
	});
}

function saveTask(task) {
	const namespace = task.taskNamespace || taskNamespace(task.input || {});
	return Storage.withTaskLock(task.id, namespace, () => {
		const current = Storage.readTask(task.id, namespace);
		if (!Record.writeAllowed(current, task)) return current;
		Record.preserveFresherHeartbeat(current, task);
		task.taskNamespace = namespace;
		task.updatedAt = Record.now();
		return Storage.writeTask(task);
	});
}

function readTask(id, scope = null) {
	return Storage.readTask(id, scope ? taskNamespace(scope) : "");
}

function event(task, message, extra = {}) {
	task.events = Array.isArray(task.events) ? task.events : [];
	task.events.push({ at: Record.now(), message, ...extra });
	return saveTask(task);
}

function running(task) {
	task.status = "running";
	return event(task, "Task started.");
}

function complete(task, output) {
	task.status = "complete";
	task.output = output;
	task.finishedAt = Record.now();
	return event(task, "Task completed.");
}

function fail(task, error) {
	task.status = "failed";
	task.error = error?.stack || error?.message || String(error);
	task.finishedAt = Record.now();
	return event(task, "Task failed.");
}

function attachChild(parent, child) {
	parent.childTaskIds = [...new Set([...(parent.childTaskIds || []), child.id])];
	parent.output = parent.output || {};
	parent.output.childTaskIds = [...new Set([...(parent.output.childTaskIds || []), child.id])];
	return event(parent, "Child delegate spawned.", {
		childTaskId: child.id,
		childKind: child.input?.kind
	});
}

function taskNamespace(input = {}) {
	return Storage.taskNamespace(input);
}

module.exports = {
	TASK_ROOT: Storage.TASK_ROOT,
	...Relations,
	attachChild,
	complete,
	createTask,
	event,
	fail,
	readTask,
	running,
	saveTask,
	taskNamespace
};
