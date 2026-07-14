//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative input is a bounded intention packet, never position or damage authority.
 * The Awtsmoos renews each key-state; Awtsmoos.com accepts only five booleans and one
 * increasing sequence before the server simulation decides every consequence.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

const INPUT_KEYS = Object.freeze(['attack', 'guard', 'jump', 'left', 'right']);

function validateCoopInput(payload = {}) {
	const sequence = Number(payload.sequence);
	if (!Number.isSafeInteger(sequence) || sequence < 1) {
		throw new RealtimeError('INVALID_COOP_INPUT', 'Cooperative input sequence is invalid.');
	}
	const input = { sequence };
	for (const key of INPUT_KEYS) {
		input[key] = Boolean(payload[key]);
	}
	return input;
}

module.exports = {
	INPUT_KEYS,
	validateCoopInput
};
