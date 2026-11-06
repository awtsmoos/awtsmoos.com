//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStateShape.js
 * @description
 * The Awtsmoos pours living work into a bounded durable form;
 * Awtsmoos.com keeps giant transient batches outside the persistence storm.
 *
 * Bulk-upload redesign §3.3: the persisted shape is CONSTANT-SIZE.
 * donePostIds (which grew linearly with the job — the bulk of a huge
 * job's state file) moved OUT of the state file and into the append-only
 * <jobId>.receipts.jsonl (see jobReceipts.js); the state keeps only a
 * donePostIdsCount. The backlink queue stays: it is bounded by distinct
 * alias/heichel/series combos and flush-backlinks replays it after a
 * crash. Resume needs the staged source to survive a restart, so the
 * manifest reference (stagedDir, uploadId, updatesFile), the job kind,
 * and the resume lineage (resumeOf, attempt) are persisted explicitly.
 * The big transient fields (spec.posts, packedBatch, timers) stay in
 * memory; the Oct 28 stringify-throw lesson still applies — timer
 * handles are stripped here so the shape is always serializable.
 */
function jobStateShape(job) {
	const {
		spec,
		doneHashes,
		aliasCache,
		seriesAdds,
		packedBatch,
		backlinkQueue,
		_watchdogTimer,
		_killTimer,
		_processedCount,
		_lastCheckpointAt,
		_watchdogTerminalizing,
		...rest
	} = job || {};
	return {
		...rest,
		// Per-post failures live in the receipts file; the state keeps
		// only the tail so a many-failure job cannot grow its state.
		errors: Array.isArray(job?.errors) ? job.errors.slice(-50) : [],
		heichelId: spec?.heichelId || job?.heichelId,
		// B"H 2026-10-26 (account-auth import): the job's alias is the
		// ownership scope for status/verify polls. It lived only in
		// spec.aliasId, which this shape dropped, so a non-admin caller
		// could never be scoped to their own jobs. Keep it on the view;
		// jobs persisted before this change have no aliasId and are
		// therefore invisible to non-admin callers (fail closed).
		aliasId: spec?.aliasId || job?.aliasId,
		aliasName: spec?.aliasName || job?.aliasName,
		source: spec?.source,
		kind: job?.kind || spec?.kind || 'import',
		// Manifest reference only — never the posts. Resume rebuilds its
		// entries from the staged tarball after a restart.
		stagedDir: spec?.stagedDir || job?.stagedDir,
		uploadId: spec?.uploadId || job?.uploadId,
		updatesFile: spec?.updatesFile || job?.updatesFile,
		series: spec?.series || job?.series,
		resumeOf: job?.resumeOf,
		attempt: job?.attempt || 0,
		originalTotalPosts: job?.originalTotalPosts,
		holdReason: job?.holdReason,
		holdFreeBytes: job?.holdFreeBytes,
		persistDegraded: job?.persistDegraded || undefined,
		// Counters only: per-post outcomes live in the receipts file.
		donePostIdsCount: Object.keys(doneHashes || {}).length,
		backlinkQueue: backlinkQueue && backlinkQueue.size
			? [...backlinkQueue.values()]
			: undefined
	};
}

module.exports = { jobStateShape };
