// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReadingAnalyticsRoutes
 * @description
 * HTTP routes for reading analytics. The Awtsmoos receives heartbeats from
 * actively-reading clients, aggregates server-side, and serves stats with
 * privacy enforcement. Awtsmoos.com never trusts client time blindly.
 */

const readingStore = require('../reading/readingStore.js');
const { badMethod, fail, getQuery, isMethod, ok } = require('../routes/profile/values.js');

/**
 * Extracts JSON body from the request.
 */
async function readBody($i) {
	try {
		if ($i.request?.body) {
			if (typeof $i.request.body === 'string') return JSON.parse($i.request.body);
			return $i.request.body;
		}
		// Try reading from stream
		const chunks = [];
		for await (const chunk of $i.request) chunks.push(chunk);
		const text = Buffer.concat(chunks).toString('utf8');
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}

class ReadingAnalyticsRoutes {
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

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
	}

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
	}

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
	}

	/**
	 * GET /api/reading/privacy — get own privacy level.
	 * PUT /api/reading/privacy — set own privacy level.
	 */
	async privacy() {
		if (!this.userid) return fail('NOT_AUTHENTICATED', 'Sign in to manage privacy.');

		if (isMethod(this.$i, 'GET')) {
			const level = readingStore.getPrivacy(this.userid);
			return ok({ BH: 'B"H', level });
		}

		if (isMethod(this.$i, 'PUT')) {
			const body = await readBody(this.$i);
			try {
				const level = readingStore.setPrivacy(this.userid, body.level);
				return ok({ BH: 'B"H', level, updated: true });
			} catch (err) {
				return fail('INVALID_LEVEL', 'Level must be private, friends, or public.');
			}
		}

		return badMethod('Use GET or PUT.');
	}

	routes() {
		return {
			'/reading/heartbeat': this.heartbeat.bind(this),
			'/reading/stats/:userId': this.stats.bind(this),
			'/reading/recent/:userId': this.recent.bind(this),
			'/reading/privacy': this.privacy.bind(this)
		};
	}
}

function createReadingAnalyticsRoutes({ $i, userid } = {}) {
	return new ReadingAnalyticsRoutes({ $i, userid }).routes();
}

module.exports = { ReadingAnalyticsRoutes, createReadingAnalyticsRoutes };
