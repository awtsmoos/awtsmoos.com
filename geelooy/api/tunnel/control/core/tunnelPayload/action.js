// B"H
// Boruch Hashem
// Blessed is He

function valid(value) {
	return typeof value === "string" &&
		/^[A-Za-z][A-Za-z0-9]*$/.test(value);
}

function kind(action) {
	const text = String(action || "");

	if (text.startsWith("chrome")) {
		return "chrome";
	}

	if (
		text.startsWith("command") ||
		text === "command" ||
		text === "nodeScriptRun"
	) {
		return "command";
	}

	return "fs";
}

function carrier(params = {}, params64 = {}) {
	return params.intendedAction ||
		params.expectedAction ||
		params.action ||
		params64.intendedAction ||
		params64.expectedAction ||
		params64.action ||
		"";
}

function hasCommandIntent(raw = {}) {
	return Boolean(
		raw.command ||
		raw.command64 ||
		raw.script ||
		raw.scriptText ||
		raw.script64
	);
}

function inferred(raw = {}) {
	if (hasCommandIntent(raw)) {
		return "commandRun";
	}

	if (raw.jobId || raw.id || raw.job || raw.taskId) {
		return raw.stream
			? "commandJobOutputPage"
			: "commandStatus";
	}

	return "";
}

function effectiveOriginal(originalAction, raw) {
	if (
		originalAction === "configGet" &&
		hasCommandIntent(raw)
	) {
		return "";
	}

	return originalAction;
}

function select(carriers = {}) {
	const original = carriers.body.action ||
		carriers.query.action ||
		"";
	const fallback = carrier(
		carriers.params,
		carriers.params64
	);
	const inferredAction = inferred(carriers.raw);
	const outer = effectiveOriginal(
		original,
		carriers.raw
	);
	const action = valid(outer)
		? outer
		: valid(fallback)
			? fallback
			: inferredAction;

	return {
		action,
		original,
		recovered: Boolean(
			!valid(outer) &&
			(valid(fallback) || inferredAction)
		)
	};
}

module.exports = {
	hasCommandIntent,
	kind,
	select,
	valid
};
