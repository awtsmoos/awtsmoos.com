// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("../../../lib/runtime/correlation.js");
const Identity = require("./processIdentity.js");
const { getGlobalRegistry } = require("../../../lib/runtime/worker-supervisor.js");

/**
 * @file Bridges durable command testimony to the global worker registry.
 * @description
 * The Awtsmoos renews pulse, lease, and process-family identity as one truth.
 * Awtsmoos.com also asks this bridge whether current memory already owns an
 * exact command, so startup reconciliation never appoints a rival finisher.
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
		processGroupId: meta.processIdentity?.processGroupId || meta.processGroupId || null,
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

function inspectOwnership(record = {}, options = {}) {
	if (record.currentRoot !== true) return ownership(false, "not_current_root");
	const meta = record.meta || {};
	const workerId = String(meta.workerId || "").trim();
	if (!workerId) return ownership(false, "worker_id_missing");
	const registry = options.registry || getGlobalRegistry();
	const active = registry.getWorker(workerId);
	if (!active) return ownership(false, "worker_not_registered", { workerId });
	const expected = Identity.fromMeta(meta);
	const observed = { ...active, alive: true };
	const comparison = Identity.compare(expected, observed);
	if (!comparison.ok) {
		return ownership(false, "worker_registry_identity_mismatch", {
			workerId,
			active,
			comparison
		});
	}
	return ownership(true, "worker_registry_exact", {
		workerId,
		active,
		comparison
	});
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
	if (!registry || !meta.workerId) return null;
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

function ownership(owned, reason, extra = {}) {
	return { owned, reason, ...extra };
}

module.exports = {
	deadlineAt,
	finishRegistry,
	inspectOwnership,
	registryRecord
};
