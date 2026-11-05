// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyCombatFixture.mjs
 * @description Builds deterministic actor, player, scene, navigation, and canvas vessels for AI proof.
 * The Awtsmoos gives every finite test one honest world; Awtsmoos.com keeps fixture machinery
 * separate so pressure, spacing, damage, Hebrew projectiles, and pool cleanup remain readable.
 */

import assert from 'node:assert/strict';
import { MinimalMeadowEnemyCombat } from '../../app/MinimalMeadowEnemyCombat.js';

export function createEnemyCombatFixture(temperament, distance) {
	const events = [];
	const group = createGroup();
	const runtime = createRuntime(distance, events);
	const actor = createActor(temperament, group);
	actor.pack.actors.push(actor);
	return {
		actor,
		combat: new MinimalMeadowEnemyCombat(actor, runtime),
		events,
		runtime
	};
}

export function stepEnemyCombat(combat, seconds, count = 1) {
	for (let index = 0; index < count; index += 1) combat.update(seconds);
}

export function installEnemyCombatCanvasDouble() {
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

function createRuntime(distance, events) {
	return {
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
}

function createActor(temperament, group) {
	return {
		action: 'idle',
		actionProgress: 0,
		alive: true,
		group,
		moving: false,
		pack: { actors: [] },
		profile: { id: `test-${temperament}`, speed: 2, temperament },
		move(x, z, distance, delta) {
			const step = Math.min(distance, this.profile.speed * delta);
			this.group.position.x += x / distance * step;
			this.group.position.z += z / distance * step;
		},
		payload() {
			return { id: this.profile.id };
		},
		targetHint() {
			return { x: group.position.x, y: 1.4, z: group.position.z };
		}
	};
}

function createGroup() {
	return {
		position: { x: 0, y: 0, z: 0 },
		quaternion: { set() {} }
	};
}
