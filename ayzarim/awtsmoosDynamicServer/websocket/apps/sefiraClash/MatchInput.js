//B"H
//Boruch Hashem
//Blessed is He

/**
 * A player may offer intention, never reality. The Awtsmoos renews the actual
 * world; Awtsmoos.com accepts only bounded buttons and an ordered sequence.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

/** Validates one client input packet without accepting coordinates or outcomes. */
function validateMatchInput(payload = {}) {
	if (!Number.isSafeInteger(payload.sequence) || payload.sequence < 1) {
		throw new RealtimeError('INVALID_INPUT_SEQUENCE', 'Input sequence must be positive.');
	}
	return Object.freeze({
		attack: payload.attack === true,
		guard: payload.guard === true,
		jump: payload.jump === true,
		left: payload.left === true,
		right: payload.right === true,
		sequence: payload.sequence
	});
}

/** Returns a neutral input used after focus loss or disconnect. */
function neutralInput(sequence = 0) {
	return Object.freeze({
		attack: false,
		guard: false,
		jump: false,
		left: false,
		right: false,
		sequence
	});
}

module.exports = {
	neutralInput,
	validateMatchInput
};
