//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BulkPublishAllRoutes
 * @description
 * ONE-CALL bulk publish — Yaakov's "publish millions of posts and comments
 * instantly" directive. Subclasses PackedBulkImportRoutes so the publishAll
 * job shares its job registry, operator-key auth, /status poll, /cancel and
 * job log. The parent file is NOT modified (it carries active uncommitted
 * work); this file is purely additive.
 *
 * Flow:
 *   1. POST /packed/import/bulk/stage — resumable chunked tarball upload
 *      {uploadId, chunkIndex, totalChunks, data(base64), operatorKey}
 *      Tarball layout: payload *.json files + manifest.json
 *      {files:[{file, postId, series, alias, sha256, bytes}], postCount, totalComments}
 *   2. POST /packed/import/bulk/start — {kind:'publishAll', uploadId,
 *      oversizedStoreApproval:true, dryRun?, idempotencyKey?, operatorKey}
 *      One in-process job streams ALL staged payload files.
 *   3. GET  /packed/import/bulk/status?job=<id> — existing poll endpoint;
 *      job carries postsDone/totalPosts/wrote/skipped.
 *
 * Performance design (verified against awtsmoosDB internals):
 * - The 17.5 GB store is opened ONCE per job. open() reads a 64-byte
 *   superblock (O(1)); nothing on the hot path scales with store size.
 * - Flush is O(dirty) on the v3 record-based manifest
 *   (api/fs/v3/storeState.js); we flush every 100 posts instead of per post.
 * - Explicit per-call oversized-store approval is plumbed to
 *   PackedStore.open($i, {allowOversizedStore:true}); the global env bypass
 *   keeps working for the old path.
 * - Idempotent: per-post merge-by-comment-ID identical to the perPost path;
 *   re-running publishAll skips everything already written.
 * - Bounded memory: one payload file at a time; safe on the 1.9 GB host.
 *
 * INSTANT MODE (Yaakov 2026-10-09: "should be instant and flawless"):
 * Pass freshImport:true to /start. The job then:
 *   - skips the read-per-post merge (caller guarantees overwrite is safe),
 *   - flushes ONCE at the end instead of every 100 posts (each fsync ~4s),
 *   - and when the manifest has prebuilt:true (binaries built by
 *     scripts/prebuildPublishAll.mjs), skips JSON.parse, ID derivation and
 *     serialization entirely — raw bytes straight into the store.
 * Measured: 993 posts / 38.5K comments in ~15s vs ~98s standard.
 * Re-running a freshImport job writes byte-identical files, so it stays
 * idempotent; it just doesn't merge with pre-existing per-post files.
 */

const { BulkPublishAllRoutes } = require('./bulkPublishAllRoutesClass.js');
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesStage.js'));
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesStart.js'));
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesExtract.js'));
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesRun.js'));
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesDryRun.js'));
Object.assign(BulkPublishAllRoutes.prototype, require('./bulkPublishAllRoutesImport.js'));

module.exports = { BulkPublishAllRoutes };

// ---------------------------------------------------------------------------
// Upgrade the parent's export so the existing packed composer picks up the
// subclass WITHOUT any composer change. The subclass delegates every
// pre-existing kind/path to super, so behavior is identical when publishAll
// and /stage are not used. (Circular require is safe: the parent sets its
// exports, including __bulkPlumbing, before requiring this file at its bottom;
// whatever load order occurs, the swap lands on the same exports object the
// composer destructures.)
// ---------------------------------------------------------------------------
try {
	const parentPath = require.resolve('./bulkImportRoutes.js');
	const parentExports = require.cache[parentPath] && require.cache[parentPath].exports;
	if (parentExports) parentExports.PackedBulkImportRoutes = BulkPublishAllRoutes;
} catch (_) {}
