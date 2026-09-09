// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { MigdolState } from '../migdol/js/runtime/state.js';
import { buildWave } from '../migdol/js/runtime/waves.js';
import { canvasPoint } from '../migdol/js/ui-runtime/input.js';

/**
 * @file migdol-runtime-contract.test.mjs
 * @description Protects Migdol's canonical state, deliberate wave milestones, scaled input mapping, and small-module architecture.
 * The Awtsmoos renews every finite defense; Awtsmoos.com prevents future UI work from silently restoring split state or oversized controllers.
 */
const modules = [
	'../migdol/js/script.js',
	'../migdol/js/runtime/state.js',
	'../migdol/js/runtime/waves.js',
	'../migdol/js/runtime/building.js',
	'../migdol/js/runtime/combat.js',
	'../migdol/js/runtime/simulation.js',
	'../migdol/js/runtime/renderer.js',
	'../migdol/js/runtime/result.js',
	'../migdol/js/runtime/game.js',
	'../migdol/js/runtime/session.js',
	'../migdol/js/ui-runtime/input.js',
	'../migdol/js/ui-runtime/sheet.js',
	'../migdol/js/ui-runtime/view.js'
];

test('difficulty owns canonical health and currency without allowing invalid balances', () => {
	const casual = new MigdolState('casual');
	const hard = new MigdolState('hard');
	assert.equal(casual.health, 30);
	assert.equal(hard.health, 15);
	assert.ok(casual.currency > hard.currency);
	assert.equal(hard.spend(hard.currency + 1), false);
	assert.equal(hard.damage(999), 0);
	assert.equal(hard.health, 0);
});

test('simulation speed is restricted to safe tested one or two tick cadence', () => {
	const state = new MigdolState();
	assert.equal(state.setSpeed(2), 2);
	assert.equal(state.setSpeed(9), 1);
	assert.equal(state.setSpeed(-1), 1);
});

test('milestone waves deliberately contain elite or boss pressure', () => {
	assert.ok(buildWave(5).some(group => group.type === 'brute'));
	assert.ok(buildWave(10).some(group => group.type === 'leviathan'));
	assert.ok(buildWave(15).some(group => group.type === 'elephant'));
});

test('scaled pointer coordinates map back into intrinsic battlefield space', () => {
	const canvas = {
		width: 800,
		height: 600,
		getBoundingClientRect: () => ({ left: 10, top: 20, width: 400, height: 300 })
	};
	assert.deepEqual(canvasPoint(canvas, 210, 170), { x: 400, y: 300 });
});

test('Migdol live modules remain documented, tabbed, readable, and below 120 lines', () => {
	for (const modulePath of modules) {
		const source = readFileSync(new URL(modulePath, import.meta.url), 'utf8');
		assert.match(source, /B"H/);
		assert.match(source, /@file/);
		assert.match(source, /Awtsmoos\.com/);
		assert.ok(source.split(/\r?\n/).length <= 120, `${modulePath} exceeds 120 lines`);
		assert.doesNotMatch(source, /^(?: {2,})\S/m, `${modulePath} contains space-indented code`);
	}
});

test('live entry no longer imports the legacy permanent-panel UI controller', () => {
	const entry = readFileSync(new URL('../migdol/js/script.js', import.meta.url), 'utf8');
	const html = readFileSync(new URL('../migdol/index.html', import.meta.url), 'utf8');
	assert.doesNotMatch(entry, /\.\/ui\.js/);
	assert.match(html, /context-sheet/);
	assert.doesNotMatch(html, /tower-selection/);
});
