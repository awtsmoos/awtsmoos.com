// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldJoinValidation.js
 * @description Validates names, worlds, resume tokens, and idempotent join keys.
 * The Awtsmoos renews arrival without multiplying identity; this Awtsmoos.com
 * gate accepts only bounded opaque keys before a player is revealed in the world.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const WORLD_ID_PATTERN = /^[a-z][a-z0-9-]{1,47}$/;
const OPAQUE_KEY_PATTERN = /^[A-Za-z0-9_-]{24,128}$/;

function validateJoin(payload) {
	const source = requireObject(payload);
	const resumeToken = source.resumeToken
		? opaqueKey(source.resumeToken, 'INVALID_SESSION_TOKEN', 'Reconnect token')
		: null;
	const joinKey = source.joinKey
		? opaqueKey(source.joinKey, 'INVALID_JOIN_KEY', 'Join key')
		: null;
	const worldId = source.worldId === undefined && resumeToken
		? null
		: String(source.worldId || 'main-village').trim();
	if (worldId !== null && !WORLD_ID_PATTERN.test(worldId)) {
		throw new RealtimeError('INVALID_WORLD', 'World id must be a safe lowercase identifier.');
	}
	return {
		displayName: resumeToken && !source.displayName
			? null
			: boundedText(source.displayName, 'Display name', 48),
		joinKey,
		lastAcknowledgedRevision: source.lastAcknowledgedRevision === undefined
			? null
			: boundedRevision(source.lastAcknowledgedRevision),
		resumeToken,
		worldId
	};
}

function opaqueKey(value, code, label) {
	const text = String(value || '').trim();
	if (!OPAQUE_KEY_PATTERN.test(text)) {
		throw new RealtimeError(code, `${label} is malformed.`);
	}
	return text;
}

function boundedRevision(value) {
	const revision = Number(value);
	if (!Number.isSafeInteger(revision) || revision < 0) {
		throw new RealtimeError('INVALID_REVISION', 'Revision must be a non-negative safe integer.');
	}
	return revision;
}

function boundedText(value, label, maximum) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum) {
		throw new RealtimeError('INVALID_TEXT', `${label} must contain 1-${maximum} characters.`);
	}
	return text;
}

function requireObject(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		throw new RealtimeError('INVALID_PAYLOAD', 'Payload must be an object.');
	}
	return payload;
}

module.exports = {
	validateJoin
};
