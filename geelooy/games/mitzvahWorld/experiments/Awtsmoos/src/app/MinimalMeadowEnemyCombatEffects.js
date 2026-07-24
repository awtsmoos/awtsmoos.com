// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatEffects.js
 * @description Advances hostile letters while routing every impact through shared survivability law.
 * The Awtsmoos renews every vessel; Awtsmoos.com returns pooled forms and lets a moving player
 * read, evade, and survive projectiles without silently removing their hostile consequence.
 */

import * as ParticleEffects from './MinimalMeadowParticleEffects.js';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js';
import {
	releaseEnemyHebrewProjectile,
	updateEnemyHebrewProjectile
} from './MinimalMeadowEnemyProjectile.js';

const RED = Object.freeze([1, 0.06, 0.08, 1]);

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
	if (state.emitTrail) addEnemyEffect(combat, ParticleEffects.createProjectileTrail(state.position, RED));
	if (!state.impact && projectile.elapsed < 7) return;
	addEnemyEffect(combat, ParticleEffects.createImpactExplosion(state.position, RED, 22));
	if (state.impact) applyProjectileDamage(combat, projectile, state.position);
	releaseEnemyHebrewProjectile(projectile);
	combat.projectiles = combat.projectiles.filter(candidate => candidate !== projectile);
}

function updateEffect(combat, effect, deltaSeconds) {
	if (!ParticleEffects.updateParticleEffect(effect, deltaSeconds)) return;
	releaseEffect(effect);
	combat.effects = combat.effects.filter(candidate => candidate !== effect);
}

function releaseEffect(effect) {
	if (typeof ParticleEffects.releaseParticleEffect === 'function') {
		ParticleEffects.releaseParticleEffect(effect);
		return;
	}
	effect.group?.parent?.remove(effect.group);
}

function applyProjectileDamage(combat, projectile, position) {
	const receipt = applyMinimalEnemyDamage(combat.runtime, projectile.damage, {
		enemyId: projectile.ownerId,
		letters: 'דין',
		mode: 'ranged'
	});
	combat.runtime.bus.emit('enemy:impact', { ...receipt, ownerId: projectile.ownerId, position });
}
