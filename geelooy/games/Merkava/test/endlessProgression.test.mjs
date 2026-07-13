//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign completion and endless renewal must diverge only at the final threshold.
 * The Awtsmoos is beyond endings while Awtsmoos.com reveals deterministic roads.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { BOSS_PROFILES } from '../src/config/campaignConfig.js';
import { CampaignDirector } from '../src/game/CampaignDirector.js';
import { GameState } from '../src/game/GameState.js';
import { PrutahSystem } from '../src/game/PrutahSystem.js';
import { applyEndlessCycle } from '../src/modes/EndlessRules.js';
import {
	applyRunCheckpoint,
	createRunCheckpoint
} from '../src/persistence/RunCheckpoint.js';

test('campaign still ends after the fifth world', () => {
	const state = finalState('campaign');
	new CampaignDirector().advance(state);
	assert.equal(state.victory, true);
	assert.equal(state.running, false);
	assert.equal(state.worldIndex, 4);
});

test('endless mode renews after the fifth world', () => {
	const state = finalState('endless');
	applyEndlessCycle(state, 4);
	new CampaignDirector().advance(state);
	assert.equal(state.victory, false);
	assert.equal(state.running, true);
	assert.equal(state.worldIndex, 0);
	assert.equal(state.levelIndex, 0);
	assert.equal(state.endlessCycle, 5);
	assert.ok(state.events.some(event => event.type === 'endless-cycle'));
});

test('endless boss endurance scales without replacing identity', () => {
	const state = new GameState();
	state.reset({}, 'endless');
	applyEndlessCycle(state, 6);
	state.worldIndex = 0;
	new CampaignDirector().ensureBoss(state);
	assert.equal(state.boss.name, BOSS_PROFILES[0].name);
	assert.ok(state.boss.maxHealth > BOSS_PROFILES[0].health);
	assert.ok(Array.isArray(state.boss.thresholds));
});

test('endless Prutah collection carries a real reward increase', () => {
	const state = new GameState();
	state.reset({}, 'endless');
	applyEndlessCycle(state, 10);
	const reward = new PrutahSystem().collect(state, {
		golden: false,
		collected: false
	});
	assert.ok(reward > 1);
	assert.equal(state.prutahs, reward);
});

test('checkpoint restores endless mode and exact cycle', () => {
	const state = new GameState();
	state.reset({}, 'endless');
	applyEndlessCycle(state, 12);
	state.worldIndex = 3;
	state.levelIndex = 2;
	state.troops = 71;
	const checkpoint = createRunCheckpoint(state);
	const restored = new GameState();
	assert.equal(applyRunCheckpoint(restored, checkpoint), true);
	assert.equal(restored.runMode, 'endless');
	assert.equal(restored.endlessCycle, 12);
	assert.equal(restored.worldIndex, 3);
	assert.equal(restored.levelIndex, 2);
	assert.equal(restored.troops, 71);
	assert.ok(restored.endlessSpeedMultiplier > 1);
});

function finalState(runMode) {
	const state = new GameState();
	state.reset({}, runMode);
	state.running = true;
	state.worldIndex = 4;
	state.levelIndex = 4;
	state.pendingAdvance = true;
	return state;
}
