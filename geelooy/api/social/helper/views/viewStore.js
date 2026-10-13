// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ViewCountStore
 * @description
 * Server-side view tracking for posts. Deduplicates by user (24h window)
 * or anonymous session (1h window) so refreshes don't inflate counts.
 * Uses the AwtsmoosDB shard store.
 */

const store = require('../awtsmoosDb/shardStore.js');

const SHARD = 'views';
const USER_DEDUP_MS = 24 * 60 * 60 * 1000; // 24 hours per user
const ANON_DEDUP_MS = 60 * 60 * 1000; // 1 hour per anonymous session

/**
 * Records a view. Returns { counted: bool, totalViews: number }.
 */
function recordView({ postId, userId = null, sessionId = null }) {
	if (!postId) throw new Error('postId required');
	postId = String(postId);

	const now = Date.now();
	const countKey = ['count', postId];
	const existing = store.get({ shard: SHARD, parts: countKey });
	const count = existing?.value || { postId, total: 0, uniqueUsers: 0 };

	// Dedupe key: user > session > ip-ish fallback
	let dedupKey, window;
	if (userId) {
		dedupKey = ['seen', 'user', String(userId), postId];
		window = USER_DEDUP_MS;
	} else if (sessionId) {
		dedupKey = ['seen', 'session', String(sessionId), postId];
		window = ANON_DEDUP_MS;
	} else {
		// No identity at all — count it (rare, bots filtered elsewhere)
		count.total += 1;
		store.put({ shard: SHARD, parts: countKey, value: count });
		return { counted: true, totalViews: count.total };
	}

	const seen = store.get({ shard: SHARD, parts: dedupKey });
	if (seen?.value && (now - seen.value < window)) {
		return { counted: false, totalViews: count.total };
	}

	// New view
	count.total += 1;
	if (userId && !seen?.value) count.uniqueUsers += 1;
	store.put({ shard: SHARD, parts: countKey, value: count });
	store.put({ shard: SHARD, parts: dedupKey, value: now });

	return { counted: true, totalViews: count.total };
}

/**
 * Gets view count for a post.
 */
function getViews(postId) {
	if (!postId) return { totalViews: 0, uniqueUsers: 0 };
	const existing = store.get({ shard: SHARD, parts: ['count', String(postId)] });
	return {
		totalViews: existing?.value?.total || 0,
		uniqueUsers: existing?.value?.uniqueUsers || 0
	};
}

/**
 * Batch get view counts for multiple posts.
 */
function getViewsBatch(postIds) {
	const result = {};
	for (const id of postIds) {
		result[id] = getViews(id);
	}
	return result;
}

/**
 * Formats a view count: 1234 -> "1.2K", 1234567 -> "1.2M".
 */
function formatViews(n) {
	n = Number(n) || 0;
	if (n < 1000) return `${n}`;
	if (n < 1000000) {
		const k = n / 1000;
		return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}K`;
	}
	const m = n / 1000000;
	return `${m >= 100 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`;
}

module.exports = {
	recordView,
	getViews,
	getViewsBatch,
	formatViews
};
