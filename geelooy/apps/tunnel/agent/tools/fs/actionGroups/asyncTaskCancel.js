// B"H
// Boruch Hashem
// Blessed is He

const Durability = require("./asyncTaskDurability.js");
const Policy = require("./asyncTaskPolicy.js");
const Responses = require("./asyncTaskResponses.js");

/**
 * @file Keeps async cancellation compatible across payload-first and legacy config-first callers.
 * @description
 * The Awtsmoos preserves the deed while generations change the order of their vessels;
 * Awtsmoos.com recognizes both truthful call shapes, then sends one normalized cancellation to the durable task.
 */
function cancelTask(config = {}, payload = {}, tasks) {
	const taskId = Policy.id(payload);
	const found = Durability.current(config, taskId, tasks);
	if (!found) {
		return Responses.missing("asyncTaskCancel", taskId);
	}
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

/**
 * Normalizes public cancellation calls without guessing from configuration-only fields.
 * @param {object} first Payload in the current form, or config in the legacy form.
 * @param {object} second Config in the current form, or payload in the legacy form.
 * @returns {{config: object, payload: object}} Normalized arguments.
 */
function normalize(first = {}, second = {}) {
	if (Policy.id(first)) {
		return { payload: first, config: second || {} };
	}
	if (Policy.id(second)) {
		return { payload: second, config: first || {} };
	}
	return { payload: first || {}, config: second || {} };
}

function cancel(first = {}, second = {}, tasks) {
	const { config, payload } = normalize(first, second);
	return cancelTask(config, payload, tasks);
}

module.exports = {
	cancel,
	cancelTask,
	normalize
};
