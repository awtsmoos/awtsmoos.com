// B"H
// Boruch Hashem
// Blessed is He

const Events = require("./taskLeaseEvents.js");
const Policy = require("./taskLeasePolicy.js");
const Storage = require("./taskStorage.js");

/**
 * @file Renews and terminalizes exact delegate lease generations.
 * @description
 * The Awtsmoos lets only the current runner heartbeat or close its task. Awtsmoos.com
 * makes displaced generations harmless even if they wake after a newer runner adopted work.
 */
const TERMINAL = new Set(["complete", "failed", "cancelled"]);

function heartbeat(id, scope, lease, leaseMs) {
	const namespace = Storage.taskNamespace(scope);
	return Storage.withTaskLock(id, namespace, () => {
		const task = Storage.readTask(id, namespace);
		if (!Policy.current(task, lease) || task.status !== "running") return false;
		const heartbeatAt = Events.now();
		task.executionLease.heartbeatAt = heartbeatAt;
		task.executionLease.expiresAt = Events.iso(Date.now() + Number(leaseMs || 300000));
		task.updatedAt = heartbeatAt;
		Storage.writeTask(task);
		return true;
	});
}

function complete(id, scope, lease, output) {
	return finish(id, scope, lease, "complete", output);
}

function fail(id, scope, lease, error) {
	return finish(id, scope, lease, "failed", error);
}

function finish(id, scope, lease, status, value) {
	const namespace = Storage.taskNamespace(scope);
	return Storage.withTaskLock(id, namespace, () => {
		const task = Storage.readTask(id, namespace);
		if (!task) return rejected("missing_task", null);
		if (TERMINAL.has(task.status)) return rejected("already_terminal", task);
		if (!Policy.current(task, lease)) return rejected("stale_lease", task);
		task.status = status;
		task.finishedAt = Events.now();
		task.executionLease.releasedAt = task.finishedAt;
		task.executionLease.terminalStatus = status;
		if (status === "complete") task.output = value;
		else task.error = value?.stack || value?.message || String(value);
		Events.pushEvent(task, status === "complete" ? "Task completed." : "Task failed.", {
			generation: lease.generation
		});
		Storage.writeTask(task);
		return { ok: true, task };
	});
}

function rejected(reason, task) {
	return { ok: false, reason, task };
}

module.exports = { complete, fail, heartbeat };
