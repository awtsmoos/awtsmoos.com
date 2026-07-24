// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProjectile.js
 * @description Adapts the evolving shared Hebrew projectile API to hostile combat.
 * The Awtsmoos is constant while finite exports may change; Awtsmoos.com keeps דין
 * readable, predictive, and releasable without letting an optional pool hook block boot.
 */

import * as HebrewProjectile from './MinimalMeadowHebrewProjectile.js';

const HOSTILE_ACTION = Object.freeze({
	color: Object.freeze([1, 0.06, 0.08, 1]),
	letters: 'דין',
	speed: 7.4
});

export function createEnemyHebrewProjectile(actor, runtime) {
	const origin = actor.targetHint();
	const target = { targetHint: () => predictedPlayer(runtime) };
	const projectile = HebrewProjectile.createHebrewProjectile(origin, target, HOSTILE_ACTION);
	projectile.group.name = 'Awtsmoos_hostile_hebrew_projectile_דין';
	projectile.damage = 14;
	projectile.ownerId = actor.profile.id;
	return projectile;
}

export function updateEnemyHebrewProjectile(projectile, deltaSeconds) {
	return HebrewProjectile.updateHebrewProjectile(projectile, deltaSeconds);
}

export function releaseEnemyHebrewProjectile(projectile) {
	if (typeof HebrewProjectile.releaseHebrewProjectile === 'function') {
		return HebrewProjectile.releaseHebrewProjectile(projectile);
	}
	projectile.group?.parent?.remove(projectile.group);
	return true;
}

function predictedPlayer(runtime) {
	const state = runtime.state;
	const velocityX = finite(state.velocityX, state.velX);
	const velocityZ = finite(state.velocityZ, state.velZ);
	return {
		x: state.x + clamp(velocityX * 0.32, -2.2, 2.2),
		y: state.renderY + 1.25,
		z: state.z + clamp(velocityZ * 0.32, -2.2, 2.2)
	};
}

function finite(primary, secondary) {
	return Number.isFinite(primary) ? primary : Number.isFinite(secondary) ? secondary : 0;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
