// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentReactions
 * @description
 * The Awtsmoos gathers child reaction records from their true paths;
 * Awtsmoos.com turns every alias spark into an accurate emoji count.
 */
const { verifyAliasOwnership } = require('../alias.js');
const { er } = require('../general.js');

function reactionRoot(commentId) {
	return `/social/commentReactions/${commentId}`;
}

function reactionPath(commentId, aliasId) {
	return `${reactionRoot(commentId)}/${aliasId}`;
}

async function readChild($i, commentId, aliasId) {
	try {
		return await $i.db.get(reactionPath(commentId, aliasId));
	} catch (_) {
		return null;
	}
}

async function hydrateArray($i, commentId, aliasIds) {
	const records = await Promise.all(
		aliasIds.map(aliasId => readChild($i, commentId, aliasId))
	);
	return records.filter(record => record?.emoji);
}

async function normalizeRecords($i, commentId, raw) {
	if (Array.isArray(raw)) {
		return hydrateArray($i, commentId, raw);
	}
	if (!raw || typeof raw !== 'object') {
		return [];
	}
	const entries = Object.entries(raw);
	const direct = entries
		.map(([, value]) => value)
		.filter(value => value?.emoji);
	if (direct.length) {
		return direct;
	}
	return hydrateArray(
		$i,
		commentId,
		entries.map(([aliasId]) => aliasId)
	);
}

async function readRecords($i, commentId) {
	try {
		const raw = await $i.db.get(reactionRoot(commentId));
		return await normalizeRecords($i, commentId, raw);
	} catch (_) {
		return [];
	}
}

async function summarize({ $i, commentId }) {
	const records = await readRecords($i, commentId);
	const counts = {};
	for (const record of records) {
		counts[record.emoji] = (counts[record.emoji] || 0) + 1;
	}
	return {
		success: {
			commentId,
			total: records.length,
			counts,
			records
		}
	};
}

async function setReaction({ $i, userid, commentId, aliasId, emoji }) {
	if (!aliasId || !emoji) {
		return er({ code: 'MISSING_PARAMS', message: 'aliasId and emoji are required.' });
	}
	if (!await verifyAliasOwnership(aliasId, $i, userid)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	}
	await $i.db.write(reactionPath(commentId, aliasId), {
		aliasId,
		emoji: String(emoji).slice(0, 16),
		updatedAt: Date.now()
	});
	return summarize({ $i, commentId });
}

async function removeReaction({ $i, userid, commentId, aliasId }) {
	if (!await verifyAliasOwnership(aliasId, $i, userid)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	}
	await $i.db.delete(reactionPath(commentId, aliasId));
	return summarize({ $i, commentId });
}

module.exports = { summarize, setReaction, removeReaction };
