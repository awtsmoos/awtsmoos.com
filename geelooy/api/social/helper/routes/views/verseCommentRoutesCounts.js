//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module VerseCommentRoutesCounts
 * @description
 * Prototype-mixin sibling of VerseCommentRoutes: verseCounts method, relocated verbatim.
 */

const { badMethod, fail, isMethod, ok } = require('../profile/values.js');
const { readBody, getReader, getPaths } = require('./verseCommentRoutesHelpers.js');

module.exports = {
	/**
	 * POST /api/social/comments/verse-counts
	 * Body: { postId, anchors: ["phrase:abc", "section:xyz"] }
	 * Returns: { counts: { "phrase:abc": 3, ... } }
	 */
	async verseCounts() {
		if (!isMethod(this.$i, 'POST')) return badMethod('Use POST.');
		const body = await readBody(this.$i);
		const postId = String(body.postId || '');
		const anchors = Array.isArray(body.anchors) ? body.anchors.slice(0, 500).map(String) : [];
		if (!postId) return fail('MISSING_FIELDS', 'postId required.');

		const counts = {};
		try {
			const reader = getReader();
			const paths = getPaths();
			// We don't know heichelId here; try to read via the index paths
			// by scanning the post's comment index. Fallback: use getTree per anchor.
			for (const anchor of anchors) {
				const [kind, ...rest] = anchor.split(':');
				const anchorId = rest.join(':');
				try {
					const params = kind === 'section'
						? { postId, subsectionId: anchorId }
						: { postId, verseSection: anchorId };
					// Use a lightweight count via the reader's indexed lookup
					const tree = await reader.getTree?.({
						$i: this.$i,
						heichelId: '',
						postId,
						...params,
						limit: 1,
						maxDepth: 0
					});
					counts[anchor] = tree?.total || (Array.isArray(tree?.comments) ? tree.comments.length : 0);
				} catch {
					counts[anchor] = 0;
				}
			}
		} catch (err) {
			return fail('COUNTS_FAILED', 'Could not load counts.', { reason: err.message });
		}
		return ok({ BH: 'B"H', postId, counts });
	},
};
