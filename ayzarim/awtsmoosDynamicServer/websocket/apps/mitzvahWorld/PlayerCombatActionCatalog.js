// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatActionCatalog.js
 * @description Server-owned harvesting, casting, and melee timing, geometry, cost, and balance.
 * The Awtsmoos renews each measured deed; Awtsmoos.com refuses client-authored force,
 * while every tool, cast, and strike shares one inspectable authoritative action scroll.
 */

const ACTIONS = Object.freeze(Object.fromEntries([
	cast('hebrew-fire', 1.65, 4.2, 34, 1.45, 14, 2500),
	cast('letter-light', 1.1, 4.2, 38, 1.1, 9, 1850),
	cast('staff-cast', 0.62, 4.2, 34, 0.9, 7, 1200),
	melee('chalaf-harvest', 'chalaf', 0.22, 0.38, 2.2, 55, 1.6, 1, 8, 900),
	melee('staff-light', 'wooden-staff', 0.18, 0.31, 3.8, 72, 2.1, 0.85, 10, 620),
	melee('staff-follow', 'wooden-staff', 0.16, 0.30, 4, 82, 2.1, 0.95, 11, 660),
	melee('staff-heavy', 'wooden-staff', 0.42, 0.66, 4.5, 145, 2.1, 1.55, 24, 1450),
	melee('staff-shove', 'wooden-staff', 0.25, 0.39, 3.2, 58, 2.1, 0.55, 18, 1100),
	melee('sword-light', 'spark-blade', 0.14, 0.27, 3.6, 78, 1.8, 1, 9, 500),
	melee('sword-follow', 'spark-blade', 0.13, 0.27, 3.7, 88, 1.8, 1.08, 10, 520),
	melee('sword-finish', 'spark-blade', 0.24, 0.41, 4, 104, 1.8, 1.45, 18, 950),
	melee('sword-heavy', 'spark-blade', 0.48, 0.69, 4.2, 70, 1.8, 1.8, 26, 1550)
]));

function cast(id, elapsed, range, arcDegrees, multiplier, staminaCost, cooldownMs) {
	return record(
		id,
		'wooden-staff',
		elapsed - 0.08,
		elapsed + 0.25,
		range,
		arcDegrees,
		3,
		multiplier,
		staminaCost,
		cooldownMs,
		'cast'
	);
}

function melee(id, weaponId, activeStart, activeEnd, range, arcDegrees, verticalTolerance, multiplier, staminaCost, cooldownMs) {
	return record(
		id,
		weaponId,
		activeStart,
		activeEnd,
		range,
		arcDegrees,
		verticalTolerance,
		multiplier,
		staminaCost,
		cooldownMs,
		'melee'
	);
}

function record(id, weaponId, activeStart, activeEnd, range, arcDegrees, verticalTolerance, damageMultiplier, staminaCost, cooldownMs, kind) {
	return [id, Object.freeze({
		activeEnd,
		activeStart,
		arcDegrees,
		cooldownMs,
		damageMultiplier,
		id,
		kind,
		range,
		staminaCost,
		verticalTolerance,
		weaponId
	})];
}

function playerCombatAction(actionId) {
	return ACTIONS[actionId] || null;
}

module.exports = {
	ACTIONS,
	playerCombatAction
};
