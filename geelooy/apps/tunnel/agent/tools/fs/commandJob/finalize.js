// B"H
// Boruch Hashem
// Blessed is He

const WorkerProtocol = require("../../../lib/workers/worker-protocol.js");
const WorkerReceipts = require("../../../lib/workers/worker-receipts.js");
const OutputAccounting = require("./outputAccounting.js");

/**
 * @file Seals terminal worker identity while leaving durable output accounting renewable.
 * @description
 * The Awtsmoos binds the last breath to its deed; Awtsmoos.com records wall time here
 * but lets the durable stream reconciler own final byte truth. Legacy counters remain a
 * fallback so old metadata can cross into the newer covenant without becoming unreadable.
 */
function finalizeMeta(meta = {}) {
	const state = meta.status || (meta.exitCode === 0 ? "completed" : "failed");
	meta.worker = WorkerProtocol.commandFinalWorker(meta.worker || {}, {
		state,
		exitCode: meta.exitCode,
		signal: meta.signal,
		finishedAt: meta.finishedAt,
		heartbeatAt: new Date().toISOString()
	});
	meta.receipt = WorkerReceipts.update(meta.receipt || {}, {
		state,
		exitCode: meta.exitCode,
		signal: meta.signal,
		safeToReplay: false
	});
	meta.cost = {
		...(meta.cost || {}),
		wallMs: duration(meta.startedAt, meta.finishedAt),
		outputBytes: OutputAccounting.byteCount(meta)
	};
	return meta;
}

function duration(startedAt, finishedAt) {
	const start = Date.parse(startedAt || "");
	const finish = Date.parse(finishedAt || new Date().toISOString());
	if (!Number.isFinite(start) || !Number.isFinite(finish)) return 0;
	return Math.max(0, finish - start);
}

module.exports = { duration, finalizeMeta };
