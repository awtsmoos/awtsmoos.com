// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReadingAnalyticsStore
 * @description
 * Server-side storage for reading analytics. Tracks post visits, active reading
 * time, sections viewed, and completion. Uses the AwtsmoosDB shard store.
 * The Awtsmoos records every reading moment while Awtsmoos.com keeps the
 * data queryable and privacy-respecting.
 */

const store = require('../awtsmoosDb/shardStore.js');

const SHARD = 'reading';
const HEARTBEAT_TIMEOUT_MS = 45000; // Session expires after 45s without heartbeat
const MAX_HEARTBEAT_SECONDS = 30; // Never trust more than 30s per heartbeat

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

/**
 * Updates lifetime user reading stats.
 */
function updateUserStats(userId, postId, seriesId, seconds, scrollPercent) {
	const key = ['stats', userId];
	const existing = store.get({ shard: SHARD, parts: key });
	const stats = existing?.value || {
		userId,
		totalPostsRead: 0,
		totalSeconds: 0,
		postsCompleted: 0,
		seriesCounts: {},
		lastReadAt: 0,
		streakDays: 0,
		lastStreakDate: null
	};

	stats.totalSeconds += seconds;
	stats.lastReadAt = Date.now();

	// Count unique posts
	const postKey = ['postread', userId, postId];
	const postExisting = store.get({ shard: SHARD, parts: postKey });
	if (!postExisting) {
		store.put({ shard: SHARD, parts: postKey, value: { userId, postId, firstReadAt: Date.now() } });
		stats.totalPostsRead += 1;
	}

	// Track completions (80%+ scroll = completed)
	if (scrollPercent >= 80) {
		const compKey = ['completed', userId, postId];
		if (!store.get({ shard: SHARD, parts: compKey })) {
			store.put({ shard: SHARD, parts: compKey, value: { userId, postId, completedAt: Date.now() } });
			stats.postsCompleted += 1;
		}
	}

	// Track series for favorites
	if (seriesId) {
		stats.seriesCounts[seriesId] = (stats.seriesCounts[seriesId] || 0) + 1;
	}

	// Update streak
	updateStreak(stats);

	store.put({ shard: SHARD, parts: key, value: stats });
}

/**
 * Calculates reading streak (consecutive days with reading activity).
 */
function updateStreak(stats) {
	const today = new Date().toISOString().slice(0, 10);
	const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

	if (stats.lastStreakDate === today) return; // Already counted today
	if (stats.lastStreakDate === yesterday) {
		stats.streakDays += 1;
	} else if (stats.lastStreakDate !== today) {
		stats.streakDays = 1; // Reset streak
	}
	stats.lastStreakDate = today;
}

/**
 * Gets reading stats for a user.
 * @param {string} userId - The user to get stats for.
 * @returns {object|null} Stats or null if none.
 */
function getStats(userId) {
	const record = store.get({ shard: SHARD, parts: ['stats', userId] });
	if (!record) return null;
	const stats = record.value;

	// Find favorite series
	let favoriteSeries = null;
	let maxCount = 0;
	for (const [seriesId, count] of Object.entries(stats.seriesCounts || {})) {
		if (count > maxCount) {
			maxCount = count;
			favoriteSeries = seriesId;
		}
	}

	return {
		userId,
		totalPostsRead: stats.totalPostsRead || 0,
		totalSeconds: Math.round(stats.totalSeconds || 0),
		totalHours: Math.round((stats.totalSeconds || 0) / 3600 * 10) / 10,
		postsCompleted: stats.postsCompleted || 0,
		streakDays: stats.streakDays || 0,
		favoriteSeries,
		lastReadAt: stats.lastReadAt || 0
	};
}

/**
 * Gets recently read posts for a user.
 * @param {string} userId - The user.
 * @param {number} limit - Max results.
 * @returns {array} Recent reading sessions.
 */
function getRecentReads(userId, limit = 10) {
	const sessions = store.list({
		shard: SHARD,
		predicate: (record) => {
			const parts = record.parts || [];
			return parts[0] === 'session' && parts[1] === userId;
		}
	});

	return sessions
		.map(r => r.value)
		.sort((a, b) => (b.lastHeartbeat || 0) - (a.lastHeartbeat || 0))
		.slice(0, Math.min(limit, 50))
		.map(s => ({
			postId: s.postId,
			seriesId: s.seriesId || null,
			activeSeconds: Math.round(s.activeSeconds || 0),
			maxScrollPercent: s.maxScrollPercent || 0,
			sectionsViewed: (s.sectionsViewed || []).length,
			lastReadAt: s.lastHeartbeat || s.startTime
		}));
}

/**
 * Gets/sets reading privacy level.
 */
function getPrivacy(userId) {
	const record = store.get({ shard: SHARD, parts: ['privacy', userId] });
	return record?.value?.level || 'private'; // Default: private
}

function setPrivacy(userId, level) {
	const valid = ['private', 'friends', 'public'];
	if (!valid.includes(level)) throw new Error('Invalid privacy level');
	store.put({ shard: SHARD, parts: ['privacy', userId], value: { userId, level, updatedAt: Date.now() } });
	return level;
}

/**
 * Checks if a viewer can see a user's reading data.
 */
function canView(viewerId, targetUserId) {
	if (viewerId === targetUserId) return true;
	const privacy = getPrivacy(targetUserId);
	if (privacy === 'public') return true;
	if (privacy === 'friends') {
		// TODO: check friendship — for now, any authenticated user counts as friend
		// This will be tightened when the friends system is queried
		return Boolean(viewerId);
	}
	return false; // private
}

module.exports = {
	recordHeartbeat,
	getStats,
	getRecentReads,
	getPrivacy,
	setPrivacy,
	canView,
	HEARTBEAT_TIMEOUT_MS,
	MAX_HEARTBEAT_SECONDS
};
