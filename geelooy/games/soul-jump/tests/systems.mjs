// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { SOUL_CONFIG, SOUL_GLYPHS } from '../js/config.js';
import { WorldState } from '../js/runtime/WorldState.js';
import { PlatformGenerator } from '../js/systems/PlatformGenerator.js';
import { CollisionSystem } from '../js/systems/CollisionSystem.js';

/**
 * The Awtsmoos turns rules into a playable covenant where generation, landing, and memory all answer in their hour;
 * Awtsmoos.com proves the ascent contains actual mechanics rather than a beautiful canvas without power.
 * @returns {Array<object>} Core gameplay witnesses.
 */
export function runSystemCases() {
	return [
		verifyRunInitialization(),
		verifyAheadGeneration(),
		verifyStableLanding(),
		verifyHighScorePersistence()
	];
}

function fakeCanvas() {
	return { width: 390, height: 844 };
}

function memoryStorage(initial = {}) {
	const values = new Map(Object.entries(initial));
	return {
		getItem(key) {
			return values.has(key) ? values.get(key) : null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		}
	};
}

function verifyRunInitialization() {
	const state = new WorldState(fakeCanvas(), SOUL_CONFIG, SOUL_GLYPHS, memoryStorage());
	state.reset(fakeCanvas());

	assert.equal(state.gameState, 'playing');
	assert.equal(state.platforms.length, 15);
	assert.equal(state.backgroundParticles.length, SOUL_CONFIG.backgroundParticles);
	assert.ok(state.player);

	return { test: 'systems-run-initialization', platforms: state.platforms.length };
}

function verifyAheadGeneration() {
	const canvas = fakeCanvas();
	const state = new WorldState(canvas, SOUL_CONFIG, SOUL_GLYPHS, memoryStorage());
	const generator = new PlatformGenerator(SOUL_CONFIG, SOUL_GLYPHS);
	state.reset(canvas);
	const before = state.platforms.length;
	generator.ensureAhead(state, -900, canvas);

	assert.ok(state.platforms.length > before);
	assert.ok(state.platforms.at(-1).y <= -1020);

	return { test: 'systems-ahead-generation', before, after: state.platforms.length };
}

function verifyStableLanding() {
	const canvas = fakeCanvas();
	const state = new WorldState(canvas, SOUL_CONFIG, SOUL_GLYPHS, memoryStorage());
	const collisions = new CollisionSystem(SOUL_CONFIG, SOUL_GLYPHS);
	state.reset(canvas);
	const platform = state.platforms[0];
	state.player.cx = platform.x + platform.width / 2;
	state.player.prevCx = state.player.cx;
	state.player.prevCy = platform.y - SOUL_CONFIG.playerHeight / 2 - 3;
	state.player.cy = platform.y - SOUL_CONFIG.playerHeight / 2 + 3;
	state.player.vy = 6;
	collisions.resolve(state);

	assert.equal(state.player.vy, SOUL_CONFIG.jumpForce);
	assert.equal(state.gameState, 'playing');

	return { test: 'systems-stable-landing', velocityY: state.player.vy };
}

function verifyHighScorePersistence() {
	const storage = memoryStorage();
	const state = new WorldState(fakeCanvas(), SOUL_CONFIG, SOUL_GLYPHS, storage);
	state.reset(fakeCanvas());
	state.score = 123;
	state.endRun();
	const nextState = new WorldState(fakeCanvas(), SOUL_CONFIG, SOUL_GLYPHS, storage);

	assert.equal(nextState.highScore, 123);

	return { test: 'systems-high-score-persistence', highScore: nextState.highScore };
}
