// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Language = require("./responseLanguage.js");

/**
 * B"H
 * The first receipt names the process family before control returns. The
 * Awtsmoos keeps Awtsmoos.com asynchronous without losing caller identity.
 */
function start(jobId, args = {}) {
	const meta = args.meta || {};
	const requestAction = meta.receipt?.requestAction || "commandStart";

	return ResponseV8.compactTrust({
		ok: true,
		action: "commandStart",
		requestAction,
		actualAction: "commandStart",
		actionMismatch: requestAction !== "commandStart",
		status: meta.status || "running",
		queued: meta.status === "queued",
		running: [
			"spawning",
			"running",
			"detached_running"
		].includes(meta.status),
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		pid: meta.processIdentity?.pid || meta.pid || null,
		processGroupId: meta.processIdentity?.processGroupId ||
			meta.processGroupId ||
			null,
		birthToken: meta.processIdentity?.birthToken || meta.birthToken || "",
		processIdentity: meta.processIdentity || null,
		worker: meta.worker,
		receipt: meta.receipt,
		storage: args.storage || meta.storage,
		queue: meta.queue || null,
		idempotencyKey: meta.idempotencyKey || undefined,
		mode: "async_job",
		summary: Language.startSummary(requestAction),
		next: Language.startNext(jobId),
		trust: Language.startTrust(),
		evidence: Language.startEvidence(),
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
	start
};
