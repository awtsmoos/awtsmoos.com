// B"H
// Boruch Hashem
// Blessed is He

const Aliases = require("./aliases.js");
const Surface = require("./response-surface.js");

/**
	* @file Compacts responses without collapsing request and execution identity.
	* @description
	* The Awtsmoos reveals one deed through two names. Awtsmoos.com keeps both in
	* every compact receipt so asynchronous promotion stays truthful and compatible.
	*/
function compactTrust(input = {}, payload = {}) {
	const requestAction = text(
		input.requestAction ||
		input.requestedAction ||
		input.action ||
		"unknown"
	);
	const executionAction = text(
		input.executionAction ||
		input.servedByAction ||
		input.actualAction ||
		input.action ||
		requestAction
	);
	const promoted = requestAction !== executionAction;
	const full = clean({
		...input,
		ok: input.ok !== false,
		action: requestAction,
		requestAction,
		requestedAction: text(input.requestedAction) || requestAction,
		executionAction,
		actualAction: executionAction,
		actionPromoted: promoted,
		actionMismatch: promoted && !Aliases.allowed(requestAction, executionAction),
		summary: text(input.summary) || defaultSummary(input),
		next: text(input.next) || defaultNext(input),
		trust: plainTrust(input.trust),
		responseProtocol: input.responseProtocol || "response-v8-compact-trust"
	});
	return Surface.wantsDebug(payload, input)
		? full
		: Surface.publicEnvelope(full, payload, input);
}

function plainTrust(value) {
	if (typeof value === "string" && value.trim()) return value.trim();
	if (value && typeof value === "object") {
		return text(value.plainEnglish) || text(value.summary) ||
			"Receipt and action identity were preserved.";
	}
	return "Receipt and action identity were preserved.";
}

function defaultSummary(input = {}) {
	if (input.ok === false) return input.error ? `Action failed: ${input.error}.` : "Action failed.";
	if (input.status === "running") return "Started in isolated worker.";
	if (input.status === "completed") return "Command completed.";
	return "Action accepted.";
}

function defaultNext(input = {}) {
	if (input.nextAction) return `Call ${input.nextAction} next.`;
	if (input.waitPayload) return "Poll waitPayload or statusPayload.";
	return input.ok === false
		? "Inspect the error and retry with a narrower request."
		: "Continue with the next requested action.";
}

function text(value) {
	return value === undefined || value === null ? "" : String(value).trim();
}

function clean(object) {
	for (const key of Object.keys(object)) {
		if (object[key] === undefined || object[key] === "") delete object[key];
	}
	return object;
}

module.exports = { compactTrust };
