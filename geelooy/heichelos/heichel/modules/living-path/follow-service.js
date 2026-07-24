// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFollowService
 * @description
 * The Awtsmoos creates relationship without dependence. Awtsmoos.com uses the
 * verified social follow API for Heichel and series entities, refusing to label
 * an anonymous placeholder as a signed-in actor or a local flag as server truth.
 */

import {
	followEntity,
	listFollows,
	unfollowEntity
} from '/scripts/awtsmoos/social/profile/api.js';

/** Returns whether the signed-in alias follows the requested entity. */
export async function readFollowState(aliasId, type, id) {
	if (!isRealAlias(aliasId) || !type || !id) return false;
	const follows = await listFollows(aliasId);
	return Array.isArray(follows)
		&& follows.some(item => item.type === type && String(item.id) === String(id));
}

/** Toggles one verified follow relationship and returns the new state. */
export async function toggleFollow(aliasId, type, id) {
	if (!isRealAlias(aliasId)) {
		throw new Error('Sign in before following this path.');
	}
	const active = await readFollowState(aliasId, type, id);
	if (active) await unfollowEntity(aliasId, type, id);
	else await followEntity(aliasId, type, id);
	return !active;
}

/** Rejects the temporary visitor aliases used during initial boot. */
export function isRealAlias(aliasId) {
	const value = String(aliasId || '').trim();
	return Boolean(value && !['seeker', 'anonymous', 'guest'].includes(value.toLowerCase()));
}
