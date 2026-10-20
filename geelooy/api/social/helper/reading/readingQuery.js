//B"H
//Blessed is He
//Boruch Hashem


/**
 * Recent reads and reading privacy queries.
 * Split sibling of readingStore.js (verbatim relocation).
 */

var { store, SHARD } = require('./readingCore.js');

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
	getRecentReads,
	getPrivacy,
	setPrivacy,
	canView
};
