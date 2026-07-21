// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowDemonCombat.test.mjs
 * @description Proves readable actor combat, sanctuary peace, Torah dispersion, and respawn.
 * The Awtsmoos grants concealment no independent power; Awtsmoos.com keeps every trial finite
 * while the inhabited alpine village remains a place of learning, gathering, and ordinary life.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PlayerCombatDefense } from '../../gameplay/PlayerCombatDefense.js';
import { torahPassage } from '../../gameplay/TorahPassageCatalog.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';
import { ShadowDemonActor } from '../../world/enemy/ShadowDemonActor.js';
import { shadowDemonProfiles } from '../../world/enemy/ShadowDemonProfiles.js';

class TestBus {
	constructor() { this.events = []; }
	emit(type, detail) { this.events.push({ detail, type }); }
}

function createActor() {
	return new ShadowDemonActor({
		bus: new TestBus(),
		camera: {},
		canvas: {},
		defense: new PlayerCombatDefense(),
		ground: {
			heightAt: () => ({ y: 3 }),
			sample: () => ({ kind: 'terrain', normal: { y: 1 } }),
			terrainNormal: () => ({ y: 1 })
		},
		profile: shadowDemonProfiles('low')[0]
	});
}

test('shadow attack passes through alert, anticipation, active, and recovery', () => {
	const actor = createActor();
	const playerState = { player: { health: 100 }, x: actor.profile.x, z: actor.profile.z };
	actor.update(0.7, playerState, 1);
	assert.equal(actor.state, ENEMY_STATE.ALERT);
	actor.update(0.6, playerState, 1.6);
	assert.equal(actor.state, ENEMY_STATE.ATTACK_ANTICIPATION);
	actor.update(0.8, playerState, 2.4);
	assert.equal(actor.state, ENEMY_STATE.ATTACK_ACTIVE);
	assert.equal(playerState.player.health, 86);
	actor.update(0.1, playerState, 2.5);
	assert.equal(playerState.player.health, 86);
	actor.update(0.2, playerState, 2.7);
	assert.equal(actor.state, ENEMY_STATE.ATTACK_RECOVERY);
	assert.equal(actor.bus.events.filter(event => event.type === 'enemy:attack').length, 1);
});

test('a shadow inside the Shul sanctuary returns without attacking', () => {
	const actor = createActor();
	actor.group.position.x = -34;
	actor.group.position.z = -24;
	const playerState = { player: { health: 100 }, x: -34, z: -24 };
	actor.update(0.016, playerState, 1);
	assert.equal(actor.state, ENEMY_STATE.RETURN_HOME);
	assert.equal(playerState.player.health, 100);
	assert.equal(actor.bus.events.some(event => event.type === 'enemy:attack'), false);
});

test('canonical Torah passage disperses and respawns a selected shade', () => {
	const actor = createActor();
	const playerState = { player: { health: 100 }, x: actor.profile.x, z: actor.profile.z };
	actor.health = 1;
	actor.target();
	const result = actor.applyTorahPassage(torahPassage('modeh-ani'), playerState, 5);
	assert.equal(result.defeated, true);
	assert.equal(actor.group.visible, false);
	const farPlayer = { player: { health: 100 }, x: 999, z: 999 };
	actor.update(0.016, farPlayer, actor.respawnAt + 0.01);
	assert.equal(actor.state, ENEMY_STATE.SPAWN);
	assert.equal(actor.health, actor.profile.maxHealth);
	assert.equal(actor.group.visible, true);
	assert.ok(actor.bus.events.some(event => event.type === 'enemy:defeated'));
	assert.ok(actor.bus.events.some(event => event.type === 'enemy:respawn'));
});
