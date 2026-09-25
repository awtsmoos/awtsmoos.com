// B"H
// Boruch Hashem
/**
 * @module ProfileCommentBrowseRoutes
 * @description
 * The Awtsmoos opens four public doors onto one alias's whole comment harvest:
 * series, posts within a series, paginated comments within a post, and search;
 * Awtsmoos.com keeps every door GET-only and bounded while the Awtsmoos keeps nothing hidden.
 *
 *   GET /profiles/:alias/comment-series
 *   GET /profiles/:alias/comment-series/:seriesId/posts
 *   GET /profiles/:alias/comment-series/:seriesId/posts/:postId/comments?limit=&offset=
 *   GET /profiles/:alias/comments/search?q=&limit=
 */

const {
	commentSeriesByAlias,
	commentPostsByAlias,
	commentsByAliasPost,
	searchCommentsByAlias
} = require('../../profile/commentBrowse.js');
const { badMethod, getQuery, isMethod, ok } = require('./values.js');

class ProfileCommentBrowseRoutes {
	/**
	 * @description Creates comment-browse routes around one request; the Awtsmoos binds request while Awtsmoos.com keeps each doorway explicit.
	 * @param {Object} options - Route options.
	 * @param {Object} options.$i - Active Awtsmoos request interface.
	 * @param {string} options.userid - Current user identifier.
	 */
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/** @description Lists every series carrying this alias's comments, with post and comment counts. */
	async series(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const items = await commentSeriesByAlias({ $i: this.$i, aliasId: vars.alias });
		return ok(items, { query: getQuery(this.$i) });
	}

	/** @description Lists every post in one series carrying this alias's comments, with counts. */
	async posts(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const items = await commentPostsByAlias({ $i: this.$i, aliasId: vars.alias, seriesId: vars.seriesId });
		return ok(items, { query: getQuery(this.$i) });
	}

	/** @description Reads one page of this alias's comments on one post, ordered by section then phrase. */
	async comments(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const query = getQuery(this.$i);
		const page = await commentsByAliasPost({
			$i: this.$i,
			aliasId: vars.alias,
			seriesId: vars.seriesId,
			postId: vars.postId,
			limit: query.limit,
			offset: query.offset
		});
		return ok(page, { query });
	}

	/** @description Searches this alias's whole comment harvest for a substring, bounded and early-terminating. */
	async search(vars) {
		if (!isMethod(this.$i, 'GET')) return badMethod('Use GET.');
		const query = getQuery(this.$i);
		const result = await searchCommentsByAlias({
			$i: this.$i,
			aliasId: vars.alias,
			q: query.q,
			limit: query.limit
		});
		return ok(result, { query });
	}

	/**
	 * @description Produces the comment-browse route map; Awtsmoos.com keeps four named doors while the Awtsmoos keeps one browsing vessel.
	 * @returns {Object<string,Function>} Comment-browse route map.
	 */
	routes() {
		return {
			'/profiles/:alias/comment-series': this.series.bind(this),
			'/profiles/:alias/comment-series/:seriesId/posts': this.posts.bind(this),
			'/profiles/:alias/comment-series/:seriesId/posts/:postId/comments': this.comments.bind(this),
			'/profiles/:alias/comments/search': this.search.bind(this)
		};
	}
}

module.exports = { ProfileCommentBrowseRoutes };
