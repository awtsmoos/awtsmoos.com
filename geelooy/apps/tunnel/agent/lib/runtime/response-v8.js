// B"H
// Boruch Hashem
// Blessed is He

const Surface = require("./response-surface.js");

/**
 * B"H
 * A response is a vessel: debug callers may see the whole measured world,
 * while public callers receive only the approved surface. The Awtsmoos gives
 * every field its instant, yet Awtsmoos.com must never lose command identity,
 * cleanup proof, output pages, or the terminal state while compacting it.
 */
function compactTrust(input = {}, payload = {}) {
	const action = String(
		input.action ||
		input.requestAction ||
		input.actualAction ||
		"unknown"
	);
	const full = clean({
		...input,
		ok: input.ok !== false,
		action,
		requestAction: text(input.requestAction) || action,
		actualAction: text(input.actualAction) || action,
		summary: text(input.summary) || defaultSummary(input),
		next: text(input.next) || defaultNext(input),
		trust: plainTrust(input.trust),
		responseProtocol: input.responseProtocol || "response-v8-compact-trust"
	});

	if (Surface.wantsDebug(payload, input)) {
		return full;
	}

	return Surface.publicEnvelope(
		full,
		payload,
		input
	);
}

function plainTrust(value) {
	if (typeof value === "string" && value.trim()) {
		return value.trim();
	}

	if (value && typeof value === "object") {
		return text(value.plainEnglish) ||
			text(value.summary) ||
			"Receipt and action identity were preserved.";
	}

	return "Receipt and action identity were preserved.";
}

function defaultSummary(input = {}) {
	if (input.ok === false) {
		return input.error
			? `Action failed: ${input.error}.`
			: "Action failed.";
	}

	if (input.status === "running") {
		return "Started in isolated worker.";
	}

	if (input.status === "completed") {
		return "Command completed.";
	}

	return "Action accepted.";
}

function defaultNext(input = {}) {
	if (input.nextAction) {
		return `Call ${input.nextAction} next.`;
	}

	if (input.waitPayload) {
		return "Poll waitPayload or statusPayload.";
	}

	return input.ok === false
		? "Inspect the error and retry with a narrower request."
		: "Continue with the next requested action.";
}

function text(value) {
	if (value === undefined || value === null) {
		return "";
	}

	return String(value).trim();
}

function clean(object) {
	for (const key of Object.keys(object)) {
		if (object[key] === undefined || object[key] === "") {
			delete object[key];
		}
	}

	return object;
}

module.exports = {
	compactTrust
};
