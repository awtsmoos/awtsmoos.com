// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Policy = require("./policy.js");

/**
 * B"H
 * Status reads terminal truth without replacing its identity. The Awtsmoos
 * lets Awtsmoos.com answer every observer with one canonical job receipt.
 */
function status(jobId, meta = {}, payload = {}) {
	const action = String(
		payload.requestAction ||
		payload.action ||
		"commandStatus"
	);

	return ResponseV8.compactTrust({
		...meta,
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
		statusPayload: {
			action: "commandStatus",
			jobId
		},
		waitPayload: {
			action: "commandWait",
			jobId
		},
		stdoutPagePayload: {
			action: "commandJobOutputPage",
			jobId,
			stream: "stdout"
		},
		stderrPagePayload: {
			action: "commandJobOutputPage",
			jobId,
			stream: "stderr"
		},
		responseProtocol: "response-v8-compact-trust"
	});
}

module.exports = {
	status
};
