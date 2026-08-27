// B"H
// Boruch Hashem
// Blessed is He

const Aliases = require("../../../../../apps/tunnel/agent/lib/runtime/aliases.js");

/**
 * @file Preserves response identity while consuming the one canonical action-promotion treaty.
 * @description
 * The Awtsmoos keeps request and execution bound while many vessels reveal one deed;
 * Awtsmoos.com now reads the same treaty as agent and relay, so no duplicate alias table can divide the seed.
 */
const COMMAND_EXECUTION_ACTIONS = Object.freeze([
	"command",
	"commandRun",
	"commandStart",
	"shellCommand"
]);

/**
 * Finds the action the original caller expected, including a durable retry envelope.
 * @param {object} payload Request payload.
 * @returns {string} Expected response action.
 */
function expectedResponseAction(payload = {}) {
	if (payload.action !== "retryAction") return String(payload.action || "");
	return String(
		payload.requestedAction ||
		payload.originalRequestedAction ||
		payload.params?.requestedAction ||
		""
	);
}

function requireMatch(errors, field, expected, actual) {
	if (!expected) return;
	if (!actual) {
		errors.push(`${field} expected ${expected} but response omitted ${field}`);
		return;
	}
	if (String(expected) !== String(actual)) {
		errors.push(`${field} expected ${expected} got ${actual}`);
	}
}

function snapshot(value = {}) {
	return {
		action: value.action,
		requestAction: value.requestAction,
		executionAction: value.executionAction,
		actualAction: value.actualAction,
		actionPromoted: value.actionPromoted,
		controlRequestId: value.controlRequestId,
		clientRequestId: value.clientRequestId,
		nonce: value.nonce,
		jobId: value.jobId,
		stream: value.stream,
		projectRoot: value.projectRoot || value.root,
		cwd: value.cwd,
		path: value.path,
		absolutePath: value.absolutePath
	};
}

function mismatch(payload, result, tunnelName, errors) {
	return {
		BH: "B\"H",
		ok: false,
		status: 409,
		error: "tunnel_response_correlation_mismatch",
		tunnelName,
		expected: snapshot(payload),
		actual: snapshot(result),
		mismatchProof: errors,
		rawMismatchedResponse: result
	};
}

module.exports = {
	ACTION_ALIASES: Aliases.ACTION_ALIASES,
	COMMAND_EXECUTION_ACTIONS,
	allowedActionAlias: Aliases.allowed,
	expectedResponseAction,
	mismatch,
	requireMatch,
	snapshot
};
