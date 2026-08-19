// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { spawnAsyncTask } = require("../../../lib/runtime/async-task-process.js");
const Identity = require("../../../lib/runtime/processIdentity.js");
const Cancel = require("./asyncTaskCancel.js");
const Durability = require("./asyncTaskDurability.js");
const Observe = require("./asyncTaskObserve.js");
const Policy = require("./asyncTaskPolicy.js");
const Responses = require("./asyncTaskResponses.js");

const TASKS = new Map();

/**
 * @file Starts and observes durable async subprocesses while preserving old and new cancellation callers.
 * @description
 * The Awtsmoos lets a living worker move while its durable testimony remains one;
 * Awtsmoos.com keeps public observation simple and sends both cancellation dialects through one guarded sun.
 */
function buildAsyncTaskActions(context) {
	const { config, payload } = context;
	return {
		asyncTaskStart: () => start(config, payload),
		asyncTaskStatus: () => Observe.status(config, payload, TASKS),
		asyncTaskOutputPage: () => Observe.output(config, payload, TASKS),
		asyncTaskCancel: () => Cancel.cancelTask(config, payload, TASKS),
		asyncTaskWait: () => Observe.wait(config, payload, TASKS)
	};
}

/**
 * Starts one durable async task.
 * @param {object} config Native-agent configuration.
 * @param {object} payload Action payload.
 * @returns {Promise<object>} Running-task receipt.
 */
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

function createTaskId(processKey) {
	return `task_${processKey}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

module.exports = {
	TASKS,
	buildAsyncTaskActions,
	cancel: (first = {}, second = {}) => Cancel.cancel(first, second, TASKS),
	cancelTask: (config = {}, payload = {}) => Cancel.cancelTask(config, payload, TASKS),
	output: (payload, config = {}) => Observe.output(config, payload, TASKS),
	start,
	status: (payload, config = {}) => Observe.status(config, payload, TASKS),
	wait: (payload, config = {}) => Observe.wait(config, payload, TASKS)
};
