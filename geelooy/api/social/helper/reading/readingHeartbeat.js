//B"H
//Blessed is He
//Boruch Hashem


/**
 * Records reading heartbeats and daily reading aggregates.
 * Split sibling of readingStore.js (verbatim relocation).
 */

var { store, SHARD, HEARTBEAT_TIMEOUT_MS, MAX_HEARTBEAT_SECONDS } = require('./readingCore.js');
var { updateUserStats } = require('./readingStats.js');

/**
 * Records a heartbeat from an actively-reading client.
 * @param {string} userId - The reader's user ID.
 * @param {string} postId - The post being read.
 * @param {string} sessionId - Client-generated session ID.
 * @param {number} activeSeconds - Seconds of active reading since last heartbeat.
 * @param {string[]} sectionsViewed - Section IDs currently in view.
 * @param {number} scrollPercent - 0-100 scroll completion.
 * @param {string} seriesId - Optional series ID for favorites tracking.
 * @returns {object} Updated session summary.
 */
function recordHeartbeat({ userId, postId, sessionId, activeSeconds, sectionsViewed = [], scrollPercent = 0, seriesId = null }) {
	// Server-side validation: never trust client blindly
	const safeSeconds = Math.max(0, Math.min(MAX_HEARTBEAT_SECONDS, Number(activeSeconds) || 0));
	const safeScroll = Math.max(0, Math.min(100, Number(scrollPercent) || 0));
	const safeSections = Array.isArray(sectionsViewed) ? sectionsViewed.slice(0, 50).map(String) : [];

	const sessionKey = ['session', userId, postId, sessionId];
	const existing = store.get({ shard: SHARD, parts: sessionKey });
	const now = Date.now();

	const session = existing?.value || {
		userId,
		postId,
		sessionId,
		seriesId,
		startTime: now,
		activeSeconds: 0,
		sectionsViewed: [],
		maxScrollPercent: 0,
		heartbeatCount: 0
	};

	// Only count if not expired (gap > timeout means new reading burst, still same session)
	const lastBeat = existing?.value?.lastHeartbeat || 0;
	const gapMs = now - lastBeat;
	if (lastBeat === 0 || gapMs < HEARTBEAT_TIMEOUT_MS) {
		session.activeSeconds += safeSeconds;
	}

	session.lastHeartbeat = now;
	session.heartbeatCount += 1;
	session.maxScrollPercent = Math.max(session.maxScrollPercent, safeScroll);

	// Merge sections viewed (dedupe)
	const seen = new Set(session.sectionsViewed);
	for (const s of safeSections) {
		if (!seen.has(s)) {
			seen.add(s);
			session.sectionsViewed.push(s);
		}
	}
	if (seriesId) session.seriesId = seriesId;

	store.put({ shard: SHARD, parts: sessionKey, value: session });

	// Update daily aggregate
	updateDailyAggregate(userId, safeSeconds, postId);
	// Update user lifetime stats
	updateUserStats(userId, postId, seriesId, safeSeconds, safeScroll);

	return {
		sessionId,
		totalActiveSeconds: Math.round(session.activeSeconds),
		maxScrollPercent: session.maxScrollPercent,
		sectionsViewed: session.sectionsViewed.length
	};
}

/**
 * Updates the daily reading aggregate for streak tracking.
 */
function updateDailyAggregate(userId, seconds, postId) {
	const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
	const key = ['daily', userId, date];
	const existing = store.get({ shard: SHARD, parts: key });
	const daily = existing?.value || { userId, date, seconds: 0, posts: [] };
	daily.seconds += seconds;
	if (!daily.posts.includes(postId)) daily.posts.push(postId);
	store.put({ shard: SHARD, parts: key, value: daily });
}

module.exports = {
	recordHeartbeat,
	updateDailyAggregate
};
