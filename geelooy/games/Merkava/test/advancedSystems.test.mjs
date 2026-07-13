//B"H
// Boruch Hashem
// Blessed is He
/**
 * Advanced systems are weighed as strategic effects rather than decorative names.
 * The Awtsmoos is beyond proof while Awtsmoos.com reveals finite evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilitySystem } from '../src/game/AbilitySystem.js';
import { CampaignDirector } from '../src/game/CampaignDirector.js';
import { createGate } from '../src/game/EntityFactory.js';
import { GameState } from '../src/game/GameState.js';
import { RelicSystem } from '../src/game/RelicSystem.js';
import { WorldHazardSystem } from '../src/game/WorldHazardSystem.js';

test('full blessing meter opens a fragment choice without advancing level', () => {
	const state = runningState();
	state.blessing = 100;
	new CampaignDirector().update(state);
	assert.equal(state.transitionRequest, 'fragment-blessing');
	assert.equal(state.pendingAdvance, false);
	assert.equal(state.paused, true);
});

test('ability selection changes the active command', () => {
	const state = new GameState();
	const abilities = new AbilitySystem();
	assert.equal(abilities.choices().length, 3);
	assert.equal(abilities.choose(state, 'shofarBlast'), true);
	assert.equal(state.abilityChosen, true);
	assert.equal(state.abilityId, 'shofarBlast');
	assert.equal(abilities.choose(state, 'unknown'), false);
});

test('Shield of Avraham absorbs exactly three collisions', () => {
	const state = new GameState();
	const relics = new RelicSystem();
	relics.applyImmediateEffect(state, 'shield');
	assert.equal(relics.absorbCollision(state), true);
	assert.equal(relics.absorbCollision(state), true);
	assert.equal(relics.absorbCollision(state), true);
	assert.equal(relics.absorbCollision(state), false);
});

test('Tablets of Fire improve positive arithmetic gates', () => {
	const state = new GameState();
	const relics = new RelicSystem();
	const before = state.positiveGateBoost;
	relics.applyImmediateEffect(state, 'tablets');
	assert.ok(state.positiveGateBoost > before);
});

test('Trumpet periodically stuns enemies and clears shots', () => {
	const state = new GameState();
	const relics = new RelicSystem();
	state.relics.push('trumpet');
	state.relicTimers.trumpet = 0;
	state.enemies.push({ stunned: 0 });
	state.enemyShots.push({ id: 'hostile' });
	relics.update(state, 0.1);
	assert.equal(state.enemyShots.length, 0);
	assert.equal(state.enemies[0].stunned, 1.5);
	assert.equal(state.relicTimers.trumpet, 8);
});

test('world hazards always preserve one safe lane', () => {
	const state = runningState();
	const hazards = new WorldHazardSystem();
	state.worldIndex = 1;
	state.hazardClock = 0;
	hazards.update(state, 0.1);
	const warningLanes = new Set(state.warnings.map(warning => warning.lane));
	assert.equal(warningLanes.size, 2);
	assert.equal(state.events.at(-1).type, 'world-warning');
	assert.ok(!warningLanes.has(state.events.at(-1).detail.safeLane));
});

test('world warnings resolve without deleting boss warnings', () => {
	const state = runningState();
	const hazards = new WorldHazardSystem();
	state.worldIndex = 1;
	state.warnings.push({ source: 'world', lane: 0, duration: 0, resolved: false });
	state.warnings.push({ source: 'boss', lane: 2, duration: 0.5, resolved: false });
	hazards.update(state, 0.1);
	assert.equal(state.enemyShots.length, 1);
	assert.ok(state.warnings.some(warning => warning.source === 'boss'));
});

test('Beriah illusion gates visibly change their value', () => {
	const state = runningState();
	const hazards = new WorldHazardSystem();
	state.worldIndex = 2;
	state.elapsed = 1.1;
	state.gates.push(createGate(1, -20, 'add', 6, 'positive'));
	hazards.update(state, 0);
	assert.notEqual(state.gates[0].label, '+6');
});

function runningState() {
	const state = new GameState();
	state.running = true;
	return state;
}
