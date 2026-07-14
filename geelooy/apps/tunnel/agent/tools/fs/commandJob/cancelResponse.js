// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Deadline = require("./promiseDeadline.js");

/**
 * B"H
 *
 * Cancellation responses remain available even when durable metadata is slow.
 * The Awtsmoos renews status and witness; Awtsmoos.com bounds storage reads and
 * renders one stable response shape for live, queued, stored, and missing jobs.
 */
async function boundedMeta(config, jobId) {
	const outcome = await Deadline.settle(
		() => Context.Meta.read(config, jobId),
		1000,
		"cancel_status_read"
	);
	return outcome.ok
		? outcome.value
		: null;
}

function terminalCancel(payload, jobId, meta, extra = {}) {
	const response = Context.Responses.status(jobId, meta, {
		...payload,
		action: "commandCancel",
		requestAction: payload.requestAction ||
			payload.action ||
			"commandCancel",
		actualAction: "commandCancel"
	});
	return Context.named(payload, "commandCancel", {
		...response,
		...extra,
		jobId,
		status: meta.status
	});
}

function missing(payload, jobId) {
	return Context.named(payload, "commandCancel", {
		ok: true,
		jobId,
		cancelled: false,
		status: "missing"
	});
}

function invalid(payload) {
	return Context.named(payload, "commandCancel", {
		ok: false,
		error: "missing_jobId"
	});
}

module.exports = {
	boundedMeta,
	invalid,
	missing,
	terminalCancel
};
