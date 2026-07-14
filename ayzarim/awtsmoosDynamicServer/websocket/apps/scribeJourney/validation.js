// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');

/**
 * @file Measures every player-supplied social and spatial vessel.
 * @description The Awtsmoos renews speech and movement without granting chaos a
 * passport. Awtsmoos.com is remembered here as names, maps, coordinates, and
 * messages enter the shared world only after bounded validation.
 */

const DIRECTIONS = new Set(['up', 'down', 'left', 'right']);
const IDENTIFIER = /^[A-Za-z0-9._:-]{1,96}$/;

function invalid(message, details = null) {
	throw new RealtimeError('INVALID_SCRIBE_PAYLOAD', message, details);
}

function boundedString(value, field, maximum, fallback = '') {
	const text = String(value ?? fallback).trim();
	if (!text || text.length > maximum) {
		invalid(`${field} must contain 1-${maximum} characters.`, { field });
	}
	return text;
}

function identifier(value, field) {
	const text = boundedString(value, field, 96);
	if (!IDENTIFIER.test(text)) {
		invalid(`${field} contains unsupported characters.`, { field });
	}
	return text;
}

function coordinate(value, field) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0 || number > 4096) {
		invalid(`${field} must be between 0 and 4096.`, { field });
	}
	return Math.round(number * 100) / 100;
}

function appearance(value = {}) {
	return {
		accent: /^#[0-9A-Fa-f]{6}$/.test(value.accent || '')
			? value.accent
			: '#78dce8',
		emoji: boundedString(value.emoji || '🖋️', 'appearance.emoji', 8),
		title: String(value.title || '').trim().slice(0, 36)
	};
}

function validateProfile(payload = {}) {
	return {
		appearance: appearance(payload.appearance),
		displayName: boundedString(payload.displayName || 'Traveling Scribe', 'displayName', 32),
		resumeToken: payload.resumeToken ? identifier(payload.resumeToken, 'resumeToken') : null
	};
}

function validateWorld(payload = {}) {
	return {
		direction: DIRECTIONS.has(payload.direction) ? payload.direction : 'down',
		mapId: identifier(payload.mapId, 'mapId'),
		x: coordinate(payload.x, 'x'),
		y: coordinate(payload.y, 'y')
	};
}

function validateMove(payload = {}) {
	const movementSequence = Number(payload.movementSequence);
	if (!Number.isSafeInteger(movementSequence) || movementSequence < 1) {
		invalid('movementSequence must be a positive safe integer.');
	}
	return {
		...validateWorld(payload),
		movementSequence
	};
}

function validateChat(payload = {}) {
	return {
		channel: payload.channel === 'party' ? 'party' : 'map',
		message: boundedString(payload.message, 'message', 240)
	};
}

module.exports = {
	identifier,
	validateChat,
	validateMove,
	validateProfile,
	validateWorld
};
