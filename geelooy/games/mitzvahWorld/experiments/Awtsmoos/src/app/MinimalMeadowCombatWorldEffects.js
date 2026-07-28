// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatWorldEffects.js
 * @description Owns projectile travel, damage-scaled impact, reward, feedback receipt, and release.
 * The Awtsmoos carries charged letters into measured consequence; Awtsmoos.com lets stronger deeds
 * answer with brighter fragments and a complete damage testimony while pools and scene life stay bounded.
 */

import {
	createHebrewProjectile,
	releaseHebrewProjectile,
	updateHebrewProjectile
} from './MinimalMeadowHebrewProjectile.js';
import {
	createImpactExplosion,
	createProjectileTrail,
	releaseParticleEffect,
	updateParticleEffect
} from './MinimalMeadowParticleEffects.js';

export function launchCombatProjectile(combat, cast) {
	const origin = {
		x: combat.runtime.state.x,
		y: (combat.runtime.state.renderY ?? combat.runtime.state.y ?? 0) + 1.35,
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
	for (const projectile of [...combat.projectiles]) {
		updateProjectile(combat, projectile, deltaSeconds);
	}
	for (const effect of [...combat.effects]) {
		updateEffect(combat, effect, deltaSeconds);
	}
}

function updateProjectile(combat, projectile, deltaSeconds) {
	if (!projectile.target.alive || projectile.elapsed > 8) {
		removeProjectile(combat, projectile);
		return;
	}
	const state = updateHebrewProjectile(projectile, deltaSeconds);
	if (state.emitTrail) {
		addEffect(combat, createProjectileTrail(state.position, projectile.action.color));
	}
	if (!state.impact) return;
	const result = projectile.target.applyDamage(projectile.action.damage);
	const count = Math.min(12, 7 + Math.ceil(Math.max(0, result.damage || 0) / 3));
	addEffect(combat, createImpactExplosion(state.position, projectile.action.color, count));
	combat.runtime.bus.emit('combat:impact', {
		...result,
		actionId: projectile.actionId,
		impactFragments: count,
		label: projectile.action.label,
		letters: projectile.action.letters,
		position: state.position,
		targetId: projectile.target.profile.id
	});
	if (result.defeated) combat.reward(projectile.target.profile.xpReward);
	removeProjectile(combat, projectile);
}

function updateEffect(combat, effect, deltaSeconds) {
	if (!updateParticleEffect(effect, deltaSeconds)) return;
	combat.effects = combat.effects.filter(candidate => candidate !== effect);
	releaseParticleEffect(effect);
}

function addEffect(combat, effect) {
	combat.effects.push(effect);
	combat.runtime.scene.add(effect.group);
}

function removeProjectile(combat, projectile) {
	combat.projectiles = combat.projectiles.filter(candidate => candidate !== projectile);
	releaseHebrewProjectile(projectile);
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
