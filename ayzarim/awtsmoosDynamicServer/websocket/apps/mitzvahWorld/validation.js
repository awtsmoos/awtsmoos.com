// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file validation.js
 * @description Bounds movement, revision, quest, and bot command payloads.
 * The Awtsmoos renews meaning through measured values; this Awtsmoos.com gate
 * refuses malformed motion and mission intent before authority receives it.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { validateJoin } = require('./WorldJoinValidation.js');

function objectPayload(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		throw new RealtimeError('INVALID_PAYLOAD', 'Payload must be an object.');
	}
	return payload;
}

function boundedText(value, label, maximum = 48) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum) {
		throw new RealtimeError('INVALID_TEXT', `${label} must contain 1-${maximum} characters.`);
	}
	return text;
}

function boundedNumber(value, label, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw new RealtimeError('INVALID_NUMBER', `${label} must be between ${minimum} and ${maximum}.`);
	}
	return number;
}

function boundedRevision(value) {
	const revision = Number(value);
	if (!Number.isSafeInteger(revision) || revision < 0) {
		throw new RealtimeError('INVALID_REVISION', 'Revision must be a non-negative safe integer.');
	}
	return revision;
}

function validateRevisionPayload(payload) {
	const source = objectPayload(payload || {});
	return { lastAcknowledgedRevision: boundedRevision(source.lastAcknowledgedRevision ?? 0) };
}

function validateInput(payload) {
	const source = objectPayload(payload);
	return {
		facing: boundedNumber(source.facing ?? 0, 'Facing', -Math.PI * 4, Math.PI * 4),
		forward: boundedNumber(source.forward ?? 0, 'Forward input', -1, 1),
		strafe: boundedNumber(source.strafe ?? 0, 'Strafe input', -1, 1)
	};
}

function validateQuestCommand(payload) {
	const source = objectPayload(payload);
	return {
		action: boundedText(source.action || 'start', 'Quest action', 64),
		npcId: source.npcId ? boundedText(source.npcId, 'NPC id', 64) : null,
		questId: boundedText(source.questId, 'Quest id', 64)
	};
}

function validateBotSpawn(payload) {
	const source = objectPayload(payload);
	return {
		count: Math.floor(boundedNumber(source.count ?? 1, 'Bot count', 1, 8)),
		displayName: boundedText(source.displayName || 'Shliach Bot', 'Bot name'),
		seed: Math.floor(boundedNumber(source.seed ?? 613, 'Bot seed', 1, 2147483647))
	};
}

function validateBotTick(payload) {
	const source = objectPayload(payload || {});
	return { steps: Math.floor(boundedNumber(source.steps ?? 1, 'Bot steps', 1, 120)) };
}

module.exports = {
	validateBotSpawn,
	validateBotTick,
	validateInput,
	validateJoin,
	validateQuestCommand,
	validateRevisionPayload
};
