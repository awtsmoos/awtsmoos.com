// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ViewCountRoutes
 * @description HTTP routes for post view tracking.
 */

const viewStore = require('../../views/viewStore.js');
const { badMethod, fail, getQuery, isMethod, ok } = require('../profile/values.js');

async function readBody($i) {
	try {
		if ($i.request?.body) {
			if (typeof $i.request.body === 'string') return JSON.parse($i.request.body);
			return $i.request.body;
		}
		const chunks = [];
		for await (const chunk of $i.request) chunks.push(chunk);
		const text = Buffer.concat(chunks).toString('utf8');
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}

class ViewCountRoutes {
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/**
	 * POST /api/social/views/record — records a post view (deduped).
	 * Body: { postId, sessionId }
	 */
	async record() {
		if (!isMethod(this.$i, 'POST')) return badMethod('Use POST.');
		const body = await readBody(this.$i);
		const { postId, sessionId } = body;
		if (!postId) return fail('MISSING_FIELDS', 'postId required.');
		try {
			const result = viewStore.recordView({
				postId: String(postId),
				userId: this.userid || null,
				sessionId: sessionId ? String(sessionId) : null
			});
			return ok({
				BH: 'B"H',
				...result,
				formatted: viewStore.formatViews(result.totalViews)
			});
		} catch (err) {
			return fail('VIEW_FAILED', 'Could not record view.', { reason: err.message });
		}
	}

	/**
	 * GET /api/social/views/:postId — gets view count for a post.
	 */
	async get(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const { totalViews, uniqueUsers } = viewStore.getViews(vars.postId);
		return ok({
			BH: 'B"H',
			postId: vars.postId,
			totalViews,
			uniqueUsers,
			formatted: viewStore.formatViews(totalViews)
		});
	}

	/**
	 * POST /api/social/views/batch — gets view counts for multiple posts.
	 * Body: { postIds: [] }
	 */
	async batch() {
		if (!isMethod(this.$i, 'POST')) return badMethod('Use POST.');
		const body = await readBody(this.$i);
		const postIds = Array.isArray(body.postIds) ? body.postIds.slice(0, 100).map(String) : [];
		const counts = viewStore.getViewsBatch(postIds);
		const formatted = {};
		for (const [id, c] of Object.entries(counts)) {
			formatted[id] = {
				...c,
				formatted: viewStore.formatViews(c.totalViews)
			};
		}
		return ok({ BH: 'B"H', counts: formatted });
	}

	routes() {
		return {
			'/views/record': this.record.bind(this),
			'/views/batch': this.batch.bind(this),
			'/views/:postId': this.get.bind(this)
		};
	}
}

function createViewCountRoutes({ $i, userid } = {}) {
	return new ViewCountRoutes({ $i, userid }).routes();
}

module.exports = { ViewCountRoutes, createViewCountRoutes };
