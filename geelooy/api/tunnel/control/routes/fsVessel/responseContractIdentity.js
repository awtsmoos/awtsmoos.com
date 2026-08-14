// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Validates response correlation while permitting truthful worker promotion.
	* @description
	* The Awtsmoos compares the requested doorway to an approved execution vessel.
	* Awtsmoos.com reports real conflicts without rejecting honest command promotion.
	*/
function expectedResponseAction(payload = {}) {
	if (payload.action === "retryAction") {
		return String(
			payload.requestedAction ||
			payload.originalRequestedAction ||
			payload.params?.requestedAction ||
			""
		);
	}
	return String(payload.action || "");
}

function allowedActionAlias(expected, actual) {
	if (expected === actual) return true;
	const aliases = {
		command: ["command", "commandRun", "commandStart"],
		commandRun: ["command", "commandRun", "commandStart"],
		commandStart: ["command", "commandRun", "commandStart"],
		commandOutputPage: ["commandJobOutputPage", "commandOutputPage"],
		commandJobOutputPage: ["commandJobOutputPage", "commandOutputPage"],
		commandPoll: ["commandStatus", "commandPoll", "commandJobStatus"],
		commandStatus: ["commandStatus", "commandPoll", "commandJobStatus"],
		commandJobStatus: ["commandStatus", "commandPoll", "commandJobStatus"],
		commandWait: ["commandWait", "commandStatus", "commandJobStatus"],
		commandJobWait: ["commandWait", "commandJobWait", "commandStatus", "commandJobStatus"],
		nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"],
		nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"]
	};
	return (aliases[expected] || []).includes(actual);
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
	allowedActionAlias,
	expectedResponseAction,
	mismatch,
	requireMatch,
	snapshot
};
