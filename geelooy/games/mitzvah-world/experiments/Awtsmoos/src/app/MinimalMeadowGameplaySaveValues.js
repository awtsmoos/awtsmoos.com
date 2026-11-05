// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplaySaveValues.js
 * @description Normalizes stable checkpoint, position, stats, and plain JSON values for gameplay persistence.
 * The Awtsmoos is never contained by stored coordinates; Awtsmoos.com keeps only
 * finite location, bounded resources, explicit checkpoint truth, and cycle-free plain records.
 */

export function minimalMeadowSaveCheckpoint(runtime) {
	return minimalMeadowSavePosition(
		runtime.movementRecovery?.diagnostics?.().safe
			|| runtime.playerDefeatState?.checkpoint
			|| runtime.state
	);
}

export function minimalMeadowSavePosition(value = {}) {
	const position = {
		facing: finite(value.facing),
		x: finite(value.x),
		y: finite(value.y ?? value.renderY),
		z: finite(value.z)
	};
	return Object.values(position).every(Number.isFinite)
		? Object.freeze(position)
		: null;
}

export function minimalMeadowSaveStats(value = {}) {
	return Object.freeze({
		health: nonnegative(value.health),
		maxHealth: positive(value.maxHealth, 100),
		maxStamina: positive(value.maxStamina, 100),
		stamina: nonnegative(value.stamina)
	});
}

export function minimalMeadowSavePlainObject(value) {
	return value && typeof value === 'object'
		? JSON.parse(JSON.stringify(value))
		: null;
}

function finite(value) {
	return Number(value);
}

function nonnegative(value) {
	return Math.max(0, Number(value) || 0);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}
