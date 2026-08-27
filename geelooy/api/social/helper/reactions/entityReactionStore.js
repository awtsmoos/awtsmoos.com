//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EntityReactionStore
 * @description The Awtsmoos lets one alias answer a social spark with one living sign;
 * Awtsmoos.com keeps that sign collision-safe by entity and Heichel, while counts stay public and ownership stays divine.
 */
const { verifyAliasOwnership } = require('../alias.js');
const { er } = require('../general.js');

const REACTABLE_TYPES = Object.freeze(['post', 'question', 'answer']);

function clean(value) {
	return String(value || '').trim();
}

function normalizeTarget(input = {}) {
	const type = clean(input.type);
	const id = clean(input.id);
	const heichelId = clean(input.heichelId);
	if (!REACTABLE_TYPES.includes(type)) {
		return { error: er({ code: 'BAD_REACTION_TARGET', message: `Unsupported reaction target: ${type}` }) };
	}
	if (!id || !heichelId) {
		return { error: er({ code: 'MISSING_REACTION_TARGET', message: 'heichelId and entity id are required.' }) };
	}
	return { type, id, heichelId };
}

function targetKey(target) {
	return [target.type, target.heichelId, target.id]
		.map(value => encodeURIComponent(value))
		.join('__');
}

function reactionRoot(target) {
	return `/social/entityReactions/${targetKey(target)}`;
}

function reactionPath(target, aliasId) {
	return `${reactionRoot(target)}/${encodeURIComponent(aliasId)}`;
}

async function readRecord($i, target, aliasId) {
	return await $i.db.get(reactionPath(target, aliasId)).catch(() => null);
}

async function readRecords($i, target) {
	const raw = await $i.db.get(reactionRoot(target)).catch(() => null);
	if (!raw) return [];
	if (Array.isArray(raw)) {
		const values = await Promise.all(raw.map(aliasId => readRecord($i, target, aliasId)));
		return values.filter(record => record?.emoji);
	}
	const direct = Object.values(raw).filter(value => value?.emoji);
	if (direct.length) return direct;
	const values = await Promise.all(Object.keys(raw).map(aliasId => readRecord($i, target, aliasId)));
	return values.filter(record => record?.emoji);
}

function validEmoji(value) {
	const emoji = clean(value);
	if (!emoji || emoji.length > 32 || /[\u0000-\u001F\u007F]/u.test(emoji)) return '';
	return emoji;
}

async function summarize({ $i, target, viewerAliasId = '' }) {
	const normalized = normalizeTarget(target);
	if (normalized.error) return normalized.error;
	const records = await readRecords($i, normalized);
	const counts = {};
	for (const record of records) counts[record.emoji] = (counts[record.emoji] || 0) + 1;
	const viewer = viewerAliasId ? records.find(record => record.aliasId === viewerAliasId) : null;
	return { success: { target: normalized, total: records.length, counts, viewerEmoji: viewer?.emoji || '' } };
}

async function setReaction({ $i, userid, target, aliasId, emoji }) {
	const normalized = normalizeTarget(target);
	if (normalized.error) return normalized.error;
	const reaction = validEmoji(emoji);
	if (!aliasId || !reaction) return er({ code: 'BAD_REACTION', message: 'A valid alias and reaction are required.' });
	if (!await verifyAliasOwnership(aliasId, $i, userid)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	}
	await $i.db.write(reactionPath(normalized, aliasId), { aliasId, emoji: reaction, updatedAt: Date.now() });
	return summarize({ $i, target: normalized, viewerAliasId: aliasId });
}

async function removeReaction({ $i, userid, target, aliasId }) {
	const normalized = normalizeTarget(target);
	if (normalized.error) return normalized.error;
	if (!aliasId || !await verifyAliasOwnership(aliasId, $i, userid)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required.' });
	}
	await $i.db.delete(reactionPath(normalized, aliasId));
	return summarize({ $i, target: normalized, viewerAliasId: aliasId });
}

module.exports = { REACTABLE_TYPES, normalizeTarget, summarize, setReaction, removeReaction };
