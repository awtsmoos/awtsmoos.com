// B"H
// Boruch Hashem
// Blessed is He

const Values = require("./values.js");

async function invokeAction(step, context, runAction) {
	const action = step.action || step.type || step.call;
	if (!action) {
		return { ok: true, skipped: true, reason: "missing_action" };
	}
	const inline = { ...step };
	for (const key of controlKeys()) {
		delete inline[key];
	}
	const payload = await Values.resolvePayload({
		...inline,
		...(step.payload || step.with || {}),
		action
	}, context, runAction);
	return runAction(payload);
}

function resultError(result) {
	const detail = result?.error;
	const message = typeof detail === "string"
		? detail
		: detail?.message || result?.message || "action_failed";
	const error = new Error(message);
	error.result = result || null;
	return error;
}

function stepDelay(step) {
	if (step.delayMs !== undefined) return Number(step.delayMs || 0);
	if (step.waitMs !== undefined) return Number(step.waitMs || 0);
	return Number(step.delaySeconds || 0) * 1000;
}

function sleep(milliseconds) {
	return milliseconds > 0
		? new Promise((resolve) => setTimeout(resolve, milliseconds))
		: Promise.resolve();
}

function controlKeys() {
	return [
		"action", "type", "call", "payload", "with", "then", "onError",
		"retry", "retries", "saveAs", "id", "name", "if", "when",
		"condition", "parallel", "forEach", "until", "while", "assert",
		"do", "else", "delayMs", "waitMs", "delaySeconds"
	];
}

module.exports = {
	invokeAction,
	resultError,
	sleep,
	stepDelay
};
