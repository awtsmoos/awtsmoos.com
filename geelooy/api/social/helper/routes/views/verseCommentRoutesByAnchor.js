//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module VerseCommentRoutesByAnchor
 * @description
 * Prototype-mixin sibling of VerseCommentRoutes: byAnchor method, relocated verbatim.
 */

const { badMethod, fail, getQuery, ok } = require('../profile/values.js');
const { getReader } = require('./verseCommentRoutesHelpers.js');

module.exports = {
	/**
	 * GET /api/social/comments/by-anchor?postId=...&verseSection=...&subsectionId=...
	 * Returns: { comments: [...] }
	 */
	async byAnchor() {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const q = getQuery(this.$i);
		const postId = String(q.postId || '');
		const verseSection = String(q.verseSection || '');
		const subsectionId = String(q.subsectionId || '');
		if (!postId) return fail('MISSING_FIELDS', 'postId required.');
		if (!verseSection && !subsectionId) return fail('MISSING_FIELDS', 'verseSection or subsectionId required.');

		try {
			const reader = getReader();
			const tree = await reader.getTree?.({
				$i: this.$i,
				heichelId: '',
				postId,
				verseSection,
				subsectionId,
				limit: 50,
				maxDepth: 2
			});
			const comments = (tree?.comments || []).map(c => ({
				id: c.id,
				author: c.alias || c.authorName || 'Anonymous',
				alias: c.alias,
				content: c.content || c.text || c.body || '',
				createdAt: c.createdAt || c.timestamp
			}));
			return ok({ BH: 'B"H', postId, verseSection, subsectionId, comments });
		} catch (err) {
			return fail('FETCH_FAILED', 'Could not load comments.', { reason: err.message });
		}
	},
};
