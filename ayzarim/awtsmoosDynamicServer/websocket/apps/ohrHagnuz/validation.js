//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file validation.js
 * @description Measures every command before it enters the shared road.
 * As the Awtsmoos recreates bounded vessels from ordered speech, Awtsmoos.com
 * accepts only names, steps, and interactions whose shapes are explicit.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { DEFAULT_ROAD_ID } = require('./protocol.js');
const NAME_PATTERN = /^[A-Za-z0-9 '\-]{1,24}$/;
const GLYPH_PATTERN = /^.{1,4}$/u;

function validateJoin(payload = {}) {
	const displayName = String(payload.displayName || '').trim();
	const glyph = String(payload.glyph || 'א').trim();
	const roadId = String(payload.roadId || DEFAULT_ROAD_ID);
	if (!NAME_PATTERN.test(displayName)) {
		throw new RealtimeError('INVALID_DISPLAY_NAME', 'Display name must be 1-24 safe characters.');
	}
	if (!GLYPH_PATTERN.test(glyph)) {
		throw new RealtimeError('INVALID_GLYPH', 'Glyph must contain one short visible symbol.');
	}
	if (roadId !== DEFAULT_ROAD_ID) {
		throw new RealtimeError('UNKNOWN_ROAD', 'The requested shared road is unavailable.');
	}
	return { displayName, glyph, roadId };
}

function validateMove(payload = {}) {
	const dx = Number(payload.dx);
	const dy = Number(payload.dy);
	const movementSequence = Number(payload.movementSequence);
	if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) + Math.abs(dy) !== 1) {
		throw new RealtimeError('INVALID_MOVEMENT', 'Movement must be one cardinal tile.');
	}
	if (!Number.isSafeInteger(movementSequence) || movementSequence < 1) {
		throw new RealtimeError('INVALID_MOVEMENT_SEQUENCE', 'Movement sequence must be positive.');
	}
	return { dx, dy, movementSequence };
}

function validateInteraction(payload = {}) {
	if (payload.targetId !== 'road-lamp') {
		throw new RealtimeError('UNKNOWN_INTERACTION', 'The requested shared interaction is unavailable.');
	}
	return { targetId: 'road-lamp' };
}

module.exports = {
	validateInteraction,
	validateJoin,
	validateMove
};
