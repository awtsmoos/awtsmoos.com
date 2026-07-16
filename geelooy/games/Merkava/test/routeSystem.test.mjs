//B"H
// Boruch Hashem
// Blessed is He
/**
 * Seeded roads are tested as repeatable bargains whose rewards alter the actual run.
 * The Awtsmoos is beyond branch and result while Awtsmoos.com reveals honest proof.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/game/GameState.js';
import { validateCheckpoint } from '../src/persistence/CheckpointValidation.js';
import {
	applyRunCheckpoint,
	createRunCheckpoint
} from '../src/persistence/RunCheckpoint.js';
import { SAFE_ROUTE_ID } from '../src/routes/RouteCatalog.js';
import { applyRouteEffect } from '../src/routes/RouteEffects.js';
import { generateRouteChoices } from '../src/routes/RouteGenerator.js';
import { RouteSystem } from '../src/routes/RouteSystem.js';

test('equal route inputs generate equal unique choices with a safe road', () => {
	const first = generateRouteChoices(7731, 4, 2);
	const second = generateRouteChoices(7731, 4, 2);
	assert.deepEqual(first, second);
	assert.equal(first.length, 3);
	assert.equal(new Set(first.map(route => route.id)).size, 3);
	assert.ok(first.some(route => route.id === SAFE_ROUTE_ID));
});

test('route system accepts only offered roads and records the choice', () => {
	const state = new GameState({}, 991);
	const routes = new RouteSystem();
	assert.equal(routes.choose(state, SAFE_ROUTE_ID).ok, false);
	const choices = routes.prepare(state);
	const before = state.troops;
	const result = routes.choose(state, choices[0].id);
	assert.equal(result.ok, true);
	assert.equal(state.troops, before + 6);
	assert.equal(state.routeStep, 1);
	assert.deepEqual(state.routeHistory, [SAFE_ROUTE_ID]);
	assert.equal(state.routeChoices.length, 0);
});

test('elite and healing routes preserve survival and maximum health', () => {
	const state = new GameState({}, 42);
	state.health = 5;
	state.maxHealth = 100;
	assert.equal(applyRouteEffect(state, 'elite-ambush').ok, true);
	assert.equal(state.health, 1);
	assert.equal(state.prutahs, 55);
	assert.equal(applyRouteEffect(state, 'healing-spring').ok, true);
	assert.equal(state.health, 31);
});

test('gevurah and Prutah roads change lasting combat and economy rules', () => {
	const state = new GameState({}, 42);
	state.maxHealth = 22;
	state.health = 22;
	applyRouteEffect(state, 'gevurah-trial');
	applyRouteEffect(state, 'prutah-storm');
	assert.equal(state.maxHealth, 20);
	assert.equal(state.health, 20);
	assert.equal(state.damageMultiplier, 1.12);
	assert.equal(state.prutahValueMultiplier, 1.15);
});

test('checkpoint round trip preserves route history but rebuilds cards', () => {
	const source = new GameState({}, 43021);
	Object.assign(source, {
		routeStep: 3,
		routeHistory: ['guarded-road', 'prutah-vault'],
		routeModifier: 'prutah-vault'
	});
	source.routeChoices = generateRouteChoices(source.runSeed, 3, 0);
	const checkpoint = createRunCheckpoint(source);
	const restored = new GameState({}, 7);
	assert.equal(applyRunCheckpoint(restored, checkpoint), true);
	assert.equal(restored.runSeed, 43021);
	assert.equal(restored.routeStep, 3);
	assert.deepEqual(restored.routeHistory, source.routeHistory);
	assert.equal(restored.routeModifier, 'prutah-vault');
	assert.deepEqual(restored.routeChoices, []);
});

test('malformed route checkpoint data is repaired', () => {
	const checkpoint = validateCheckpoint({
		runSeed: 'broken',
		routeStep: -90,
		routeHistory: ['guarded-road', 'unknown', 12],
		routeModifier: 'unknown'
	});
	assert.equal(checkpoint.runSeed, 1);
	assert.equal(checkpoint.routeStep, 0);
	assert.deepEqual(checkpoint.routeHistory, ['guarded-road']);
	assert.equal(checkpoint.routeModifier, null);
});
