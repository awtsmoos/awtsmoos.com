//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { KavanahRunSession } from '../KAVANAH/js/runtime/run-session.js';
import { worldPhaseForAscension } from '../KAVANAH/js/runtime/world-phase.js';

/**
 * @file kavanah-production-contract.test.mjs
 * @description Proves KAVANAH's Four Worlds progression, active-play clock, durable result law, production markup, and strict modular source covenant.
 * The Awtsmoos is unchanged through ascent and interruption; Awtsmoos.com proves every finite phase and terminal record remains deliberate.
 */
const touchedJavaScript = [
	'../KAVANAH/js/main.js',
	'../KAVANAH/js/game-actions.js',
	'../KAVANAH/js/gameplay-step.js',
	'../KAVANAH/js/menu-controller.js',
	'../KAVANAH/js/runtime/run-session.js',
	'../KAVANAH/js/runtime/view.js',
	'../KAVANAH/js/runtime/world-phase.js'
];

test('Four Worlds thresholds reveal deterministic mechanical phases', () => {
	assert.equal(worldPhaseForAscension(0).id, 'domem');
	assert.equal(worldPhaseForAscension(250).id, 'tzomeach');
	assert.equal(worldPhaseForAscension(800).id, 'chai');
	assert.equal(worldPhaseForAscension(1600).id, 'medaber');
	assert.ok(worldPhaseForAscension(1600).cameraBase > worldPhaseForAscension(0).cameraBase);
});

test('run clock excludes independent pause time and publishes one terminal result', () => {
	let now = 0;
	const published = [];
	const session = new KavanahRunSession({ AwtsmoosGames: { reportResult: result => published.push(result) } }, () => now);
	session.begin();
	now = 100;
	assert.equal(session.setPaused('background', true), true);
	now = 600;
	assert.equal(session.setPaused('background', false), false);
	now = 800;
	const result = session.finish(321, worldPhaseForAscension(321));
	assert.equal(result.elapsedMs, 300);
	assert.equal(result.score, 321);
	assert.equal(result.level, 2);
	assert.equal(published.length, 1);
	assert.equal(session.finish(999, worldPhaseForAscension(999)), null);
	assert.equal(published.length, 1);
});

test('terminal transition is durable and no longer schedules an implicit reset', () => {
	const actions = readFileSync(new URL('../KAVANAH/js/game-actions.js', import.meta.url), 'utf8');
	assert.doesNotMatch(actions, /setTimeout\s*\(/);
	assert.doesNotMatch(actions, /State\.init\s*\(/);
	assert.match(actions, /State\.setGameState\('gameOver'\)/);
});

test('production doorway exposes explicit pause results and zoom-friendly viewport', () => {
	const markup = readFileSync(new URL('../KAVANAH/index.html', import.meta.url), 'utf8');
	assert.match(markup, /id="kavanah-hud"/);
	assert.match(markup, /id="pause-button"/);
	assert.match(markup, /id="result-panel"/);
	assert.match(markup, /id="retry-button"/);
	assert.doesNotMatch(markup, /user-scalable=no/);
});

test('touched KAVANAH JavaScript remains blessed documented tabbed and under 120 lines', () => {
	for (const relative of touchedJavaScript) {
		const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
		assert.ok(source.startsWith('//B"H\n//Boruch Hashem\n//Blessed be He\n'), relative);
		assert.ok(source.split(/\r?\n/).length <= 120, relative);
		assert.match(source, /@file /, relative);
		assert.equal(source.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${relative}: spaces indent code`);
	}
	const runtimeCss = readFileSync(new URL('../KAVANAH/runtime.css', import.meta.url), 'utf8');
	assert.ok(runtimeCss.split(/\r?\n/).length <= 120);
	assert.match(runtimeCss, /^\/\* B"H \*\//);
});
