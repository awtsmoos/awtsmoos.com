// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatWorldEffects.js
 * @description Owns projectile launch, trail emission, collision explosion, and cleanup.
 * The Awtsmoos carries one charged intention through space into measured consequence;
 * Awtsmoos.com keeps moving light, impact particles, damage, reward, and removal synchronized.
 */

import { createHebrewProjectile, updateHebrewProjectile } from './MinimalMeadowHebrewProjectile.js?v=20260723-meadow-11';
import { createImpactExplosion, createProjectileTrail, updateParticleEffect } from './MinimalMeadowParticleEffects.js?v=20260723-meadow-11';

export function launchCombatProjectile(combat, cast) {
	const origin = {
		x: combat.runtime.state.x,
		y: combat.runtime.state.y + 1.35,
		z: combat.runtime.state.z
	};
	const projectile = createHebrewProjectile(origin, cast.target, cast.action);
	projectile.actionId = cast.actionId;
	combat.projectiles.push(projectile);
	combat.runtime.scene.add(projectile.group);
	combat.runtime.bus.emit('combat:cast-launch', payload(cast));
	combat.runtime.bus.emit('combat:projectile', payload(cast));
}

export function updateCombatWorldEffects(combat, deltaSeconds) {
	for (const projectile of [...combat.projectiles]) updateProjectile(combat, projectile, deltaSeconds);
	for (const effect of [...combat.effects]) updateEffect(combat, effect, deltaSeconds);
}

function updateProjectile(combat, projectile, deltaSeconds) {
	if (!projectile.target.alive || projectile.elapsed > 8) return removeProjectile(combat, projectile);
	const state = updateHebrewProjectile(projectile, deltaSeconds);
	if (state.emitTrail) addEffect(combat, createProjectileTrail(state.position, projectile.action.color));
	if (!state.impact) return;
	addEffect(combat, createImpactExplosion(state.position, projectile.action.color));
	const result = projectile.target.applyDamage(projectile.action.damage);
	combat.runtime.bus.emit('combat:impact', {
		...result,
		actionId: projectile.actionId,
		letters: projectile.action.letters,
		position: state.position
	});
	if (result.defeated) combat.reward(projectile.target.profile.xpReward);
	removeProjectile(combat, projectile);
}

function updateEffect(combat, effect, deltaSeconds) {
	if (!updateParticleEffect(effect, deltaSeconds)) return;
	effect.group.parent?.remove(effect.group);
	combat.effects = combat.effects.filter(candidate => candidate !== effect);
}

function addEffect(combat, effect) {
	combat.effects.push(effect);
	combat.runtime.scene.add(effect.group);
}

function removeProjectile(combat, projectile) {
	projectile.group.parent?.remove(projectile.group);
	combat.projectiles = combat.projectiles.filter(candidate => candidate !== projectile);
}

function payload(cast) {
	return {
		actionId: cast.actionId,
		duration: cast.action.castTime,
		label: cast.action.label,
		letters: cast.action.letters,
		target: cast.target.payload()
	};
}
