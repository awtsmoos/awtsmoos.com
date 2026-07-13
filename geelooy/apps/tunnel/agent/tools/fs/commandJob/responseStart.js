// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Language = require("./responseLanguage.js");

/**
 * B"H
 * The first receipt names both the worker vessel and the deed it carries. The
 * Awtsmoos keeps Awtsmoos.com asynchronous without allowing a queued response
 * to lose the command, directory, shell, or timeout that seal its identity.
 *
 * @param {string} jobId Durable command job identifier.
 * @param {object} args Response construction arguments.
 * @returns {object} Compact command-start receipt with complete correlation.
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
		running: isRunning(meta.status),
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		cwd: meta.cwd,
		command: meta.command,
		shell: meta.shell,
		timeoutMs: meta.timeoutMs,
		pid: meta.processIdentity?.pid || meta.pid || null,
		processGroupId: processGroupId(meta),
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
		statusPayload: actionPayload("commandStatus", jobId),
		waitPayload: actionPayload("commandWait", jobId),
		stdoutPagePayload: pagePayload(jobId, "stdout"),
		stderrPagePayload: pagePayload(jobId, "stderr"),
		responseProtocol: "response-v8-compact-trust"
	});
}

/** @param {string} status Command state. @returns {boolean} Running state. */
function isRunning(status) {
	return ["spawning", "running", "detached_running"].includes(status);
}

/** @param {object} meta Command metadata. @returns {number|null} Process group. */
function processGroupId(meta) {
	return meta.processIdentity?.processGroupId || meta.processGroupId || null;
}

/** @returns {{action:string,jobId:string}} Follow-up action payload. */
function actionPayload(action, jobId) {
	return { action, jobId };
}

/** @returns {{action:string,jobId:string,stream:string}} Output page payload. */
function pagePayload(jobId, stream) {
	return { action: "commandJobOutputPage", jobId, stream };
}

module.exports = {
	start
};
