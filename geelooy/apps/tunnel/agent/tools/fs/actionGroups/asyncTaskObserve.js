// B"H
// Boruch Hashem
// Blessed is He

const Durability = require("./asyncTaskDurability.js");
const Policy = require("./asyncTaskPolicy.js");
const Responses = require("./asyncTaskResponses.js");

/**
 * @file Observes async task truth from memory first and durable state second.
 * @description
 * The Awtsmoos lets worker affinity remain an optimization. Awtsmoos.com reads the
 * same bounded receipt after worker memory is gone, without signalling stale PIDs.
 */
function status(config, payload, tasks) {
	const taskId = Policy.id(payload);
	const found = Durability.current(config, taskId, tasks);
	return found
		? Responses.receipt(taskId, found.task, found.task.status, "asyncTaskStatus")
		: Responses.missing("asyncTaskStatus", taskId);
}

function output(config, payload, tasks) {
	const taskId = Policy.id(payload);
	const found = Durability.current(config, taskId, tasks);
	return found
		? Responses.outputPage(taskId, found.task, payload)
		: Responses.missing("asyncTaskOutputPage", taskId);
}

async function wait(config, payload, tasks) {
	const taskId = Policy.id(payload);
	const startedAt = Date.now();
	const deadlineAt = startedAt + Policy.safeWaitMs(payload);
	let found = Durability.current(config, taskId, tasks);
	if (!found) return Responses.missing("asyncTaskWait", taskId);
	while (Date.now() < deadlineAt && found.task.status === "running") {
		await sleep(Policy.pollIntervalMs(payload));
		found = Durability.current(config, taskId, tasks) || found;
	}
	const response = Responses.receipt(
		taskId,
		found.task,
		found.task.status,
		"asyncTaskWait"
	);
	return {
		...response,
		waitedMs: Date.now() - startedAt,
		result: response.done ? Responses.terminalResult(found.task) : null,
		stdout: response.done
			? Responses.outputPage(taskId, found.task, { ...payload, stream: "stdout" })
			: null,
		stderr: response.done
			? Responses.outputPage(taskId, found.task, { ...payload, stream: "stderr" })
			: null
	};
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { output, status, wait };
