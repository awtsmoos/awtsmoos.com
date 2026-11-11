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
const { pageOptsFrom, hasPaging, fetchLimitFor, applyProfilePagination } = require('../../profileHub/ProfilePagination.js');
const { logicalKey, readPacked, writePacked } = require('../../packed/socialPacked.js');

const LEGACY_POSTS_FETCH = 48; // B"H 2026-11-11 batch 17: was 240 — a 41s first paint for @asdf (journal: posts=41357ms)
const LEGACY_COMMENTS_FETCH = 48; // batch 17: was 160, same reason

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
const PROFILE_SNAPSHOT_TTL_MS = 120_000;
const profileCache = new Map();
const profileRebuilding = new Set();

async function buildProfileValue($i, aliasId, opts) {
	const postsFetchLimit = fetchLimitFor(opts.postsLimit, opts.postsCursor, LEGACY_POSTS_FETCH);
	const commentsFetchLimit = fetchLimitFor(opts.commentsLimit, opts.commentsCursor, LEGACY_COMMENTS_FETCH);
	const profile = await aggregateProfile({ $i, aliasId, postsFetchLimit, commentsFetchLimit });
	if (!profile) return null;
	return applyProfilePagination(profile, opts, { postsFetchLimit, commentsFetchLimit });
}

function readProfileSnapshot($i, aliasId) {
	try {
		const envelope = readPacked({ $i, shard: 'feed', key: logicalKey(['feed', 'profile', aliasId]) });
		const value = envelope && envelope.op !== 'del' ? envelope.value : null;
		if (value && value.profile) return value;
	} catch (_) { /* snapshot is an optimization only */ }
	return null;
}

function writeProfileSnapshot($i, aliasId, profile) {
	try {
		writePacked({
			$i, shard: 'feed', key: logicalKey(['feed', 'profile', aliasId]),
			value: { kind: 'profileSnapshot', profile, builtAt: Date.now() },
			meta: { kind: 'feed', feedType: 'profileSnapshot' }
		});
	} catch (_) { /* optimization only */ }
}

function rebuildProfileInBackground($i, aliasId, opts) {
	if (profileRebuilding.has(aliasId)) return;
	profileRebuilding.add(aliasId);
	buildProfileValue($i, aliasId, opts)
		.then(value => {
			if (!value) return;
			profileCache.set(aliasId, { at: Date.now(), value });
			writeProfileSnapshot($i, aliasId, value);
		})
		.catch(() => {})
		.finally(() => profileRebuilding.delete(aliasId));
}

async function profileOrError($i, aliasId) {
	const reserved = await reservedProfileResponse($i, aliasId);
	if (reserved) return reserved;
	const opts = pageOptsFrom(getQuery($i) || {});
	if (hasPaging(opts)) {
		const pagedValue = await buildProfileValue($i, aliasId, opts);
		if (!pagedValue) return er({ code: 'PROFILE_NOT_FOUND', message: `@${aliasId} was not found.` });
		return pagedValue;
	}
	// Default view (batch 18): snapshot + stale-while-revalidate. The
	// profile page sends no paging params; it may lag a new post by
	// ~2 minutes instead of paying the full aggregate scan per view.
	const hit = profileCache.get(aliasId);
	if (hit && Date.now() - hit.at < PROFILE_SNAPSHOT_TTL_MS) return hit.value;
	if (hit) {
		rebuildProfileInBackground($i, aliasId, opts);
		return hit.value;
	}
	const snapshot = readProfileSnapshot($i, aliasId);
	if (snapshot) {
		profileCache.set(aliasId, { at: snapshot.builtAt || 0, value: snapshot.profile });
		rebuildProfileInBackground($i, aliasId, opts);
		return snapshot.profile;
	}
	const profile = await buildProfileValue($i, aliasId, opts);
	if (!profile) return er({ code: 'PROFILE_NOT_FOUND', message: `@${aliasId} was not found.` });
	profileCache.set(aliasId, { at: Date.now(), value: profile });
	writeProfileSnapshot($i, aliasId, profile);
	return profile;
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
		postsByAlias({ $i, aliasId, limit: 48 }),
		commentsByAlias({ $i, aliasId, limit: 48 })
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
