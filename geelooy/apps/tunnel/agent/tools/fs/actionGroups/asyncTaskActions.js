// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { spawnAsyncTask } = require("../../../lib/runtime/async-task-process.js");
const Identity = require("../../../lib/runtime/processIdentity.js");
const Durability = require("./asyncTaskDurability.js");
const Observe = require("./asyncTaskObserve.js");
const Policy = require("./asyncTaskPolicy.js");
const Responses = require("./asyncTaskResponses.js");

const TASKS = new Map();

/**
 * @file Starts and controls async subprocesses while durable observers survive workers.
 * @description
 * The Awtsmoos lets one worker hold the living process but never the only testimony.
 * Awtsmoos.com persists lifecycle/output outside project hashes before returning receipt.
 */
function buildAsyncTaskActions(context) {
	const { config, payload } = context;
	return {
		asyncTaskStart: () => start(config, payload),
		asyncTaskStatus: () => Observe.status(config, payload, TASKS),
		asyncTaskOutputPage: () => Observe.output(config, payload, TASKS),
		asyncTaskCancel: () => cancel(config, payload),
		asyncTaskWait: () => Observe.wait(config, payload, TASKS)
	};
}

async function start(config = {}, payload = {}) {
	if (!Policy.allowed(config, payload)) {
		return { ok: false, action: "asyncTaskStart", error: "commands_disabled" };
	}
	const command = String(payload.command || process.execPath);
	const args = Array.isArray(payload.args)
		? payload.args.map(String)
		: Policy.argsFromPayload(payload);
	const processIdentity = payload.processIdentity || Identity.fromPayload(payload);
	const taskId = payload.taskId || createTaskId(processIdentity.processKey);
	const runner = spawnAsyncTask({
		command,
		args,
		cwd: payload.cwd || config.root || process.cwd(),
		env: { ...(payload.env || {}), ...Identity.env(processIdentity) },
		maxOutput: payload.maxOutput || 200000,
		onUpdate: Durability.observer(config, taskId),
		timeoutMs: payload.timeoutMs || 300000
	});
	runner.task.processIdentity = processIdentity;
	Durability.persist(config, taskId, runner.task);
	TASKS.set(taskId, runner);
	return Responses.receipt(taskId, runner.task, "running", "asyncTaskStart");
}

function cancel(config = {}, payload = {}) {
	const taskId = Policy.id(payload);
	const found = Durability.current(config, taskId, TASKS);
	if (!found) return Responses.missing("asyncTaskCancel", taskId);
	if (!found.live) {
		if (Durability.terminal(found.task)) {
			return Responses.receipt(taskId, found.task, found.task.status, "asyncTaskCancel");
		}
		return {
			ok: false,
			action: "asyncTaskCancel",
			error: "task_owner_unavailable",
			taskId,
			status: found.task.status
		};
	}
	found.runner.cancel("cancelled");
	Durability.persist(config, taskId, found.runner.task);
	return Responses.receipt(taskId, found.runner.task, "cancelled", "asyncTaskCancel");
}

function createTaskId(processKey) {
	return `task_${processKey}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

module.exports = {
	TASKS,
	buildAsyncTaskActions,
	cancel,
	output: (payload, config = {}) => Observe.output(config, payload, TASKS),
	start,
	status: (payload, config = {}) => Observe.status(config, payload, TASKS),
	wait: (payload, config = {}) => Observe.wait(config, payload, TASKS)
};
