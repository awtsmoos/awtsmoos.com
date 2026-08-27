// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowDemonCombatFunctions.test.mjs
 * @description Proves canonical light, sanctuary, hurt windows, defeat, and full respawn reset.
 * The Awtsmoos gives no finite shadow permission to forge strength or strike without measure;
 * Awtsmoos.com records health, range, protection, clearing, and return as visible contracts.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PlayerCombatDefense } from '../../gameplay/PlayerCombatDefense.js';
import {
	applyTorahLight,
	attackPlayerFromShadow,
	defeatShadow,
	updateShadowRespawn
} from '../../world/enemy/ShadowDemonCombat.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';

function fixture(position = { x: 0, z: 0 }) {
	const events = [];
	const actor = {
		attackTimeline: { damageApplied: false },
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		clear() { this.selected = false; },
		currentAttack: { damage: 7, damageType: 'shadow-cut', id: 'test-cut', range: 2.5, stagger: 4 },
		defense: new PlayerCombatDefense(),
		engaged: false,
		ground: { heightAt: () => 3 },
		group: {
			position: { ...position, y: 3 },
			scale: { set() {} },
			visible: true
		},
		health: 30,
		payload() { return { health: this.health, id: 'shade-test', selected: this.selected }; },
		profile: {
			attackRange: 2.5,
			id: 'shade-test',
			maxHealth: 30,
			respawnSeconds: 5,
			spawnSeconds: 0.7,
			staggerThreshold: 30,
			x: 0,
			z: 0
		},
		respawnAt: 0,
		selected: true,
		stagger: 0,
		state: ENEMY_STATE.ATTACK_ACTIVE,
		stateElapsed: 0,
		statusEffects: [],
		waypointIndex: 3
	};
	return { actor, events };
}

test('Torah light uses canonical damage and enforces world range', () => {
	const playerState = { x: 0, z: 5 };
	const near = fixture();
	const accepted = applyTorahLight(near.actor, { id: 'modeh-ani', damage: 999 }, playerState, 10);
	assert.equal(accepted.accepted, true);
	assert.equal(accepted.damage, 12);
	assert.equal(near.actor.health, 18);
	const far = fixture({ x: 40, z: 0 });
	const rejected = applyTorahLight(far.actor, { id: 'modeh-ani' }, playerState, 10);
	assert.equal(rejected.reason, 'TARGET_OUT_OF_RANGE');
	assert.equal(far.actor.health, 30);
});

test('one player hurt window prevents simultaneous shadow damage', () => {
	const playerState = { combat: { nextShadowHitAt: 0 }, player: { health: 100 }, x: 0, z: 1 };
	const first = fixture();
	const second = fixture();
	assert.equal(attackPlayerFromShadow(first.actor, playerState, 10), true);
	assert.equal(attackPlayerFromShadow(second.actor, playerState, 10), false);
	assert.equal(playerState.player.health, 93);
});

test('village sanctuary cancels hostile impact at the damage boundary', () => {
	const { actor, events } = fixture({ x: -34, z: -24 });
	const playerState = { player: { health: 100 }, x: -34, z: -24 };
	assert.equal(attackPlayerFromShadow(actor, playerState, 10), false);
	assert.equal(playerState.player.health, 100);
	assert.equal(events.at(-1).type, 'enemy:miss');
});

test('defeat clears selection and respawn restores canonical combat state', () => {
	const { actor } = fixture();
	defeatShadow(actor, 10);
	assert.equal(actor.state, ENEMY_STATE.DEFEATED);
	assert.equal(actor.selected, false);
	assert.equal(actor.group.visible, false);
	assert.equal(updateShadowRespawn(actor, 14.9), false);
	assert.equal(updateShadowRespawn(actor, 15), true);
	assert.equal(actor.health, 30);
	assert.equal(actor.state, ENEMY_STATE.SPAWN);
	assert.equal(actor.engaged, false);
	assert.equal(actor.waypointIndex, 0);
	assert.deepEqual(actor.group.position, { x: 0, y: 3, z: 0 });
});
