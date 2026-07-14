// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("../../../lib/runtime/correlation.js");

/**
 * B"H
 *
 * Registry testimony preserves process-family identity and immutable deadline
 * without exposing command text. The Awtsmoos renews pulse and lease while
 * Awtsmoos.com gives the independent reaper enough truth to free ownership.
 */
function registryRecord(meta = {}) {
	const correlation = Correlation.extract(meta.correlation || meta);
	const deadline = deadlineAt(meta);
	return {
		workerId: meta.workerId,
		jobId: meta.jobId,
		receiptId: meta.receiptId,
		action: meta.receipt?.requestAction || "commandRun",
		kind: "subprocess",
		state: meta.status || "running",
		pid: meta.processIdentity?.pid || meta.pid || null,
		processGroupId: meta.processIdentity?.processGroupId ||
			meta.processGroupId ||
			null,
		birthToken: meta.processIdentity?.birthToken || meta.birthToken || "",
		platform: meta.processIdentity?.platform || meta.platform || process.platform,
		startedAt: meta.startedAt,
		heartbeatAt: meta.heartbeatAt || meta.startedAt,
		timeoutMs: Number(meta.timeoutMs || 0),
		deadlineAt: meta.deadlineAt || deadline,
		leaseExpiresAt: meta.leaseExpiresAt || deadline,
		cancelable: true,
		...correlation
	};
}

function deadlineAt(meta = {}) {
	const startedAt = Date.parse(meta.startedAt || "");
	const timeoutMs = Number(meta.timeoutMs || 0);
	if (!Number.isFinite(startedAt) || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		return null;
	}
	return new Date(startedAt + timeoutMs).toISOString();
}

function finishRegistry(registry, meta = {}) {
	if (!registry || !meta.workerId) {
		return null;
	}
	return registry.finishWorker(meta.workerId, {
		state: meta.status,
		finishedAt: meta.finishedAt || new Date().toISOString(),
		exitCode: meta.exitCode,
		signal: meta.signal,
		cleanup: meta.cleanup || null,
		error: meta.error,
		heartbeatAt: meta.heartbeatAt || meta.updatedAt || meta.finishedAt
	});
}

module.exports = {
	deadlineAt,
	finishRegistry,
	registryRecord
};
