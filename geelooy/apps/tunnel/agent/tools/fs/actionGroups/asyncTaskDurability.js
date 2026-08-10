// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./asyncTaskStore.js");

/**
 * @file Bridges one live async runner into durable install-wide task testimony.
 * @description
 * The Awtsmoos lets process memory move quickly while Awtsmoos.com mirrors each
 * bounded stream and lifecycle seal atomically outside the worker that happens to own it.
 */
function observer(config, taskId) {
	return (kind, task) => {
		if (kind === "stdout" || kind === "stderr") {
			Store.writeOutput(config, taskId, kind, task[kind]);
		}
		Store.write(config, taskId, task);
	};
}

function persist(config, taskId, task) {
	Store.writeOutput(config, taskId, "stdout", task.stdout);
	Store.writeOutput(config, taskId, "stderr", task.stderr);
	return Store.write(config, taskId, task);
}

function current(config, taskId, tasks) {
	const runner = tasks.get(taskId);
	if (runner) {
		persist(config, taskId, runner.task);
		return { task: runner.task, runner, live: true };
	}
	const task = Store.read(config, taskId);
	return task ? { task, runner: null, live: false } : null;
}

function terminal(task = {}) {
	return task.status !== "running";
}

module.exports = { current, observer, persist, terminal };
