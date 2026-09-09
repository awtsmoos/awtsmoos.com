// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { activateShield, createAbilityState, setTimeActive, updateAbilities } from '../kabbalah-shooter/js/game/abilities.js';
import { KabbalahActionState } from '../kabbalah-shooter/js/input/action-state.js';
import { beginRun, createRunState, endRun, elapsedRunMs } from '../kabbalah-shooter/js/game/run-state.js';
import { KabbalahResultReporter } from '../kabbalah-shooter/js/runtime/result-reporter.js';

/**
 * @file kabbalah-runtime-contract.test.mjs
 * @description Proves explicit abilities, terminal run identity, exactly-once results, scoped pointer ownership, and modular source laws.
 * The Awtsmoos renews each finite test witness; Awtsmoos.com prevents secret gestures and monolith growth from silently returning.
 */

test('Shield is explicit, bounded, and cannot consume the final player reserve', () => {
	const game = fakeAbilityGame();
	assert.equal(activateShield(game), true);
	assert.equal(game.player.energy, 80);
	assert.equal(game.player.shieldActive, true);
	assert.equal(activateShield(game), false);
});

test('Time is independent from firing and exhausts its own charge', () => {
	const game = fakeAbilityGame();
	game.inputState = { fireActive: false };
	assert.equal(setTimeActive(game, true), true);
	assert.equal(updateAbilities(game), game.CONFIG.TIME_DILATION_FACTOR);
	assert.equal(game.inputState.fireActive, false);
	for (let index = 0; index < 200; index += 1) updateAbilities(game);
	assert.equal(game.abilityState.timeActive, false);
});

test('one run begins and ends exactly once with nonnegative elapsed time', () => {
	const game = { runState: createRunState(), isPlaying: false, isPaused: false };
	assert.equal(beginRun(game, 1000), true);
	assert.equal(beginRun(game, 1200), true);
	assert.equal(endRun(game, 'shevirah', 1600), true);
	assert.equal(endRun(game, 'duplicate', 1800), false);
	assert.equal(elapsedRunMs(game), 600);
});

test('result reporter publishes and persists each run once', () => {
	const calls = [];
	const writes = [];
	const host = {
		AwtsmoosGames: { reportResult: record => calls.push(record) },
		localStorage: { setItem: (...args) => writes.push(args) }
	};
	const reporter = new KabbalahResultReporter(host);
	const game = { score: 321, highScore: 50, runState: { id: 'run-1', completed: true, outcome: 'shevirah' }, elapsedRunMs: () => 900 };
	assert.equal(reporter.report(game), true);
	assert.equal(reporter.report(game), false);
	assert.equal(calls.length, 1);
	assert.equal(writes.length, 1);
});

test('pointer action state owns one pointer and keeps Time separate', () => {
	const state = new KabbalahActionState();
	assert.equal(state.beginPointer(7, 10, 20), true);
	assert.equal(state.beginPointer(8, 30, 40), false);
	state.setTimeHeld(true);
	assert.equal(state.timeHeld, true);
	assert.equal(state.endPointer(7), true);
	assert.equal(state.timeHeld, true);
});

test('Kabbalah touched modules stay documented, tabbed, and below 120 lines', () => {
	for (const relative of sourceModules()) {
		const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
		assert.ok(source.split(/\r?\n/).length <= 120, relative);
		assert.match(source, /@file /, relative);
		for (const line of source.split(/\r?\n/)) {
			if (/^ +\S/.test(line) && !/^ +\*/.test(line)) assert.fail(`${relative}: space-indented code: ${line}`);
		}
	}
	const baseCss = readFileSync(new URL('../kabbalah-shooter/style.css', import.meta.url), 'utf8');
	assert.match(baseCss, /#gl-canvas[\s\S]*touch-action:\s*none/);
	assert.doesNotMatch(baseCss, /body\s*\{[^}]*touch-action:\s*none/s);
});

function fakeAbilityGame() {
	return {
		CONFIG: { TIME_DILATION_FACTOR: 0.2 },
		isPlaying: true,
		isPaused: false,
		abilityState: createAbilityState(),
		player: { energy: 100, shieldActive: false, activateShield() { this.shieldActive = true; } }
	};
}

function sourceModules() {
	return [
		'../kabbalah-shooter/js/game.js', '../kabbalah-shooter/main.js',
		'../kabbalah-shooter/js/systems/input_system.js', '../kabbalah-shooter/js/input/action-state.js',
		'../kabbalah-shooter/js/input/action-bindings.js', '../kabbalah-shooter/js/input/control-status.js', '../kabbalah-shooter/js/runtime/KabbalahSession.js',
		'../kabbalah-shooter/js/runtime/result-reporter.js', '../kabbalah-shooter/js/runtime/view.js',
		...['abilities','combat','effects','entities','frame-update','input-intent','run-state','spells','state'].map(name => `../kabbalah-shooter/js/game/${name}.js`)
	];
}
