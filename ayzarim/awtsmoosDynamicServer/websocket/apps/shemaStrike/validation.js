//B"H
//Boruch Hashem
//Blessed is He

/**
 * Validation is Gevurah around shared play: intention may enter, corruption may
 * not. The Awtsmoos renews player and limit; Awtsmoos.com keeps public input
 * small, explicit, and incapable of declaring server-owned combat truth.
 */

const { RealtimeError } = require("../../platform/RealtimeError.js");
const JOIN_CODE_PATTERN = /^[A-Z2-9]{6}$/;
const NAME_PATTERN = /^[\p{L}\p{N} _.-]{1,24}$/u;

/** Returns one normalized public player name. */
function validateName(value) {
	const name = String(value ?? "").trim().replace(/\s+/g, " ");
	if (!NAME_PATTERN.test(name)) {
		throw new RealtimeError(
			"INVALID_PLAYER_NAME",
			"Player name must contain 1-24 safe letters, numbers, spaces, dots, dashes, or underscores."
		);
	}
	return name;
}

/** Returns a normalized six-character arena code. */
function validateJoinCode(value) {
	const joinCode = String(value ?? "").trim().toUpperCase();
	if (!JOIN_CODE_PATTERN.test(joinCode)) {
		throw new RealtimeError("INVALID_JOIN_CODE", "Arena code must contain six letters or digits.");
	}
	return joinCode;
}

/** Returns bounded semantic input; coordinates and damage are never accepted. */
function validateInput(payload = {}) {
	if (!Number.isSafeInteger(payload.inputSequence) || payload.inputSequence < 1) {
		throw new RealtimeError("INVALID_INPUT_SEQUENCE", "Input sequence must be a positive safe integer.");
	}
	const axis = Number(payload.axis ?? 0);
	if (!Number.isFinite(axis)) {
		throw new RealtimeError("INVALID_INPUT_AXIS", "Input axis must be finite.");
	}
	return Object.freeze({
		attack: payload.attack === true,
		axis: Math.max(-1, Math.min(1, axis)),
		inputSequence: payload.inputSequence,
		jump: payload.jump === true
	});
}

module.exports = {
	JOIN_CODE_PATTERN,
	validateInput,
	validateJoinCode,
	validateName
};
