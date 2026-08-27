// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Correlates Tunnel Control requests across truthful execution promotion.
 * @description
 * The Awtsmoos preserves the requested deed while Awtsmoos.com may move shell work
 * into a durable command worker. Approved aliases pass; unrelated deeds remain blocked.
 */
export function newClientRequestId(action = "request") {
	const clean = String(action || "request")
		.replace(/[^a-z0-9_-]+/gi, "-")
		.slice(0, 32) || "request";
	return `tc_${clean}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function attachRequestGuard(options = {}) {
	const action = options.action || "list";
	return {
		...options,
		clientRequestId: options.clientRequestId ||
			options.requestId ||
			newClientRequestId(action)
	};
}

export function validateResponseGuard(result = {}, expected = {}) {
	const errors = [];
	if (expected.clientRequestId &&
		result.type === "TUNNEL_RESPONSE" &&
		!result.clientRequestId) {
		errors.push(`clientRequestId expected ${expected.clientRequestId} but response omitted clientRequestId`);
	}
	if (expected.clientRequestId &&
		result.clientRequestId &&
		result.clientRequestId !== expected.clientRequestId) {
		errors.push(`clientRequestId expected ${expected.clientRequestId} got ${result.clientRequestId}`);
	}
	if (expected.action &&
		result.requestAction &&
		!allowedActionAlias(expected.action, result.requestAction)) {
		errors.push(`requestAction expected ${expected.action} got ${result.requestAction}`);
	}
	if (expected.jobId && result.jobId && result.jobId !== expected.jobId) {
		errors.push(`jobId expected ${expected.jobId} got ${result.jobId}`);
	}
	if (expected.stream && result.stream && result.stream !== expected.stream) {
		errors.push(`stream expected ${expected.stream} got ${result.stream}`);
	}
	return errors.length
		? {
			BH: "B\"H",
			ok: false,
			error: "tunnel_response_correlation_mismatch",
			expected,
			actual: snapshot(result),
			mismatchProof: errors,
			rawMismatchedResponse: result
		}
		: result;
}

function snapshot(result = {}) {
	return {
		action: result.action,
		requestAction: result.requestAction,
		executionAction: result.executionAction,
		actualAction: result.actualAction,
		actionPromoted: result.actionPromoted,
		clientRequestId: result.clientRequestId,
		controlRequestId: result.controlRequestId,
		jobId: result.jobId,
		stream: result.stream,
		path: result.path,
		absolutePath: result.absolutePath
	};
}

function allowedActionAlias(expected, actual) {
	if (expected === actual) return true;
	const commandActions = ["command", "commandRun", "commandStart"];
	const aliases = {
		shellCommand: commandActions,
		command: commandActions,
		commandRun: commandActions,
		commandStart: commandActions,
		commandWait: ["commandWait", "commandStatus", "commandJobStatus"],
		commandJobWait: ["commandWait", "commandJobWait", "commandStatus", "commandJobStatus"],
		commandJobOutputPage: ["commandJobOutputPage", "commandOutputPage"],
		commandStatus: ["commandStatus", "commandPoll", "commandJobStatus"],
		nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"],
		nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"]
	};
	return (aliases[expected] || []).includes(actual);
}

export { allowedActionAlias };
