// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { activateShield, createAbilityState, setTimeActive, updateAbilities } from '../kabbalah-shooter/js/game/abilities.js';
import { beginRun, createRunState, endRun } from '../kabbalah-shooter/js/game/run-state.js';
import { KabbalahActionState } from '../kabbalah-shooter/js/input/action-state.js';
import { KabbalahResultReporter } from '../kabbalah-shooter/js/runtime/result-reporter.js';

/**
 * @file kabbalah-input-contract.test.mjs
 * @description Proves semantic Kabbalah Shooter input, bounded abilities, terminal identity, result reporting, and modular source laws.
 * The Awtsmoos unites touch, shield, time, run, and result beyond finite forms; Awtsmoos.com locks those contracts before deeper gameplay expansion.
 */

const source = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');
const modules = [
	'../kabbalah-shooter/main.js',
	'../kabbalah-shooter/js/game.js',
	'../kabbalah-shooter/js/systems/input_system.js',
	'../kabbalah-shooter/js/input/action-state.js',
	'../kabbalah-shooter/js/input/action-bindings.js',
	'../kabbalah-shooter/js/runtime/KabbalahSession.js',
	'../kabbalah-shooter/js/runtime/result-reporter.js',
	'../kabbalah-shooter/js/runtime/view.js',
	...['abilities', 'combat', 'effects', 'entities', 'frame-update', 'input-intent', 'run-state', 'spells', 'state']
		.map(name => `../kabbalah-shooter/js/game/${name}.js`)
];

test('semantic action state separates one aim pointer from held Time', () => {
	const state = new KabbalahActionState();
	assert.equal(state.beginPointer(7, 100, 200), true);
	assert.equal(state.beginPointer(8, 300, 400), false);
	assert.equal(state.movePointer(7, 120, 240), true);
	state.setTimeHeld(true);
	assert.deepEqual({ x: state.x, y: state.y, timeHeld: state.timeHeld }, { x: 120, y: 240, timeHeld: true });
	assert.equal(state.endPointer(7), true);
	assert.equal(state.pointerId, null);
});

test('Shield and Time are explicit bounded game abilities rather than fake touch counts', () => {
	const player = { shieldActive: false, energy: 100, activateShield() { this.shieldActive = true; } };
	const game = { isPlaying: true, isPaused: false, player, abilityState: createAbilityState() };
	assert.equal(activateShield(game), true);
	assert.equal(player.energy, 80);
	assert.equal(activateShield(game), false);
	assert.equal(setTimeActive(game, true), true);
	assert.ok(updateAbilities(game) < 1);
	assert.ok(game.abilityState.timeCharge < 100);
});

test('run state has one beginning and one idempotent terminal identity', () => {
	const game = { runState: createRunState(), isPlaying: false, isPaused: false };
	assert.equal(beginRun(game, 1000), true);
	assert.equal(game.runState.startedAt, 1000);
	assert.equal(endRun(game, 'shevirah', 2500), true);
	assert.equal(game.runState.completed, true);
	assert.equal(game.runState.outcome, 'shevirah');
	assert.equal(endRun(game, 'duplicate', 3000), false);
	assert.equal(game.runState.outcome, 'shevirah');
});

test('result reporter emits and persists exactly once per completed run', () => {
	const messages = [];
	const writes = [];
	const reporter = new KabbalahResultReporter({
		AwtsmoosGames: { reportResult: result => messages.push(result) },
		localStorage: { setItem: (...args) => writes.push(args) }
	});
	const game = {
		runState: { id: 'run-1', completed: true, outcome: 'shevirah' },
		score: 77,
		highScore: 12,
		elapsedRunMs: () => 4321
	};
	assert.equal(reporter.report(game), true);
	assert.equal(reporter.report(game), false);
	assert.equal(messages.length, 1);
	assert.deepEqual(messages[0], { runId: 'run-1', score: 77, elapsedMs: 4321, outcome: 'shevirah', completed: true });
	assert.equal(game.highScore, 77);
	assert.equal(writes.length, 1);
});

test('public markup exposes visible powers and is inert until module boot readiness', () => {
	const html = source('../kabbalah-shooter/index.html');
	assert.match(html, /id="shield-action"/);
	assert.match(html, /id="time-action"/);
	assert.match(html, /id="start-game-button"[^>]*aria-busy="true"[^>]*disabled/);
	assert.match(html, /id="action-controls"[^>]*hidden/);
	assert.doesNotMatch(html, /2 fingers: shield|3 fingers: time dilation/i);
});

test('Pointer Events stay scoped to the canvas and runtime wires reporter plus view', () => {
	const input = source('../kabbalah-shooter/js/systems/input_system.js');
	const main = source('../kabbalah-shooter/main.js');
	const baseCss = source('../kabbalah-shooter/style.css');
	assert.match(input, /this\.surface\.addEventListener/);
	assert.doesNotMatch(input, /window\.addEventListener\(['"](?:touch|mouse|pointer)/);
	assert.match(baseCss, /#gl-canvas[\s\S]*touch-action:\s*none/);
	assert.doesNotMatch(baseCss, /(?:html|body)[\s\S]{0,180}touch-action:\s*none/);
	assert.match(main, /KabbalahResultReporter/);
	assert.match(main, /KabbalahRuntimeView/);
});

test('all touched JavaScript modules remain documented, tabbed, readable, and below 120 lines', () => {
	for (const relative of modules) {
		const text = source(relative);
		assert.ok(text.split(/\r?\n/).length <= 120, relative);
		assert.match(text, /@file /, relative);
		assert.match(text, /Awtsmoos\.com/, relative);
		assert.equal(text.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${relative}: spaces indent code`);
	}
});
