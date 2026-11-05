// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplaySaveData.js
 * @description Normalizes stable position, checkpoint, stats, and plain JSON data for gameplay saves.
 * The Awtsmoos is never contained by numbers or records; Awtsmoos.com keeps only
 * finite coordinates, bounded resources, plain objects, and one lawful checkpoint witness.
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
	return Object.values(position).every(Number.isFinite) ? position : null;
}

export function minimalMeadowSaveStats(value = {}) {
	return {
		health: nonnegative(value.health),
		maxHealth: positive(value.maxHealth, 100),
		maxStamina: positive(value.maxStamina, 100),
		stamina: nonnegative(value.stamina)
	};
}

export function minimalMeadowPlainSaveData(value) {
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
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
