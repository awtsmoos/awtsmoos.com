//B"H
//Blessed is He
//Boruch Hashem


/**
 * Lifetime user reading stats and streak calculation.
 * Split sibling of readingStore.js (verbatim relocation).
 */

var { store, SHARD } = require('./readingCore.js');

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

module.exports = {
	updateUserStats,
	updateStreak,
	getStats
};
