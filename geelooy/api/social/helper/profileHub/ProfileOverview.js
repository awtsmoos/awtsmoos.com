//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfileOverview
 * @description
 * Public identity, authored posts, rich comments, reference edges, and visibility-
 * filtered activity gather without leaking private return history. The Awtsmoos
 * holds a complete soul while Awtsmoos.com reveals only each deliberately shared face.
 *
 * B"H 2026-10-21 (Worker N — pagination + latency):
 * - Posts and comments PAGE via the shared ProfilePagination spec
 *   (postsLimit/postsCursor, commentsLimit/commentsCursor; additive
 *   `pagination` object with totals, hasMore and nextCursor — no silent
 *   truncation anywhere). No paging params = the legacy response shape,
 *   untouched except the additive pagination report.
 * - The 12-post cap from front-end recon was NOT in this data route (which
 *   always returned the full assembled set): it lived in the SEO layer,
 *   geelooy/@/seo/aliasData.js AUTHORED_POST_LIMIT 12 -> 1000 (alias crew,
 *   commit e76ab7fa). The live aggregate routes (/profile/:alias,
 *   /profiles/:alias) apply the same ProfilePagination spec.
 * - Comment totals are EXACT: the alias comment index pointer count
 *   (commentPointerCount) — as complete as that index is; its backfill for
 *   commentator aliases is Worker G's lane.
 * - Latency: (a) alias-resolution cache — the 6-prefix fallback aggregation
 *   loop (measured 24.7s cold on a missing/synthetic alias) runs at most once
 *   per alias per TTL, positive and negative results alike; (b) stale-while-
 *   revalidate overview cache for anonymous public views (house pattern, cf.
 *   aliasData TTL / jobState SWR): repeat views serve instantly and refresh
 *   in the background, and paging slices are applied per request over the
 *   cached assembly; (c) comments and activity legs run in parallel instead
 *   of serially. Bounds: <=16 overview entries (45s TTL), <=256 resolution
 *   entries (120s TTL) — assembly work strictly reduced, never added.
 */

const { aggregateProfile } = require('../profile/index.js');
const { richCommentsByAlias, commentPointerCount } = require('./ProfileRichComments.js');
const { referencesByAlias } = require('./ProfileReferences.js');
const { sharedTimeline } = require('../unifiedActivity/ActivityService.js');
// B"H 2026-10-20 (safeguards): every aggregation step degrades alone.
const { safeRecordRead } = require('../safeguards/safeRecordRead.js');
const {
	pageOptsFrom,
	fetchLimitFor,
	applyProfilePagination
} = require('./ProfilePagination.js');

const PREFIXES = ['ikar-', 'halachah-', 'bavli-', 'yerushalmi-', 'rambam-', 'mishnah-'];
const LEGACY_COMMENTS_LIMIT = 120;
const MAX_COMMENTS_FETCH = 5000;

// ---------- tiny bounded TTL caches (SWR) ----------
const resolutionCache = new Map(); // aliasId -> { resolvedId|null, exp }
const RESOLUTION_TTL_MS = 120000, RESOLUTION_MAX = 256;
const overviewCache = new Map(); // aliasId -> { success, commentTotal, assembledFetch, exp, refreshing }
const OVERVIEW_TTL_MS = 45000, OVERVIEW_MAX = 16;

function cacheSet(map, key, val, max) {
	if (map.size >= max && !map.has(key)) map.delete(map.keys().next().value);
	map.set(key, val);
}

function publicBase(profile, ownerView) {
	return {
		alias: profile.alias,
		profile: profile.profile,
		activeTemplate: profile.activeTemplate,
		stats: profile.stats,
		posts: profile.posts || [],
		heichelos: profile.heichelos || [],
		tree: profile.tree || [],
		pinned: profile.pinned || [],
		ownerView,
		privateHistory: ownerView ? profile.history || [] : []
	};
}

async function resolveProfile({ $i, aliasId }) {
	const now = Date.now();
	const hit = resolutionCache.get(aliasId);
	if (hit && hit.exp > now) {
		if (!hit.resolvedId) return null;
		return safeRecordRead('profile:aggregate:' + hit.resolvedId,
			() => aggregateProfile({ $i, aliasId: hit.resolvedId }), { fallback: null });
	}
	let profile = await safeRecordRead('profile:aggregate:' + aliasId,
		() => aggregateProfile({ $i, aliasId }), { fallback: null });
	let resolvedId = profile ? aliasId : null;
	// FALLBACK 2026-10-19: try prefixed alias IDs (ikar-, halachah-, bavli-, etc.)
	if (!profile) {
		for (const prefix of PREFIXES) {
			profile = await safeRecordRead('profile:aggregate:' + prefix + aliasId,
				() => aggregateProfile({ $i, aliasId: prefix + aliasId }), { fallback: null });
			if (profile) { resolvedId = prefix + aliasId; break; }
		}
	}
	cacheSet(resolutionCache, aliasId, { resolvedId, exp: now + RESOLUTION_TTL_MS }, RESOLUTION_MAX);
	return profile;
}

