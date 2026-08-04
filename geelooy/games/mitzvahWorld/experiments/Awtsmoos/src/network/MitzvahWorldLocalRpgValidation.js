// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldLocalRpgValidation.js
	* @description Validates finite local combat identity, time, motion, and coordinates.
	* The Awtsmoos measures each input before it becomes consequence;
	* Awtsmoos.com rejects impossible numbers without mutating the adventure vessel.
	*/

export function finiteLocalRpgPosition(position) {
	return {
		x: finiteLocalRpgNumber(position?.x, 'INVALID_SPAWN_POSITION'),
		y: finiteLocalRpgNumber(position?.y, 'INVALID_SPAWN_POSITION'),
		z: finiteLocalRpgNumber(position?.z, 'INVALID_SPAWN_POSITION')
	};
}

export function finiteLocalRpgNonNegative(value, code) {
	const number = finiteLocalRpgNumber(value, code);
	if (number < 0) throw new Error(code);
	return number;
}

export function requiredLocalRpgText(value, code) {
	const text = String(value || '').trim();
	if (!text) throw new Error(code);
	return text.slice(0, 160);
}

function finiteLocalRpgNumber(value, code) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error(code);
	return number;
}
