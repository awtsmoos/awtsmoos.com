//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedBulkImportRoutes
 * @description
 * PATH2 per-post bulk import for the Chassidus corpus (2026-10-05 fix).
 *
 * WHY THIS EXISTS: the per-comment write path (one inode per comment) is
 * PHYSICALLY NON-VIABLE at this scale — every flush() serializes the entire
 * inode manifest as one JSON string, and ~1.5M+ new inodes blows past V8's
 * ~512MB string limit mid-import, risking production DB corruption. The
 * 17.5 GB social.richComments.v1.fs.awtsdb on production is the residue of
 * exactly that failure (2026-09-29 v1 attempt).
 *
 * PATH2 writes ONE PACKED FILE PER POST:
 *   /ikar/social/chassidus_translations/<aliasId>/<postId>.json
 *   = {postId, seriesId, aliasId, heichelId, commentCount, comments[]}
 * 1,494 files + 1 ID index ≈ 1,510 new inodes ≈ 600 KB of manifest.
 * Trivially safe on any machine.
 *
 * Read side: additive fallback patches already deployed to
 * richCommentReader.js (indexedIds unions per-post IDs) and
 * richCommentAccess.js (getComment / getCommentByUnique fall back to
 * per-post files). Standard lookups run first; fallbacks trigger on miss.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/import/bulk/start   — start a bulk import job
 *   GET  /packed/import/bulk/status  — ?job=<id> poll one job
 *   GET  /packed/import/bulk/jobs   — list recent jobs
 *   POST /packed/import/bulk/cancel — {job} request cancellation
 *
 * Job kinds:
 *   perPost    — write one post's comments as a single packed file.
 *                Body: {kind:'perPost', seriesId, postId, aliasId, heichelId?,
 *                       dryRun?, items?|payloadFile?, maxComments?, timeBudgetMs?}
 *   perPostIndex — (re)build /ikar/social/chassidus_translations/_index/
 *                commentIdToPost.json from all per-post files. Run once after
 *                all perPost jobs. Body: {kind:'perPostIndex', dryRun?}
 *   translation|summary|ocrFix — legacy per-comment kinds, RETIRED for the
 *                Chassidus corpus (kept for API compatibility; perPost is the
 *                only viable path at this scale).
 *
 * Safety: operator-key authorization (fail-closed), dry-run mode, bounded
 * batch size + per-job time budget (pause/resume), idempotent per-post file
 * union by comment ID, exactly one running job, strict payload validation.
 */

const { PackedBulkImportRoutes } = require('./bulkImportRoutesClass.js');
Object.assign(PackedBulkImportRoutes.prototype, require('./bulkImportRoutesPerPost.js'));
Object.assign(PackedBulkImportRoutes.prototype, require('./bulkImportRoutesIndex.js'));
Object.assign(PackedBulkImportRoutes.prototype, require('./bulkImportRoutesRun.js'));
Object.assign(PackedBulkImportRoutes.prototype, require('./bulkImportRoutesStart.js'));
Object.assign(PackedBulkImportRoutes.prototype, require('./bulkImportRoutesQuery.js'));
const { newJobId, setJob, runningJob, yieldTick } = require('./bulkImportRoutesJobs.js');
const { appendJobLog } = require('./bulkImportRoutesGuards.js');
const { perPostPath } = require('./bulkImportRoutesPaths.js');

module.exports = { PackedBulkImportRoutes };

// ---------------------------------------------------------------------------
// Additive extension point for the one-call bulk publisher (Yaakov directive).
// Shares the job registry / auth plumbing with the BulkPublishAllRoutes
// subclass in ./bulkPublishAllRoutes.js (loaded below). No behavior change:
// existing kinds flow exactly as before when publishAll is not used.
// ---------------------------------------------------------------------------
const __bulkPlumbing = { newJobId, setJob, runningJob, appendJobLog, yieldTick, perPostPath };
module.exports = { PackedBulkImportRoutes, __bulkPlumbing };
try { require('./bulkPublishAllRoutes.js'); } catch (_) {}