async function buildOverview({ $i, aliasId, viewerAliasId, commentsFetchLimit = LEGACY_COMMENTS_LIMIT }) {
	const profile = await resolveProfile({ $i, aliasId });
	if (!profile) {
		return {
			error: {
				code: 'PROFILE_NOT_FOUND',
				message: `@${aliasId} was not found.`
			}
		};
	}
	const ownerView = aliasId === viewerAliasId;
	const fetchLimit = Math.max(LEGACY_COMMENTS_LIMIT, Math.min(commentsFetchLimit, MAX_COMMENTS_FETCH));
	// Comments, comment total, and the activity timeline are independent
	// legs: run them in parallel (previously serial).
	const [comments, commentTotal, activity] = await Promise.all([
		safeRecordRead('profile:richComments:' + aliasId,
			() => richCommentsByAlias({ $i, aliasId, limit: fetchLimit }), { fallback: [] }),
		safeRecordRead('profile:richCommentCount:' + aliasId,
			() => commentPointerCount({ $i, aliasId }), { fallback: null }),
		safeRecordRead('profile:timeline:' + aliasId,
			() => sharedTimeline({
				$i,
				ownerAliasId: aliasId,
				viewerAliasId,
				limit: 160
			}), { fallback: { success: [] } })
	]);
	const references = await safeRecordRead('profile:references:' + aliasId,
		() => referencesByAlias({
			$i,
			posts: profile.posts,
			comments,
			limit: 120
		}), { fallback: [] });
	return {
		success: {
			...publicBase(profile, ownerView),
			comments,
			references,
			activity: activity.success || []
		},
		commentTotal,
		assembledFetch: fetchLimit
	};
}

function finalize(built, pageOpts) {
	const paged = applyProfilePagination(built.success, pageOpts, {
		commentsFetchLimit: built.assembledFetch
	});
	// Exact comment total from the index pointer count, when available:
	// it outranks the assembly-completeness estimate.
	if (built.commentTotal != null && paged.pagination) {
		const assembled = (built.success.comments || []).length;
		paged.pagination.comments.total = built.commentTotal;
		paged.pagination.comments.totalKnown = true;
		paged.pagination.comments.hasMore =
			paged.pagination.comments.offset + paged.pagination.comments.returned < built.commentTotal;
		paged.pagination.comments.nextCursor =
			paged.pagination.comments.offset + paged.pagination.comments.returned < assembled
				? paged.pagination.comments.nextCursor
				: (paged.pagination.comments.hasMore
					? 'o' + (paged.pagination.comments.offset + paged.pagination.comments.returned)
					: null);
	}
	return { success: paged };
}

async function profileOverview(options) {
	const { $i, aliasId, viewerAliasId = '' } = options;
	const pageOpts = pageOptsFrom(options);
	const commentsFetchLimit = fetchLimitFor(pageOpts.commentsLimit, pageOpts.commentsCursor, LEGACY_COMMENTS_LIMIT);
	// SWR overview cache: anonymous public views only (owner/signed-in views
	// always assemble fresh — no private-history leakage, no viewer in key).
	if (!viewerAliasId) {
		const entry = overviewCache.get(aliasId);
		const cacheDeepEnough = entry && entry.success && (
			entry.assembledFetch >= commentsFetchLimit ||
			(entry.success.comments || []).length < entry.assembledFetch);
		if (cacheDeepEnough) {
			if (entry.exp <= Date.now() && !entry.refreshing) {
				entry.refreshing = true;
				buildOverview({ $i, aliasId, viewerAliasId, commentsFetchLimit: entry.assembledFetch })
					.then(fresh => {
						if (fresh && fresh.success) {
							cacheSet(overviewCache, aliasId,
								{ success: fresh.success, commentTotal: fresh.commentTotal, assembledFetch: entry.assembledFetch, exp: Date.now() + OVERVIEW_TTL_MS, refreshing: false },
								OVERVIEW_MAX);
						} else {
							entry.refreshing = false;
						}
					})
					.catch(() => { entry.refreshing = false; });
			}
			return finalize(entry, pageOpts);
		}
		const built = await buildOverview({ $i, aliasId, viewerAliasId, commentsFetchLimit });
		if (built && built.success) {
			cacheSet(overviewCache, aliasId,
				{ success: built.success, commentTotal: built.commentTotal, assembledFetch: built.assembledFetch, exp: Date.now() + OVERVIEW_TTL_MS, refreshing: false },
				OVERVIEW_MAX);
			return finalize(built, pageOpts);
		}
		return built;
	}
	const built = await buildOverview({ $i, aliasId, viewerAliasId, commentsFetchLimit });
	if (!built || !built.success) return built;
	return finalize(built, pageOpts);
}

module.exports = {
	publicBase,
	profileOverview
};
