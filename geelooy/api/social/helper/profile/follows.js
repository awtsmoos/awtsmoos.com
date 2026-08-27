// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileFollows
 * @description
 * The Awtsmoos reveals relationship mutation only through an owned public identity.
 * Awtsmoos.com keeps public reads open while every follow/unfollow write proves the
 * authenticated user owns the acting alias before touching either side of the graph.
 */
const { verifyAliasOwnership } = require('../alias.js');
const { er } = require('../general.js');
const { cleanText } = require('./sanitize.js');

function followKey(aliasId) {
	return `/social/aliases/${aliasId}/following`;
}
function followerKey(type, id) {
	return `/social/followers/${type}/${id}`;
}
function normalize(input = {}) {
	const type = cleanText(input.type || input.targetType || 'alias', 40) || 'alias';
	const id = cleanText(input.id || input.targetId || input.aliasId || '', 160);
	return {
		type,
		id,
		followedAt: Number(input.followedAt || Date.now()) || Date.now(),
		notifications: input.notifications !== 'off'
	};
}
function authenticatedUserId($i, userid = '') {
	return userid || $i?.request?.user?.info?.userId || '';
}
async function authorizeMutation({ $i, aliasId, userid }) {
	const userId = authenticatedUserId($i, userid);
	if (!userId) {
		return er({ code: 'LOGIN_REQUIRED', message: 'Login required.' });
	}
	const owns = await verifyAliasOwnership(aliasId, $i, userId);
	if (!owns) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	}
	return null;
}
async function listFollows({ $i, aliasId }) {
	const stored = await $i.db.get(followKey(aliasId)).catch(() => []);
	return Array.isArray(stored) ? stored : [];
}
async function follow({ $i, aliasId, input, userid }) {
	const denial = await authorizeMutation({ $i, aliasId, userid });
	if (denial) return denial;
	const item = normalize(input);
	if (!item.id) return er({ code: 'BAD_TARGET', message: 'Missing follow target.' });
	const current = await listFollows({ $i, aliasId });
	const next = [item, ...current.filter(record => !(record.type === item.type && record.id === item.id))].slice(0, 1000);
	await $i.db.write(followKey(aliasId), next);
	const storedFollowers = await $i.db.get(followerKey(item.type, item.id)).catch(() => []);
	const followerList = Array.isArray(storedFollowers) ? storedFollowers : [];
	await $i.db.write(followerKey(item.type, item.id), [aliasId, ...followerList.filter(id => id !== aliasId)].slice(0, 5000));
	return { success: item, count: next.length };
}
async function unfollow({ $i, aliasId, input, userid }) {
	const denial = await authorizeMutation({ $i, aliasId, userid });
	if (denial) return denial;
	const item = normalize(input);
	const current = await listFollows({ $i, aliasId });
	const next = current.filter(record => !(record.type === item.type && record.id === item.id));
	await $i.db.write(followKey(aliasId), next);
	const storedFollowers = await $i.db.get(followerKey(item.type, item.id)).catch(() => []);
	const followerList = Array.isArray(storedFollowers) ? storedFollowers : [];
	await $i.db.write(followerKey(item.type, item.id), followerList.filter(id => id !== aliasId));
	return { success: true, count: next.length };
}
async function followers({ $i, type, id }) {
	const stored = await $i.db.get(followerKey(type, id)).catch(() => []);
	return Array.isArray(stored) ? stored : [];
}
module.exports = {
	listFollows,
	follow,
	unfollow,
	followers,
	authenticatedUserId,
	authorizeMutation
};
