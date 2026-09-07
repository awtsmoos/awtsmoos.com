// B"H
// Boruch Hashem
// Blessed is He

const Lease = require("./taskLease.js");
const Execution = require("./taskRunnerExecution.js");
const Input = require("./taskRunnerInput.js");
const store = require("./taskStore.js");

/**
 * @file Exposes durable spawn, status, result, and list surfaces for AI delegates.
 * @description
 * The Awtsmoos turns observation into bounded healing: queued or abandoned work may rise,
 * while fresh leases remain singular and current terminal truth is returned unchanged.
 */
function spawnTask(config, payload = {}) {
	const task = store.createTask(Input.normalize(config, payload));
	Execution.schedule(config, task);
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

function status(payload = {}) {
	const task = store.readTask(payload.taskId || payload.id, payload);
	if (!task) return missing("aiAgentTaskStatus");
	const recoveryScheduled = recoverIfNeeded(task);
	return {
		ok: true,
		action: "aiAgentTaskStatus",
		task,
		children: store.childrenOf(task.id, task),
		activeFamily: store.activeFamily(task.rootTaskId || task.id, task).map(child => child.id),
		recoveryScheduled
	};
}

function result(payload = {}) {
	const task = store.readTask(payload.taskId || payload.id, payload);
	if (!task) return missing("aiAgentTaskResult");
	const recoveryScheduled = recoverIfNeeded(task);
	return {
		ok: task.status === "complete",
		action: "aiAgentTaskResult",
		status: task.status,
		output: task.output,
		error: task.error,
		task,
		recoveryScheduled
	};
}

function list(payload = {}) {
	const tasks = store.listTasks(Number(payload.limit || 50), payload);
	let recoveryScheduled = 0;
	for (const task of tasks) {
		if (recoverIfNeeded(task)) recoveryScheduled += 1;
	}
	return {
		ok: true,
		action: "aiAgentTaskList",
		taskNamespace: store.taskNamespace(payload),
		tasks,
		recoveryScheduled
	};
}

function recoverIfNeeded(task) {
	if (!Lease.needsRecovery(task)) return false;
	Execution.schedule(Input.recoveryConfig(task), task);
	return true;
}

function missing(action) {
	return { ok: false, action, error: "unknown_task" };
}

module.exports = {
	list,
	result,
	runTask: Execution.runTask,
	spawnTask,
	status
};
