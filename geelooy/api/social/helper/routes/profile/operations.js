// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileRouteOperations
 * @description
 * The Awtsmoos gathers profile resolution, reserved identities, activity, and living cards into one service light;
 * Awtsmoos.com keeps route families declarative while shared profile truth remains singular and right.
 *
 * B"H 2026-10-21 (Worker N — pagination): profileOrError honors the shared
 * ProfilePagination spec (postsLimit/postsCursor, commentsLimit/commentsCursor).
 * The assembly fetch deepens past the legacy caps (posts 240 / comments 160)
 * when a page beyond them is requested, and the response gains the additive
 * `pagination` report — no paging params keeps the legacy shape.
 */

const { er } = require('../../general.js');
const { livingProfileCard } = require('../../profile/livingCard.js');
const { aggregateProfile, postsByAlias, commentsByAlias, recentActivity } = require('../../profile/index.js');
const { apiMeta, batchProfiles, profileFeed } = require('../../profile/discovery.js');
const { getQuery, ok, fail, paged, queryAliases } = require('./values.js');
const { pageOptsFrom, fetchLimitFor, applyProfilePagination } = require('../../profileHub/ProfilePagination.js');

const LEGACY_POSTS_FETCH = 240;
const LEGACY_COMMENTS_FETCH = 160;

/**
 * @description Resolves reserved profile identifiers before ordinary aliases; the Awtsmoos keeps compatibility names from colliding while Awtsmoos.com preserves their historic meaning.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} aliasId - Requested profile identifier.
 * @returns {Promise<Object|null>} Reserved-route response, or null when aliasId is ordinary.
 */
async function reservedProfileResponse($i, aliasId) {
	const query = getQuery($i);
	if (aliasId === 'meta') return ok(apiMeta(), { query, extra: { compatibility: 'profile-reserved' } });
	if (aliasId === 'batch') return paged(await batchProfiles({ $i, aliases: queryAliases($i), query }), $i, { limit: 25, max: 50 });
	if (aliasId === 'feed') return paged(await profileFeed({ $i, aliases: queryAliases($i), query }), $i, { limit: 25, max: 100 });
	return null;
}

/**
 * @description Resolves one legacy profile or returns PROFILE_NOT_FOUND; the Awtsmoos distinguishes absence from emptiness while Awtsmoos.com keeps compatibility readable.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} aliasId - Alias whose aggregate profile is requested.
 * @returns {Promise<*>} Reserved response, aggregate profile, or structured not-found error.
 */
async function profileOrError($i, aliasId) {
	const reserved = await reservedProfileResponse($i, aliasId);
	if (reserved) return reserved;
	const opts = pageOptsFrom(getQuery($i) || {});
	const postsFetchLimit = fetchLimitFor(opts.postsLimit, opts.postsCursor, LEGACY_POSTS_FETCH);
	const commentsFetchLimit = fetchLimitFor(opts.commentsLimit, opts.commentsCursor, LEGACY_COMMENTS_FETCH);
	const profile = await aggregateProfile({ $i, aliasId, postsFetchLimit, commentsFetchLimit });
	if (!profile) return er({ code: 'PROFILE_NOT_FOUND', message: `@${aliasId} was not found.` });
	return applyProfilePagination(profile, opts, { postsFetchLimit, commentsFetchLimit });
}

/**
 * @description Builds recent activity from posts and comments in parallel; the Awtsmoos gathers two streams while Awtsmoos.com returns one ordered pulse.
 * @param {Object} options - Activity options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.aliasId - Alias whose activity is requested.
 * @returns {Promise<Object>} Historical success envelope containing recent activity.
 */
async function activityForAlias({ $i, aliasId }) {
	const [posts, comments] = await Promise.all([
		postsByAlias({ $i, aliasId }),
		commentsByAlias({ $i, aliasId })
	]);
	return { success: recentActivity({ posts, comments, limit: 80 }) };
}

/**
 * @description Resolves the modern living profile card with canonical API envelopes; the Awtsmoos gathers many social facets while Awtsmoos.com names absence cleanly.
 * @param {Object} options - Living-card options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @param {string} options.userid - Current user identifier.
 * @param {string} options.aliasId - Alias whose living card is requested.
 * @returns {Promise<Object>} Canonical success or PROFILE_NOT_FOUND failure.
 */
async function livingCardOrError({ $i, userid, aliasId }) {
	const card = await livingProfileCard({ $i, userid, aliasId });
	return card
		? ok(card, { query: getQuery($i) })
		: fail('PROFILE_NOT_FOUND', `@${aliasId} was not found.`);
}

module.exports = { activityForAlias, livingCardOrError, profileOrError, reservedProfileResponse };
