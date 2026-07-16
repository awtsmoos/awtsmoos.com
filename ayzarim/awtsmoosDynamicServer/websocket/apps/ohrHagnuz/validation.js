//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file validation.js
 * @description Measures every authenticated road, movement, and combat command.
 * The Awtsmoos recreates bounded vessels from ordered speech; Awtsmoos.com
 * accepts only names, slots, tokens, steps, and attacks whose shapes are explicit.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { DEFAULT_ROAD_ID } = require('./protocol.js');
const NAME_PATTERN = /^[A-Za-z0-9 '\-]{1,24}$/;
const SLOT_PATTERN = /^[a-z0-9-]{1,32}$/;

function validateJoin(payload = {}) {
	return {
		displayName: safeName(payload.displayName),
		glyph: safeGlyph(payload.glyph),
		origin: safeOrigin(payload.origin),
		roadId: safeRoad(payload.roadId),
		slot: safeSlot(payload.slot),
		ticket: safeToken(payload.ticket, false)
	};
}

function validateResume(payload = {}) {
	return {
		reconnectToken: safeToken(payload.reconnectToken, true),
		roadId: safeRoad(payload.roadId),
		slot: safeSlot(payload.slot)
	};
}

function validateMove(payload = {}) {
	const dx = Number(payload.dx);
	const dy = Number(payload.dy);
	const movementSequence = Number(payload.movementSequence);
	if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) + Math.abs(dy) !== 1) {
		throw error('INVALID_MOVEMENT', 'Movement must be one cardinal tile.');
	}
	if (!Number.isSafeInteger(movementSequence) || movementSequence < 1) {
		throw error('INVALID_MOVEMENT_SEQUENCE', 'Movement sequence must be positive.');
	}
	return { dx, dy, movementSequence };
}

function validateAttack(payload = {}) {
	const attackSequence = Number(payload.attackSequence);
	if (!Number.isSafeInteger(attackSequence) || attackSequence < 1) {
		throw error('INVALID_ATTACK_SEQUENCE', 'Attack sequence must be positive.');
	}
	if (payload.targetId !== 'veil-wisp') {
		throw error('UNKNOWN_COMBAT_TARGET', 'The requested target is unavailable.');
	}
	return { attackSequence, targetId: 'veil-wisp' };
}

function validateInteraction(payload = {}) {
	if (payload.targetId !== 'road-lamp') {
		throw error('UNKNOWN_INTERACTION', 'The requested shared interaction is unavailable.');
	}
	return { targetId: 'road-lamp' };
}

function safeName(value) {
	const name = String(value || '').trim();
	if (!NAME_PATTERN.test(name)) throw error('INVALID_DISPLAY_NAME', 'Display name is invalid.');
	return name;
}

function safeGlyph(value) {
	const glyph = Array.from(String(value || 'א').trim()).slice(0, 1).join('');
	if (!glyph) throw error('INVALID_GLYPH', 'Glyph must contain one visible symbol.');
	return glyph;
}

function safeSlot(value) {
	const slot = String(value || 'primary').trim().toLowerCase();
	if (!SLOT_PATTERN.test(slot)) throw error('INVALID_CHARACTER_SLOT', 'Character slot is invalid.');
	return slot;
}

function safeRoad(value) {
	const roadId = String(value || DEFAULT_ROAD_ID);
	if (roadId !== DEFAULT_ROAD_ID) throw error('UNKNOWN_ROAD', 'The requested road is unavailable.');
	return roadId;
}

function safeOrigin(value) {
	try {
		return value ? new URL(String(value)).origin : '';
	} catch {
		throw error('INVALID_ORIGIN', 'Journey origin is invalid.');
	}
}

function safeToken(value, required) {
	const token = String(value || '');
	if (required && token.length < 32) throw error('INVALID_TOKEN', 'Reconnect token is invalid.');
	if (token && token.length > 256) throw error('INVALID_TOKEN', 'Credential is too long.');
	return token;
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	validateAttack,
	validateInteraction,
	validateJoin,
	validateMove,
	validateResume
};
