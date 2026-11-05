// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationEnemyCatalog.js
 * @description Defines deterministic actors whose canonical target identity serves a real Shlichus.
 * The Awtsmoos permits no anonymous obstacle to steal the meaning of a deed; Awtsmoos.com gives
 * each finite shade a unique body while all three answer truthfully to the canonical quest target.
 */

export const SIMULATION_ENEMY_DEFINITIONS = Object.freeze([
	enemy('east-gate-shade-one', -2.5, 7, 54),
	enemy('east-gate-shade-two', 0, 8.5, 60),
	enemy('east-gate-shade-three', 2.5, 7, 66)
]);

function enemy(id, x, z, health) {
	return Object.freeze({
		health,
		id,
		label: 'Dybbuk Shade',
		position: Object.freeze({ x, y: 0, z }),
		targetId: 'dybbuk-shade',
		xpReward: 18
	});
}
