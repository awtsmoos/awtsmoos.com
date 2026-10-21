//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutesHeartbeat
 * @description
 * Prototype-mixin sibling of ReadingAnalyticsRoutes: heartbeat method, relocated verbatim.
 */

const readingStore = require('../../reading/readingStore.js');
const { badMethod, fail, isMethod, ok } = require('../profile/values.js');
const { readBody } = require('./readingRoutesHelpers.js');

module.exports = {
	/**
	 * POST /api/reading/heartbeat — records active reading time.
	 * Body: { postId, sessionId, activeSeconds, sectionsViewed, scrollPercent, seriesId }
	 */
	async heartbeat() {
		if (!isMethod(this.$i, 'POST')) return badMethod('Use POST.');
		if (!this.userid) return fail('NOT_AUTHENTICATED', 'Sign in to track reading.');

		const body = await readBody(this.$i);
		const { postId, sessionId, activeSeconds, sectionsViewed, scrollPercent, seriesId } = body;

		if (!postId || !sessionId) {
			return fail('MISSING_FIELDS', 'postId and sessionId are required.');
		}

		try {
			const result = readingStore.recordHeartbeat({
				userId: this.userid,
				postId: String(postId),
				sessionId: String(sessionId),
				activeSeconds,
				sectionsViewed,
				scrollPercent,
				seriesId: seriesId ? String(seriesId) : null
			});
			return ok({ BH: 'B"H', ...result });
		} catch (err) {
			return fail('HEARTBEAT_FAILED', 'Could not record reading.', { reason: err.message });
		}
	},
};
