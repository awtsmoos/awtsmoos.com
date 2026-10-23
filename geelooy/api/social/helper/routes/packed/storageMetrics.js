//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file packed/storageMetrics.js
 * @description Cheap per-shard storage telemetry for the health pulse.
 * Before this helper, dead-space percentage was invisible between
 * investigations: the series shard sat at 97.3% dead for days while
 * nothing on the box knew (db-investigation 02). This collector reads
 * `db.storageStats()` + allocator state ONLY — it never runs a
 * verify() walk (verify walks OOM at 1 GB heap on this box and are
 * forbidden outside offline jobs by standing rule). Field names here
 * are the contract for `GET /api/social/health/pulse`'s `storage`
 * object (see db-hardening README). Every helper is read-only and
 * null-safe: a shard that cannot answer is reported, not thrown.
 */

/**
 * Sums `length` over an allocator range list.
 * @param {Array<object>} ranges - { offset, length } ranges.
 * @returns {number} Total bytes.
 */
function sumRanges(ranges) {
	let total = 0;
	for (const range of ranges || []) {
		if (range && typeof range.length === 'number') total += range.length;
	}
	return total;
}

/**
 * Collects cheap storage metrics for one open AwtsmoosDB shard.
 * @param {object} db - open AwtsmoosDB instance (writable or read-only).
 * @returns {object} Metric object keyed for the pulse `storage` field.
 */
function collectShardMetrics(db) {
	let stats = {};
	try { stats = (typeof db.storageStats === 'function' ? db.storageStats() : {}) || {}; } catch (_) { stats = {}; }
	const allocator = db ? db.allocator : null;
	const freeList = (allocator && Array.isArray(allocator.freeList)) ? allocator.freeList : [];
	const pending = (allocator && Array.isArray(allocator.pendingFreeList)) ? allocator.pendingFreeList : [];
	const physicalBytes = Number(stats.physicalBytes || 0);
	const logicalBytes = Number(stats.logicalBytes || 0);
	const payloadBytes = Number(stats.payloadBytes || 0);
	const freeListBytes = sumRanges(freeList);
	const pendingBytes = sumRanges(pending);
	// Cheap dead estimate: allocated-but-not-payload (no verify walk).
	const deadEstimate = Math.max(0, logicalBytes - payloadBytes);
	return {
		path: (db && db.pager && db.pager.filePath) || 'unknown',
		format: allocator ? 'binary-fs3' : 'legacy-manifest',
		physicalBytes, logicalBytes, payloadBytes,
		overheadBytes: Number(stats.overheadBytes || 0),
		freeListRanges: freeList.length, freeListBytes,
		pendingFreeRanges: pending.length, pendingBytes,
		deadBytesEstimate: deadEstimate,
		deadPct: logicalBytes > 0 ? deadEstimate / logicalBytes : 0,
		verifyState: (allocator && allocator.reuseVerification && allocator.reuseVerification.state) || 'not-checked',
		verifyOk: allocator && allocator.reuseVerification ? allocator.reuseVerification.ok : null,
		capturedAt: Date.now()
	};
}

/**
 * Collects metrics for many open shards, keyed by short shard name.
 * @param {object<string, object>} dbs - { shardName: dbInstance }.
 * @returns {object} { shardName: metricObject } for the pulse endpoint.
 */
function collectStorageMetrics(dbs) {
	const out = {};
	for (const [name, db] of Object.entries(dbs || {})) {
		try { out[name] = collectShardMetrics(db); }
		catch (_) { out[name] = { error: 'metrics-unavailable' }; }
	}
	return out;
}

module.exports = { collectShardMetrics, collectStorageMetrics, sumRanges };
