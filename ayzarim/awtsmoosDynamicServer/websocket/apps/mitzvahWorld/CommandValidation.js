// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CommandValidation.js
 * @description Bounds identifiers, numbers, operations, chat, and social commands.
 * The Awtsmoos renews meaning through measured letters and values; Awtsmoos.com
 * refuses malformed social intent before it enters authoritative world state.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9:-]{0,63}$/;

function commandPayload(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		throw new RealtimeError('INVALID_PAYLOAD', 'Command payload must be an object.');
	}
	return payload;
}

function identifier(value, label = 'Identifier') {
	const text = String(value || '').trim();
	if (!IDENTIFIER_PATTERN.test(text)) {
		throw new RealtimeError('INVALID_IDENTIFIER', `${label} is malformed.`);
	}
	return text;
}

function boundedText(value, label, maximum = 160) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum) {
		throw new RealtimeError('INVALID_TEXT', `${label} must contain 1-${maximum} characters.`);
	}
	return text;
}

function boundedNumber(value, label, minimum = -2048, maximum = 2048) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw new RealtimeError(
			'INVALID_NUMBER',
			`${label} must be a finite number between ${minimum} and ${maximum}.`
		);
	}
	return number;
}

function oneOf(value, allowed, label) {
	const text = String(value || '').trim();
	if (!allowed.includes(text)) {
		throw new RealtimeError('INVALID_OPERATION', `${label} is unavailable.`);
	}
	return text;
}

function optionalIdentifier(value, label) {
	return value === undefined || value === null || value === ''
		? null
		: identifier(value, label);
}

module.exports = {
	boundedNumber,
	boundedText,
	commandPayload,
	identifier,
	oneOf,
	optionalIdentifier
};
