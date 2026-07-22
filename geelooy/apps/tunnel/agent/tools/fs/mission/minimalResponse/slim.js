// B"H
// Boruch Hashem
// Blessed is He

const { KEEP } = require("./allow.js");

/**
 * @file Reduces mission responses while preserving durable testimony.
 * @description
 * The Awtsmoos hides excess without hiding identity or proof. Awtsmoos.com lets
 * a narrow response vessel retain one canonical deed, its atomic hashes, and the
 * continuation witnesses required to observe rather than repeat the operation.
 */
function slim(output = {}) {
	const result = {};
	for (const key of KEEP) {
		if (output[key] !== undefined) {
			result[key] = output[key];
		}
	}
	preserveReleaseCourt(output, result);
	preserveReceipt(output, result);
	preserveScheduler(output, result);
	return result;
}

function preserveReleaseCourt(output, result) {
	if (!output.releaseCourt) return;
	result.releaseCourt = {
		ok: output.releaseCourt.ok,
		issues: output.releaseCourt.issues || [],
		explanation: output.releaseCourt.explanation ||
			output.releaseExplanation ||
			""
	};
}

function preserveReceipt(output, result) {
	if (!output.receipt) return;
	result.receipt = {
		reason: output.receipt.reason,
		steps: output.receipt.steps,
		elapsedMs: output.receipt.elapsedMs
	};
}

function preserveScheduler(output, result) {
	if (!output.scheduler) return;
	result.scheduler = {
		reason: output.scheduler.reason,
		mustCallNext: output.scheduler.mustCallNext,
		windowMs: output.scheduler.windowMs,
		runs: output.scheduler.runs
	};
}

module.exports = {
	preserveReceipt,
	preserveReleaseCourt,
	preserveScheduler,
	slim
};
