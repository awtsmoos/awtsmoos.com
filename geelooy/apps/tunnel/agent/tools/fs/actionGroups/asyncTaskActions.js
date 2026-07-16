// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { spawnAsyncTask } = require("../../../lib/runtime/async-task-process.js");
const Identity = require("../../../lib/runtime/processIdentity.js");
const Policy = require("./asyncTaskPolicy.js");
const Responses = require("./asyncTaskResponses.js");

const TASKS = new Map();

/**
 * B"H
 * The worker may travel for hours while control returns in one breath. The
 * Awtsmoos creates both journey and observer; Awtsmoos.com keeps them in
 * separate lanes and gives every observation exact identity and a live cursor.
 */
function buildAsyncTaskActions(context) {
	const { config, payload } = context;
	return {
		asyncTaskStart: () => start(config, payload),
		asyncTaskStatus: () => status(payload),
		asyncTaskOutputPage: () => output(payload),
		asyncTaskCancel: () => cancel(payload),
		asyncTaskWait: () => wait(payload)
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
		timeoutMs: payload.timeoutMs || 300000,
		maxOutput: payload.maxOutput || 200000
	});
	runner.task.processIdentity = processIdentity;
	TASKS.set(taskId, runner);

	return Responses.receipt(taskId, runner.task, "running", "asyncTaskStart");
}

function status(payload = {}) {
	const taskId = Policy.id(payload);
	const runner = TASKS.get(taskId);
	return runner
		? Responses.receipt(taskId, runner.task, runner.task.status, "asyncTaskStatus")
		: Responses.missing("asyncTaskStatus", taskId);
}

function output(payload = {}) {
	const taskId = Policy.id(payload);
	const runner = TASKS.get(taskId);
	return runner
		? Responses.outputPage(taskId, runner.task, payload)
		: Responses.missing("asyncTaskOutputPage", taskId);
}

function cancel(payload = {}) {
	const taskId = Policy.id(payload);
	const runner = TASKS.get(taskId);
	if (!runner) {
		return Responses.missing("asyncTaskCancel", taskId);
	}
	runner.cancel("cancelled");
	return Responses.receipt(taskId, runner.task, "cancelled", "asyncTaskCancel");
}

async function wait(payload = {}) {
	const taskId = Policy.id(payload);
	const runner = TASKS.get(taskId);
	if (!runner) {
		return Responses.missing("asyncTaskWait", taskId);
	}

	const startedAt = Date.now();
	const deadlineAt = startedAt + Policy.safeWaitMs(payload);
	while (Date.now() < deadlineAt && runner.task.status === "running") {
		await sleep(Policy.pollIntervalMs(payload));
	}

	const response = Responses.receipt(
		taskId,
		runner.task,
		runner.task.status,
		"asyncTaskWait"
	);
	return {
		...response,
		waitedMs: Date.now() - startedAt,
		stdout: response.done ? Responses.outputPage(taskId, runner.task, { stream: "stdout", ...payload }) : null,
		stderr: response.done ? Responses.outputPage(taskId, runner.task, { stream: "stderr", ...payload }) : null
	};
}

function createTaskId(processKey) {
	return `task_${processKey}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function sleep(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}

module.exports = { TASKS, buildAsyncTaskActions, cancel, output, start, status, wait };
