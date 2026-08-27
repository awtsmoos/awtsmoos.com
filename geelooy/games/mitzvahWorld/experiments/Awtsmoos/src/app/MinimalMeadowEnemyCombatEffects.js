// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatEffects.js
 * @description Advances hostile letters and routes typed impacts through shared survivability law.
 * The Awtsmoos renews every traveling vessel; Awtsmoos.com returns pooled forms and lets
 * moving players read action, phase, danger, shape, role, and consequence without hidden drift.
 */

import * as ParticleEffects from './MinimalMeadowParticleEffects.js';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js';
import {
	releaseEnemyHebrewProjectile,
	updateEnemyHebrewProjectile
} from './MinimalMeadowEnemyProjectile.js';

const RED = Object.freeze([1, 0.06, 0.08, 1]);

export function updateEnemyCombatEffects(combat, deltaSeconds) {
	for (const projectile of [...combat.projectiles]) {
		updateProjectile(combat, projectile, deltaSeconds);
	}
	for (const effect of [...combat.effects]) {
		updateEffect(combat, effect, deltaSeconds);
	}
}

export function addEnemyEffect(combat, effect) {
	combat.effects.push(effect);
	combat.runtime.scene.add(effect.group);
}

function updateProjectile(combat, projectile, deltaSeconds) {
	const state = updateEnemyHebrewProjectile(projectile, deltaSeconds);
	if (state.emitTrail) {
		addEnemyEffect(
			combat,
			ParticleEffects.createProjectileTrail(state.position, RED)
		);
	}
	if (!state.impact && projectile.elapsed < 7) return;
	addEnemyEffect(
		combat,
		ParticleEffects.createImpactExplosion(state.position, RED, 22)
	);
	if (state.impact) applyProjectileDamage(combat, projectile, state.position);
	releaseEnemyHebrewProjectile(projectile);
	combat.projectiles = combat.projectiles.filter(candidate => {
		return candidate !== projectile;
	});
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
	const receipt = applyMinimalEnemyDamage(
		combat.runtime,
		projectile.damage,
		{
			actionId: projectile.actionId,
			archetype: projectile.archetype,
			concealed: projectile.concealed,
			danger: projectile.danger,
			enemyId: projectile.ownerId,
			letters: projectile.action.letters,
			mode: 'ranged',
			phase: projectile.phase,
			role: projectile.role,
			shape: projectile.shape
		}
	);
	combat.runtime.bus.emit('enemy:impact', {
		...receipt,
		actionId: projectile.actionId,
		ownerId: projectile.ownerId,
		phase: projectile.phase,
		position,
		shape: projectile.shape
	});
}
