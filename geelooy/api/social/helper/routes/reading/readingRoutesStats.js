//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutesStats
 * @description
 * Prototype-mixin sibling of ReadingAnalyticsRoutes: stats and recent methods, relocated verbatim.
 */

const readingStore = require('../../reading/readingStore.js');
const { badMethod, fail, getQuery, isMethod, ok } = require('../profile/values.js');

module.exports = {
	/**
	 * GET /api/reading/stats/:userId — reading statistics (privacy-enforced).
	 */
	async stats(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const targetUserId = vars.userId;

		if (!readingStore.canView(this.userid, targetUserId)) {
			return fail('PRIVACY_RESTRICTED', 'This user keeps their reading private.');
		}

		const stats = readingStore.getStats(targetUserId);
		if (!stats) return ok({ BH: 'B"H', userId: targetUserId, empty: true });

		return ok({ BH: 'B"H', ...stats });
	},

	/**
	 * GET /api/reading/recent/:userId — recently read posts (privacy-enforced).
	 */
	async recent(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const targetUserId = vars.userId;

		if (!readingStore.canView(this.userid, targetUserId)) {
			return fail('PRIVACY_RESTRICTED', 'This user keeps their reading private.');
		}

		const query = getQuery(this.$i);
		const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
		const recent = readingStore.getRecentReads(targetUserId, limit);
		return ok({ BH: 'B"H', userId: targetUserId, recent });
	},
};
