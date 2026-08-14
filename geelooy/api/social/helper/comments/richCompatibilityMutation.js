// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCompatibilityMutation
 * @description Legacy create/update/delete shapes map to the dedicated rich store.
 */
const store = require('./richCommentStore.js');
const read = require('./richCompatibilityRead.js');

function object(value) {
	if (!value) return {};
	if (typeof value === 'object') return value;
	try { return JSON.parse(value) || {}; } catch { return {}; }
}

function source($i) {
	return {
		...($i.$_GET || {}),
		...($i.$_POST || {}),
		...($i.$_PUT || {}),
		...($i.$_DELETE || {})
	};
}

function normalizePostBody($i, incoming = source($i)) {
	const dayuh = object(incoming.dayuh);
	$i.$_POST = {
		...incoming,
		content: incoming.content ?? dayuh.content ?? '',
		verseSection: incoming.verseSection ?? dayuh.verseSection ?? dayuh.idx ?? 'root',
		subsectionId: incoming.subsectionId ?? dayuh.subSection ?? dayuh.sub ?? '',
		assets: incoming.assets ?? dayuh.assets ?? dayuh.images ?? [],
		sections: incoming.sections ?? dayuh.sections ?? [],
		links: incoming.links ?? dayuh.links ?? []
	};
	return { incoming, dayuh };
}

async function createRoot({ $i, userid, heichelId, postId, aliasId = '', seriesId = 'root' }) {
	const { incoming, dayuh } = normalizePostBody($i);
	return store.createComment({
		$i,
		userid,
		heichelId,
		postId,
		seriesId,
		parentId: incoming.replyToId || dayuh.replyToId || '',
		aliasId: aliasId || incoming.aliasId
	});
}

async function createReply({ $i, userid, heichelId, postId, commentId, aliasId = '', seriesId = 'root' }) {
	const { incoming } = normalizePostBody($i);
	return store.createComment({
		$i,
		userid,
		heichelId,
		postId,
		seriesId,
		parentId: commentId,
		aliasId: aliasId || incoming.aliasId
	});
}

async function updateLegacy({ $i, userid, heichelId, postId, commentId, aliasId = '' }) {
	const incoming = source($i);
	return store.updateComment({
		$i,
		userid,
		heichelId,
		postId,
		commentId,
		aliasId: aliasId || incoming.aliasId
	});
}

async function deleteAlias({ $i, heichelId, postId, aliasId }) {
	const rows = await read.tree({ $i, heichelId, postId });
	let deleted = 0;
	for (const row of rows.filter(row => read.aliasOf(row) === String(aliasId))) {
		deleted += (await store.deleteOne({
			$i,
			heichelId,
			postId,
			commentId: row.id,
			reason: 'legacy-alias-delete'
		})).deleted;
	}
	return { success: { deleted } };
}

async function deleteAll({ $i, heichelId, postId }) {
	const rows = await read.tree({ $i, heichelId, postId });
	let deleted = 0;
	for (const row of rows.filter(row => !row.parentId)) {
		deleted += (await store.deleteOne({
			$i,
			heichelId,
			postId,
			commentId: row.id,
			reason: 'legacy-post-delete'
		})).deleted;
	}
	return { success: { deleted } };
}

module.exports = {
	createReply,
	createRoot,
	deleteAlias,
	deleteAll,
	normalizePostBody,
	source,
	updateLegacy
};
