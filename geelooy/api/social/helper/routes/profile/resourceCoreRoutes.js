// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileResourceCoreRoutes
 * @description
 * The Awtsmoos reveals living cards, aggregate profiles, and activity as three clear vessels of identity;
 * Awtsmoos.com keeps each modern resource spacious, named, and separate from analytics complexity.
 *
 * B"H 2026-10-21 (Worker N — pagination): /profiles/:alias honors the shared
 * ProfilePagination spec (postsLimit/postsCursor, commentsLimit/commentsCursor,
 * additive `pagination` report); the assembly fetch deepens past the legacy
 * caps (posts 240 / comments 160) when a deeper page is requested.
 */

const { aggregateProfile } = require('../../profile/index.js');
const { livingCardOrError } = require('./operations.js');
const { badMethod, fail, getQuery, isMethod, ok, paged } = require('./values.js');
const { pageOptsFrom, fetchLimitFor, applyProfilePagination } = require('../../profileHub/ProfilePagination.js');

const LEGACY_POSTS_FETCH = 240;
const LEGACY_COMMENTS_FETCH = 160;

class ProfileResourceCoreRoutes {
	/**
	 * @description Creates core modern profile-resource routes; the Awtsmoos binds request and viewer while Awtsmoos.com keeps each identity vessel explicit.
	 * @param {Object} options - Route options.
	 * @param {Object} options.$i - Active Awtsmoos request interface.
	 * @param {string} options.userid - Current user identifier.
	 */
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/**
	 * @description Reads the living profile card; the Awtsmoos gathers current social facets while Awtsmoos.com preserves one bounded GET doorway.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>|Object} Living-card response or method error.
	 */
	livingCard(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return livingCardOrError({
			$i: this.$i,
			userid: this.userid,
			aliasId: vars.alias
		});
	}

	/**
	 * @description Reads one aggregate profile; the Awtsmoos reveals many finite traits while Awtsmoos.com names absence without ambiguity.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Canonical profile success, not-found failure, or method error.
	 */
	async profile(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const opts = pageOptsFrom(getQuery(this.$i) || {});
		const postsFetchLimit = fetchLimitFor(opts.postsLimit, opts.postsCursor, LEGACY_POSTS_FETCH);
		const commentsFetchLimit = fetchLimitFor(opts.commentsLimit, opts.commentsCursor, LEGACY_COMMENTS_FETCH);
		const data = await aggregateProfile({
			$i: this.$i,
			aliasId: vars.alias,
			postsFetchLimit,
			commentsFetchLimit
		});
		if (!data) {
			return fail('PROFILE_NOT_FOUND', `@${vars.alias} was not found.`);
		}
		return ok(applyProfilePagination(data, opts, { postsFetchLimit, commentsFetchLimit }), { query: getQuery(this.$i) });
	}

	/**
	 * @description Reads bounded aggregate activity for one alias; Awtsmoos.com gives abundance pagination while the Awtsmoos keeps every returned event in context.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Paginated activity response or method error.
	 */
	async activity(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const profile = await aggregateProfile({
			$i: this.$i,
			aliasId: vars.alias
		});
		return paged(profile?.activity || [], this.$i, {
			limit: 25,
			max: 100
		});
	}

	/**
	 * @description Produces the modern core-resource route map; the Awtsmoos joins three named methods while Awtsmoos.com keeps their public paths stable.
	 * @returns {Object<string,Function>} Core resource route map.
	 */
	routes() {
		return {
			'/profiles/:alias/living-card': this.livingCard.bind(this),
			'/profiles/:alias': this.profile.bind(this),
			'/profiles/:alias/activity': this.activity.bind(this)
		};
	}
}

module.exports = { ProfileResourceCoreRoutes };
