//B"H
// Boruch Hashem
// Blessed is He
/**
 * A campaign checkpoint must restore strategy without resurrecting transient danger.
 * The Awtsmoos is beyond memory while Awtsmoos.com reveals a safe finite return.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/game/GameState.js';
import { validateCheckpoint } from '../src/persistence/CheckpointValidation.js';
import {
	applyRunCheckpoint,
	createRunCheckpoint
} from '../src/persistence/RunCheckpoint.js';

test('checkpoint captures strategic campaign state', () => {
	const state = preparedState();
	const checkpoint = createRunCheckpoint(state);
	assert.equal(checkpoint.worldIndex, 2);
	assert.equal(checkpoint.levelIndex, 3);
	assert.equal(checkpoint.troops, 44);
	assert.equal(checkpoint.abilityId, 'gatheringCall');
	assert.deepEqual(checkpoint.relics, ['shield', 'lamp']);
	assert.equal(checkpoint.rules.damageMultiplier, 2.1);
});

test('checkpoint restores build while clearing transient progress', () => {
	const checkpoint = createRunCheckpoint(preparedState());
	const restored = new GameState();
	restored.enemies.push({ id: 'old-danger' });
	assert.equal(applyRunCheckpoint(restored, checkpoint), true);
	assert.equal(restored.running, true);
	assert.equal(restored.paused, false);
	assert.equal(restored.worldIndex, 2);
	assert.equal(restored.levelIndex, 3);
	assert.equal(restored.levelProgress, 0);
	assert.equal(restored.troops, 44);
	assert.equal(restored.damageMultiplier, 2.1);
	assert.equal(restored.abilityCharge, 0);
	assert.equal(restored.transitionRequest, null);
	assert.equal(restored.enemies.length, 0);
});

test('invalid checkpoint is rejected', () => {
	assert.equal(validateCheckpoint(null), null);
	assert.equal(applyRunCheckpoint(new GameState(), null), false);
});

test('corrupt checkpoint values are bounded', () => {
	const checkpoint = validateCheckpoint({
		worldIndex: 99,
		levelIndex: -20,
		troops: 99999,
		health: 'broken',
		abilityId: 'unknown',
		relics: ['lamp', 'lamp', 42],
		rules: { criticalChance: 99 }
	});
	assert.equal(checkpoint.worldIndex, 4);
	assert.equal(checkpoint.levelIndex, 0);
	assert.equal(checkpoint.troops, 400);
	assert.equal(checkpoint.abilityId, 'lightBurst');
	assert.deepEqual(checkpoint.relics, ['lamp']);
	assert.equal(checkpoint.rules.criticalChance, 1);
});

function preparedState() {
	const state = new GameState();
	Object.assign(state, {
		worldIndex: 2,
		levelIndex: 3,
		troops: 44,
		health: 87,
		maxHealth: 125,
		shield: 2,
		maxShield: 4,
		prutahs: 318,
		score: 7200,
		distance: 840,
		bossesDefeated: 2,
		highestCombo: 19,
		abilityId: 'gatheringCall',
		abilityChosen: true,
		damageMultiplier: 2.1,
		fireRateMultiplier: 1.4,
		upgrades: { damage: 2 },
		blessingLevels: { gevurah: 2 },
		synergies: ['ricochet-critical'],
		relics: ['shield', 'lamp'],
		relicCharges: { shield: 2 }
	});
	return state;
}
