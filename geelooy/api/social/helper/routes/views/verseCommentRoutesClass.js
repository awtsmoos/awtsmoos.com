//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module VerseCommentRoutes
 * @description
 * Lightweight endpoints for verse/section-anchored comments in the reader.
 * - POST /api/social/comments/verse-counts — batch comment counts per anchor
 * - GET /api/social/comments/by-anchor — list comments for one anchor
 */

class VerseCommentRoutes {
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
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
