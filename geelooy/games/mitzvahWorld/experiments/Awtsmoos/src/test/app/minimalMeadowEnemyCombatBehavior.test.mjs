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
import { MinimalMeadowEnemyCombat } from '../../app/MinimalMeadowEnemyCombat.js';
import { hebrewProjectileDiagnostics } from '../../app/MinimalMeadowHebrewProjectile.js';
import { particleEffectDiagnostics } from '../../app/MinimalMeadowParticleEffects.js';

installCanvasDouble();

function fixture(temperament, distance) {
	const events = [];
	const group = {
		position: { x: 0, y: 0, z: 0 },
		quaternion: { set() {} }
	};
	const runtime = {
		bus: {
			emit(type, payload) {
				events.push({ payload, type });
			}
		},
		enemyNavigation: {
			canMove: () => true,
			hasLineOfSight: () => true
		},
		playerStats: { armor: 0, health: 100, maxHealth: 100 },
		scene: {
			add(object) {
				object.parent = this;
			},
			remove(object) {
				object.parent = null;
			}
		},
		state: { renderY: 0, x: 0, z: distance }
	};
	const actor = {
		action: 'idle',
		actionProgress: 0,
		alive: true,
		group,
		moving: false,
		pack: { actors: [] },
		profile: { id: `test-${temperament}`, speed: 2, temperament },
		move(x, z, vectorDistance, delta) {
			const stepSize = Math.min(vectorDistance, this.profile.speed * delta);
			this.group.position.x += x / vectorDistance * stepSize;
			this.group.position.z += z / vectorDistance * stepSize;
		},
		payload() {
			return { id: this.profile.id };
		},
		targetHint() {
			return { x: group.position.x, y: 1.4, z: group.position.z };
		}
	};
	actor.pack.actors.push(actor);
	return { actor, combat: new MinimalMeadowEnemyCombat(actor, runtime), events, runtime };
}

function step(combat, seconds, count = 1) {
	for (let index = 0; index < count; index += 1) combat.update(seconds);
}

function installCanvasDouble() {
	const context = {
		clearRect() {},
		fillText() {},
		strokeText() {}
	};
	globalThis.document = {
		createElement(tagName) {
			assert.equal(tagName, 'canvas');
			return {
				dataset: {},
				getContext(kind) {
					assert.equal(kind, '2d');
					return context;
				}
			};
		}
	};
}

test('melee persists across aggro and applies exactly one impact per strike', () => {
	const { combat, runtime } = fixture('melee', 2.3);
	step(combat, 0.05, 29);
	assert.equal(combat.session.active, true);
	assert.equal(runtime.playerStats.health, 89);
	const firstHealth = runtime.playerStats.health;
	step(combat, 0.05, 8);
	assert.equal(runtime.playerStats.health, firstHealth);
	runtime.state.z = 25;
	step(combat, 0.05, 20);
	assert.equal(combat.session.active, true);
	assert.notEqual(combat.session.state, 'patrol');
});

test('caster retreats, launches one Hebrew projectile, and recovers', () => {
	const { combat, events, runtime } = fixture('ranged', 3);
	step(combat, 0.05, 24);
	assert.equal(combat.session.role, 'caster');
	assert.ok(combat.actor.group.position.z < 0);
	runtime.state.z = 8;
	step(combat, 0.05, 30);
	assert.equal(combat.attackCount, 1);
	assert.equal(combat.projectiles.length, 1);
	assert.ok(events.some((event) => event.type === 'enemy:projectile'));
	assert.ok(['recovery', 'reposition'].includes(combat.session.state));
});

test('impact and expired support effects return their visual vessels to pools', () => {
	const beforeProjectile = hebrewProjectileDiagnostics().pool;
	const beforeParticles = particleEffectDiagnostics();
	const { actor, combat, runtime } = fixture('ranged', 8);
	step(combat, 0.05, 45);
	assert.equal(combat.attackCount, 1);
	actor.alive = false;
	step(combat, 0.05, 60);
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
