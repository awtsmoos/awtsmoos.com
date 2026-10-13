// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerseCommentRoutes
 * @description
 * Lightweight endpoints for verse/section-anchored comments in the reader.
 * - POST /api/social/comments/verse-counts — batch comment counts per anchor
 * - GET /api/social/comments/by-anchor — list comments for one anchor
 */

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

// Lazy-load to avoid circular deps
function getReader() {
	return require('../../comments/richCommentReader.js');
}
function getPaths() {
	return require('../../comments/richCommentPaths.js');
}

class VerseCommentRoutes {
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

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
	}

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
	}

	routes() {
		return {
			'/comments/verse-counts': this.verseCounts.bind(this),
			'/comments/by-anchor': this.byAnchor.bind(this)
		};
	}
}

function createVerseCommentRoutes({ $i, userid } = {}) {
	return new VerseCommentRoutes({ $i, userid }).routes();
}

module.exports = { VerseCommentRoutes, createVerseCommentRoutes };
