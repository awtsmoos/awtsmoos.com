//B"H
//Blessed is He
//Boruch Hashem

/** @module NativePostIdSet
 * Fix (J) Nov 10 — bulk native-existence set for live-hash misses.
 *
 * The per-post native probe in processOneWrite ($i.db.get on the
 * heichel posts path, one per cache miss) costs 175-643ms on a seeded
 * store and dominates the job (~80% of per-post time, measured by the
 * Nov 10 profile run: liveHashRead avg 15ms fresh vs 320ms avg / 523ms
 * marginal at 900 posts into a seeded speed-series, growing with the
 * heichel posts directory size). The read loads the whole directory
 * child-map per call. One bulk listing of that directory replaces all
 * of them: a single getObjectKeys call, cached on the job context,
 * answers every miss from memory afterwards.
 *
 * Correctness: the set is a snapshot of the native store at first
 * use. Posts written by THIS job are tracked separately (job.doneHashes
 * + liveHashes, set right after each write), so the snapshot never
 * hides a this-job write. Nothing else writes this heichel during a
 * job (one job per heichel lane), so the snapshot stays accurate for
 * pre-existing posts. A post in neither the set nor the caches is
 * genuinely new. A post in the set but missing from the packed cache
 * still gets its single native read (for its hash) — the rare case,
 * bounded by the number of pre-existing-but-uncached posts.
 *
 * If the listing itself fails, the set is null and callers fall back
 * to the per-post native read (the old behavior) — a slow job, never
 * a wrong skip. A null set must never be read as "empty" (that would
 * misclassify existing posts as new).
 */

const { contentHash } = require('./postValidate.js');

/**
 * One bulk listing of the heichel posts directory, as a Set of postIds.
 * Returns null when the listing fails (callers fall back to per-post reads).
 */
async function buildNativePostIdSet($i, heichelId) {
	try {
		const keys = await $i.db.getObjectKeys(`/social/heichelos/${heichelId}/posts`);
		if (!Array.isArray(keys)) return null;
		const set = new Set();
		for (const k of keys) if (typeof k === 'string' && k) set.add(k);
		return set;
	} catch (_) {
		return null;
	}
}

/**
 * Lazily build (once per job, shared by all workers via ctx) and cache
 * the native-existence set. Concurrent first misses share one in-flight
 * promise — the check-and-set is synchronous, so no double build.
 * Resolves to a Set, or null when the listing failed.
 */
function nativePostIdsPromise(ctx, $i, heichelId) {
	if (!ctx.nativePostIdsPromise) {
		ctx.nativePostIdsPromise = buildNativePostIdSet($i, heichelId);
	}
	return ctx.nativePostIdsPromise;
}

/**
 * Resolve a live-hash cache miss against the native store, WITHOUT a
 * per-post native read in the common case. Returns the native record's
 * content hash when the post exists natively, or undefined when it is
 * genuinely new. `readOne` is the single-record fallback used only
 * when the post is in the bulk set (pre-existing but uncached), or
 * when the bulk listing failed (null set — old behavior).
 */
async function resolveNativeLiveHash(ctx, $i, post, readOne) {
	const nativeIds = await nativePostIdsPromise(ctx, $i, post.heichelId);
	if (nativeIds === null) {
		const nativeRec = await readOne();
		if (nativeRec && typeof nativeRec === 'object') {
			try { return contentHash(nativeRec); } catch (_) { return undefined; }
		}
		return undefined;
	}
	if (!nativeIds.has(post.postId)) return undefined;
	const nativeRec = await readOne();
	if (nativeRec && typeof nativeRec === 'object') {
		try { return contentHash(nativeRec); } catch (_) { return undefined; }
	}
	return undefined;
}

/**
 * True when the post exists natively, without a per-post read in the
 * common case. Falls back to a single native read when the bulk
 * listing failed (null set). `readOne` is that fallback.
 */
async function nativePostExists(ctx, $i, post, readOne) {
	const nativeIds = await nativePostIdsPromise(ctx, $i, post.heichelId);
	if (nativeIds === null) {
		const nativeRec = await readOne();
		return !!nativeRec;
	}
	return nativeIds.has(post.postId);
}

module.exports = {
	buildNativePostIdSet,
	nativePostIdsPromise,
	resolveNativeLiveHash,
	nativePostExists
};
