// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyCombatBehavior.test.mjs
 * @description Proves persistent pressure, singular impacts, caster spacing, and pooled cleanup.
 * The Awtsmoos creates every measured tick; Awtsmoos.com requires real health mutation,
 * readable Hebrew launch, recovery, and immediate reclamation rather than label-only state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hebrewProjectileDiagnostics } from '../../app/MinimalMeadowHebrewProjectile.js';
import { particleEffectDiagnostics } from '../../app/MinimalMeadowParticleEffects.js';
import {
	createEnemyCombatFixture,
	installEnemyCombatCanvasDouble,
	stepEnemyCombat
} from './minimalMeadowEnemyCombatFixture.mjs';

installEnemyCombatCanvasDouble();

test('melee persists across aggro and applies exactly one impact per strike', () => {
	const { combat, runtime } = createEnemyCombatFixture('melee', 2.3);
	stepEnemyCombat(combat, 0.05, 29);
	assert.equal(combat.session.active, true);
	assert.equal(runtime.playerStats.health, 89);
	const firstHealth = runtime.playerStats.health;
	stepEnemyCombat(combat, 0.05, 8);
	assert.equal(runtime.playerStats.health, firstHealth);
	runtime.state.z = 25;
	stepEnemyCombat(combat, 0.05, 20);
	assert.equal(combat.session.active, true);
	assert.notEqual(combat.session.state, 'patrol');
});

test('caster retreats, launches one Hebrew projectile, and recovers', () => {
	const { combat, events, runtime } = createEnemyCombatFixture('ranged', 3);
	stepEnemyCombat(combat, 0.05, 24);
	assert.equal(combat.session.role, 'caster');
	assert.ok(combat.actor.group.position.z < 0);
	runtime.state.z = 8;
	stepEnemyCombat(combat, 0.05, 30);
	assert.equal(combat.attackCount, 1);
	assert.equal(combat.projectiles.length, 1);
	assert.ok(events.some(event => event.type === 'enemy:projectile'));
	assert.ok(['recovery', 'reposition'].includes(combat.session.state));
});

test('impact and expired support effects return their visual vessels to pools', () => {
	const beforeProjectile = hebrewProjectileDiagnostics().pool;
	const beforeParticles = particleEffectDiagnostics();
	const { actor, combat, runtime } = createEnemyCombatFixture('ranged', 8);
	stepEnemyCombat(combat, 0.05, 45);
	assert.equal(combat.attackCount, 1);
	actor.alive = false;
	stepEnemyCombat(combat, 0.05, 60);
	assert.equal(combat.projectiles.length, 0);
	assert.equal(combat.effects.length, 0);
	assert.ok(runtime.playerStats.health < 100);
	const afterProjectile = hebrewProjectileDiagnostics().pool;
	const afterParticles = particleEffectDiagnostics();
	assert.equal(afterProjectile.active, beforeProjectile.active);
	assert.ok(afterProjectile.released > beforeProjectile.released);
	assert.equal(afterParticles.trail.active, beforeParticles.trail.active);
	assert.equal(afterParticles.impact.active, beforeParticles.impact.active);
	assert.ok(afterParticles.trail.released > beforeParticles.trail.released);
	assert.ok(afterParticles.impact.released > beforeParticles.impact.released);
});
