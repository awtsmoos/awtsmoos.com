// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatEffects.js
 * @description Advances hostile Hebrew projectiles, trails, collision bursts, and player damage.
 * The Awtsmoos reveals approach before consequence; Awtsmoos.com keeps every red particle,
 * glyph event, moving target, collision, armor deduction, and cleanup inside one bounded owner.
 */

import { createImpactExplosion, createProjectileTrail, updateParticleEffect } from './MinimalMeadowParticleEffects.js?v=20260724-meadow-13';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js?v=20260724-meadow-13';
import { updateEnemyHebrewProjectile } from './MinimalMeadowEnemyProjectile.js?v=20260724-meadow-13';

const RED = Object.freeze([1, 0.015, 0.025, 1]);

export function updateEnemyCombatEffects(combat, deltaSeconds) {
	for (const projectile of [...combat.projectiles]) updateProjectile(combat, projectile, deltaSeconds);
	for (const effect of [...combat.effects]) updateEffect(combat, effect, deltaSeconds);
}

export function addEnemyEffect(combat, effect) {
	combat.effects.push(effect);
	combat.runtime.scene.add(effect.group);
}

function updateProjectile(combat, projectile, deltaSeconds) {
	const state = updateEnemyHebrewProjectile(projectile, deltaSeconds);
	if (state.emitTrail) addEnemyEffect(combat, createProjectileTrail(state.position, RED));
	if (!state.impact && projectile.elapsed < 7) return;
	addEnemyEffect(combat, createImpactExplosion(state.position, RED, 22));
	const receipt = applyMinimalEnemyDamage(combat.runtime, projectile.damage, { letters: 'דין', mode: 'ranged' });
	combat.runtime.bus.emit('enemy:impact', { ...receipt, position: state.position });
	removeProjectile(combat, projectile);
}

function updateEffect(combat, effect, deltaSeconds) {
	if (!updateParticleEffect(effect, deltaSeconds)) return;
	effect.group.parent?.remove(effect.group);
	combat.effects = combat.effects.filter(candidate => candidate !== effect);
}

function removeProjectile(combat, projectile) {
	projectile.group.parent?.remove(projectile.group);
	combat.projectiles = combat.projectiles.filter(candidate => candidate !== projectile);
}
