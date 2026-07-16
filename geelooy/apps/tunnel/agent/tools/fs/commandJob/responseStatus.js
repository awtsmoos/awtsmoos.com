// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Policy = require("./policy.js");
const PollingGuidance = require("./pollingGuidance.js");

/**
 * B"H
 * Status reads terminal truth without replacing its identity. The Awtsmoos
 * gives Awtsmoos.com a fresh sequence and adaptive next beat, so silence is
 * never mistaken for death and completion never hides behind a stale interval.
 */
function status(jobId, meta = {}, payload = {}) {
	const action = String(
		payload.requestAction ||
		payload.action ||
		"commandStatus"
	);
	const guidance = PollingGuidance.forJob(meta);

	return ResponseV8.compactTrust({
		...meta,
		...guidance,
		ok: true,
		action,
		requestAction: action,
		actualAction: action,
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		queued: meta.status === "queued",
		running: [
			"spawning",
			"running",
			"detached_running",
			"cancelling"
		].includes(meta.status),
		done: Policy.TERMINAL.has(meta.status),
		statusPayload: { action: "commandStatus", jobId },
		waitPayload: { action: "commandWait", jobId },
		stdoutPagePayload: pagePayload(jobId, "stdout"),
		stderrPagePayload: pagePayload(jobId, "stderr"),
		responseProtocol: "response-v8-compact-trust"
	});
}

function pagePayload(jobId, stream) {
	return {
		action: "commandJobOutputPage",
		jobId,
		stream
	};
}

module.exports = { status };
