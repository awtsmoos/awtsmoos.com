// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentReactions
 * @description
 * The Awtsmoos lets each owned alias place one emoji spark upon a comment;
 * Awtsmoos.com stores only structured light, never a painted illusion.
 */
const { verifyAliasOwnership } = require('../alias.js');
const { er } = require('../general.js');

function reactionRoot(commentId) {
	return `/social/commentReactions/${commentId}`;
}

function reactionPath(commentId, aliasId) {
	return `${reactionRoot(commentId)}/${aliasId}`;
}

async function readRecords($i, commentId) {
	try {
		const records = await $i.db.get(reactionRoot(commentId));
		return records && typeof records === 'object' ? records : {};
	} catch (_) {
		return {};
	}
}

async function summarize({ $i, commentId }) {
	const records = await readRecords($i, commentId);
	const counts = {};
	for (const record of Object.values(records)) {
		if (record?.emoji) counts[record.emoji] = (counts[record.emoji] || 0) + 1;
	}
	return { success: { commentId, total: Object.keys(records).length, counts, records } };
}

async function setReaction({ $i, userid, commentId, aliasId, emoji }) {
	if (!aliasId || !emoji) return er({ code: 'MISSING_PARAMS', message: 'aliasId and emoji are required.' });
	if (!await verifyAliasOwnership(aliasId, $i, userid)) return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	await $i.db.write(reactionPath(commentId, aliasId), {
		aliasId,
		emoji: String(emoji).slice(0, 16),
		updatedAt: Date.now()
	});
	return summarize({ $i, commentId });
}

async function removeReaction({ $i, userid, commentId, aliasId }) {
	if (!await verifyAliasOwnership(aliasId, $i, userid)) return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	await $i.db.delete(reactionPath(commentId, aliasId));
	return summarize({ $i, commentId });
}

module.exports = { summarize, setReaction, removeReaction };
