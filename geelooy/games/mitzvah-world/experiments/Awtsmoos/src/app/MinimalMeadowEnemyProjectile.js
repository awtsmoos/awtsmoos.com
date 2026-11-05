// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProjectile.js
 * @description Creates readable hostile Hebrew projectiles carrying exact action and phase identity.
 * The Awtsmoos is constant while finite letters travel at measured rates; Awtsmoos.com lets
 * role, danger, concealment, shape, damage, owner, prediction, pooling, and collision remain explicit.
 */

import * as HebrewProjectile from './MinimalMeadowHebrewProjectile.js';
import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';

const BASE_SPEED = 7.4;
const DEFAULT_COLOR = Object.freeze([1, 0.06, 0.08, 1]);

export function createEnemyHebrewProjectile(actor, runtime, selectedAction = {}) {
	const origin = actor.targetHint();
	const target = {
		targetHint: () => predictedPlayer(runtime)
	};
	const behavior = minimalEnemyArchetypePolicy(actor.profile);
	const action = Object.freeze({
		color: actor.profile.projectileTint || DEFAULT_COLOR,
		letters: selectedAction.letters || actor.profile.attackLetters || 'דין',
		speed: BASE_SPEED * behavior.projectileSpeedScale
	});
	const projectile = HebrewProjectile.createHebrewProjectile(
		origin,
		target,
		action
	);
	projectile.group.name = `Awtsmoos_hostile_hebrew_projectile_${action.letters}`;
	Object.assign(projectile, {
		action,
		actionId: selectedAction.id || 'letter-bolt',
		archetype: actor.profile.archetype,
		concealed: Boolean(selectedAction.concealed),
		damage: 14,
		danger: selectedAction.danger || 'medium',
		ownerId: actor.profile.id,
		phase: Number(selectedAction.phase || 1),
		role: actor.profile.role,
		shape: selectedAction.shape || 'glyph'
	});
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
	if (Number.isFinite(primary)) return primary;
	if (Number.isFinite(secondary)) return secondary;
	return 0;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
