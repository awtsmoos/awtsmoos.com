// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Language = require("./responseLanguage.js");

/**
	* @file Returns a complete command-start continuation receipt.
	* @description
	* The Awtsmoos keeps request, execution, root, cwd, worker, and job together.
	* Awtsmoos.com therefore needs no hidden session state to continue observing it.
	*/
function start(jobId, args = {}) {
	const meta = args.meta || {};
	const requestAction = meta.receipt?.requestAction || "commandStart";
	return ResponseV8.compactTrust({
		ok: true,
		action: requestAction,
		requestAction,
		executionAction: "commandStart",
		actualAction: "commandStart",
		status: meta.status || "running",
		queued: meta.status === "queued",
		running: isRunning(meta.status),
		jobId,
		workerId: meta.workerId,
		receiptId: meta.receiptId,
		projectRoot: meta.projectRoot,
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

function isRunning(status) {
	return ["spawning", "running", "detached_running"].includes(status);
}

function processGroupId(meta) {
	return meta.processIdentity?.processGroupId || meta.processGroupId || null;
}

function actionPayload(action, jobId) {
	return { action, jobId };
}

function pagePayload(jobId, stream) {
	return { action: "commandJobOutputPage", jobId, stream };
}

module.exports = { start };
