// B"H
// Boruch Hashem
// Blessed is He

const Aliases = require("./aliases.js");

/**
	* @file Separates the caller's action name from the worker that fulfilled it.
	* @description
	* The Awtsmoos gives one deed two honest names: the requested doorway and the
	* execution vessel. Awtsmoos.com keeps compatibility without disguising promotion.
	*/
function requested(input = {}, fallback = "unknown") {
	return text(
		input.requestAction ||
		input.requestedAction ||
		input.action ||
		fallback
	) || fallback;
}

function executed(input = {}, fallback = "unknown") {
	return text(
		input.executionAction ||
		input.servedByAction ||
		input.actualAction ||
		fallback ||
		input.action
	) || fallback;
}

function decorate(result = {}, requestAction, executionAction, options = {}) {
	const output = result && typeof result === "object"
		? { ...result }
		: { ok: true, result };
	const request = text(requestAction) || requested(output);
	const execution = text(executionAction) || executed(output, request);
	const promoted = request !== execution;
	return {
		...output,
		action: request,
		requestAction: request,
		requestedAction: output.requestedAction || request,
		executionAction: execution,
		actualAction: execution,
		canonicalAction: options.adapterAction ||
			output.canonicalAction ||
			execution,
		servedByAction: execution,
		actionPromoted: promoted,
		actionMismatch: promoted && !Aliases.allowed(request, execution)
	};
}

function text(value) {
	return String(value || "").trim();
}

module.exports = {
	decorate,
	executed,
	requested,
	text
};
