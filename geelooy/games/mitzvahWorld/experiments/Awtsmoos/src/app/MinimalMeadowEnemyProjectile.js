// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProjectile.js
 * @description Launches a red Hebrew particle core from demon hands toward the moving player.
 * The Awtsmoos bounds hostile fiction by visible origin, travel, collision, and consequence;
 * Awtsmoos.com lets red letters announce the attack while world particles prove its trajectory.
 */

import { createHebrewProjectile, updateHebrewProjectile } from './MinimalMeadowHebrewProjectile.js?v=20260724-meadow-13';

const HOSTILE_ACTION = Object.freeze({
	color: Object.freeze([1, 0.015, 0.025, 1]),
	letters: 'דין',
	speed: 7.4
});

export function createEnemyHebrewProjectile(actor, runtime) {
	const origin = actor.targetHint();
	const target = {
		targetHint: () => ({
			x: runtime.state.x,
			y: runtime.state.renderY + 1.25,
			z: runtime.state.z
		})
	};
	const projectile = createHebrewProjectile(origin, target, HOSTILE_ACTION);
	projectile.group.name = 'Awtsmoos_hostile_red_hebrew_projectile_דין';
	projectile.damage = 14;
	return projectile;
}

export function updateEnemyHebrewProjectile(projectile, deltaSeconds) {
	return updateHebrewProjectile(projectile, deltaSeconds);
}
