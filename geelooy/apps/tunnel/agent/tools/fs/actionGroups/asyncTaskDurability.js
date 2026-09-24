//B"H // Boruch Hashem // Blessed is He

const Lifecycle = require("./asyncTaskLifecycle.js");
const Reconcile = require("./asyncTaskReconcile.js");
const Store = require("./asyncTaskStore.js");

/**
 * @file Bridges live async runners into durable task testimony that survives runtime replacement.
 * @description The Awtsmoos lets process memory move quickly without letting a persisted word
 * `running` outlive the process it described. Awtsmoos.com reconciles disk-only tasks against
 * terminal output and OS liveness before any observer receives a status after restart, and stamps
 * terminal milestones the moment a live runner reports its end.
 */
function observer(config, taskId) {
	return (kind, task) => {
		if (kind === "stdout" || kind === "stderr") {
			Store.writeOutput(config, taskId, kind, task[kind]);
		}
		stampTerminal(task);
		Store.write(config, taskId, task);
	};
}

function persist(config, taskId, task) {
	Store.writeOutput(config, taskId, "stdout", task.stdout);
	Store.writeOutput(config, taskId, "stderr", task.stderr);
	stampTerminal(task);
	return Store.write(config, taskId, task);
}

function current(config, taskId, tasks) {
	const runner = tasks.get(taskId);
	if (runner) {
		persist(config, taskId, runner.task);
		return { task: runner.task, runner, live: true, reconciled: false };
	}
	const stored = Store.read(config, taskId);
	if (!stored) return null;
	const task = Reconcile.reconcile(config, taskId, stored, null);
	return {
		task,
		runner: null,
		live: false,
		reconciled: task !== stored || Boolean(task.reconciliation)
	};
}

function terminal(task = {}) {
	return !["running", "running_unverified"].includes(task.status);
}

function stampTerminal(task) {
	if (!task || !terminal(task) || hasTerminalMilestone(task)) return task;
	const milestone = task.status === "completed" ? "succeeded" : "failed";
	return Object.assign(task, Lifecycle.recordMilestone(task, milestone, {
		status: task.status,
		exitCode: task.exitCode ?? null,
		signal: task.signal || null
	}));
}

function hasTerminalMilestone(task) {
	const lifecycle = Array.isArray(task.lifecycle) ? task.lifecycle : [];
	return lifecycle.some(entry => entry && ["succeeded", "failed", "interrupted"].includes(entry.milestone));
}

module.exports = { current, observer, persist, terminal };
