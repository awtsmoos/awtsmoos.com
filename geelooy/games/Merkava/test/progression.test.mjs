//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign thresholds are tested as explicit transitions rather than decorative numbers.
 * The Awtsmoos is beyond sequence while Awtsmoos.com reveals finite progression.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_PROFILES, WORLDS } from '../src/config/campaignConfig.js';
import { GAME } from '../src/config/gameConfig.js';
import { BossSystem } from '../src/game/BossSystem.js';
import { CampaignDirector } from '../src/game/CampaignDirector.js';
import { EncounterDirector } from '../src/game/EncounterDirector.js';
import { GameState } from '../src/game/GameState.js';

test('campaign contains five worlds with five named levels each', () => {
	assert.equal(WORLDS.length, 5);
	for (const world of WORLDS) {
		assert.equal(world.levels.length, 5);
		assert.equal(world.levels.at(-1).boss, true);
	}
});

test('ordinary level completion pauses for a route before blessing', () => {
	const state = new GameState({}, 1234);
	const campaign = new CampaignDirector();
	state.running = true;
	state.levelProgress = GAME.levelDistance;
	campaign.update(state);
	assert.equal(state.paused, true);
	assert.equal(state.transitionRequest, 'route');
	assert.equal(state.pendingAdvance, true);
});

test('checkpoint level completion opens the shop', () => {
	const state = new GameState();
	const campaign = new CampaignDirector();
	state.running = true;
	state.levelIndex = 1;
	state.levelProgress = GAME.levelDistance;
	campaign.update(state);
	assert.equal(state.transitionRequest, 'shop');
});

test('advancing clears lane state and enters the next level', () => {
	const state = new GameState();
	const campaign = new CampaignDirector();
	state.pendingAdvance = true;
	state.paused = true;
	state.transitionRequest = 'blessing';
	state.enemies.push({ id: 'enemy' });
	campaign.advance(state);
	assert.equal(state.levelIndex, 1);
	assert.equal(state.enemies.length, 0);
	assert.equal(state.paused, false);
});

test('boss level creates its world-specific boss', () => {
	const state = new GameState();
	const campaign = new CampaignDirector();
	state.levelIndex = 4;
	state.levelProgress = GAME.levelDistance;
	campaign.update(state);
	assert.equal(state.boss.name, BOSS_PROFILES[0].name);
	assert.equal(state.boss.maxHealth, BOSS_PROFILES[0].health);
});

test('boss defeat requests major blessing and counts victory', () => {
	const state = new GameState();
	const campaign = new CampaignDirector();
	campaign.markBossDefeated(state);
	assert.equal(state.bossesDefeated, 1);
	assert.equal(state.transitionRequest, 'major-blessing');
});

test('final world advance produces campaign victory', () => {
	const state = new GameState();
	const campaign = new CampaignDirector();
	state.worldIndex = 4;
	state.levelIndex = 4;
	state.pendingAdvance = true;
	campaign.advance(state);
	assert.equal(state.victory, true);
	assert.equal(state.running, false);
});

test('boss reward is immediate and scales by world', () => {
	const state = new GameState();
	const bossSystem = new BossSystem();
	const boss = { rewardReleased: false, worldIndex: 2 };
	const reward = bossSystem.releaseReward(state, boss);
	assert.equal(reward, 60);
	assert.equal(state.prutahs, 60);
	assert.equal(state.prutahItems.length, 18);
});

test('encounter rows preserve an unoccupied reward lane', () => {
	const state = new GameState();
	const director = new EncounterDirector();
	director.spawnRow(state);
	const occupied = new Set(state.enemies.map(enemy => enemy.lane));
	const rewardLanes = new Set(state.prutahItems.map(coin => coin.lane));
	assert.ok([...rewardLanes].some(lane => !occupied.has(lane)));
});
