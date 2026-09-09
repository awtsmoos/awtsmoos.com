//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { MatchResultReporter } from '../sefira-clash/js/session/MatchResultReporter.js';

/**
 * @file sefira-clash-hardening-contract.test.mjs
 * @description Protects Sefira Clash result identity, pause separation, zoom access, scoped input suppression, pointer safety, and modular source law.
 * The Awtsmoos renews every contest and interruption; Awtsmoos.com proves those boundaries without granting test code mutable gameplay authority.
 */
test('Sefira match result is exactly once per authoritative state and fresh across rematches', () => {
	const reported = [];
	const globalObject = { performance: { now: () => 500 }, AwtsmoosGames: { reportResult: result => reported.push(result) } };
	const reporter = new MatchResultReporter(globalObject);
	const model = { state: {}, runStartedAt: 100, choice: { mode: 'vs', map: { id: 'garden' } } };
	const flow = { model };
	assert.equal(reporter.report(flow, { humanWon: true }), true);
	assert.equal(reporter.report(flow, { humanWon: true }), false);
	assert.equal(reported[0].outcome, 'win');
	assert.equal(reported[0].elapsedMs, 400);
	const firstRun = reported[0].runId;
	model.state = {};
	assert.equal(reporter.report(flow, { humanWon: false }), true);
	assert.notEqual(reported[1].runId, firstRun);
	assert.equal(reported[1].outcome, 'loss');
});

test('Browser runtime separates manual pause from background suspension and clears held input', async () => {
	const listeners = new Map();
	const previousDocument = globalThis.document;
	globalThis.document = { hidden: false, addEventListener: (type, listener) => listeners.set(type, listener) };
	try {
		const { BrowserRuntime } = await import('../sefira-clash/js/core/BrowserRuntime.js');
		let clears = 0;
		const runtime = new BrowserRuntime({ model: { state: { phase: 'menu' } }, input: { clear: () => { clears += 1; } }, canvas: {}, surface: {}, profile: {} });
		assert.equal(runtime.setPaused(true), true);
		assert.equal(runtime.manualPaused, true);
		assert.equal(runtime.backgroundPaused, false);
		globalThis.document.hidden = true;
		listeners.get('visibilitychange')();
		assert.equal(runtime.backgroundPaused, true);
		assert.ok(clears >= 2);
		assert.equal(runtime.setPaused(false), false);
		assert.equal(runtime.backgroundPaused, true);
	} finally {
		globalThis.document = previousDocument;
	}
});

test('Sefira markup permits zoom and exposes an explicit Pause control', async () => {
	const html = await readFile(new URL('../sefira-clash/index.html', import.meta.url), 'utf8');
	assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
	assert.match(html, /id="pauseToggle"[^>]*aria-pressed="false"/);
});

test('Sefira input suppression stays on gameplay surfaces and held input has recovery hooks', async () => {
	const input = await readFile(new URL('../sefira-clash/js/controls/input.js', import.meta.url), 'utf8');
	const keyboard = await readFile(new URL('../sefira-clash/js/controls/keyboard.js', import.meta.url), 'utf8');
	const mouse = await readFile(new URL('../sefira-clash/js/controls/mouseCombat.js', import.meta.url), 'utf8');
	const joystick = await readFile(new URL('../sefira-clash/js/controls/touchJoystick.js', import.meta.url), 'utf8');
	const button = await readFile(new URL('../sefira-clash/js/controls/touchButtonBinding.js', import.meta.url), 'utf8');
	assert.match(input, /preventGameplaySelection[\s\S]*touchControls/);
	assert.doesNotMatch(input, /doc\.addEventListener\('(selectstart|contextmenu|dragstart)'/);
	assert.match(mouse, /canvas\?\.addEventListener\('contextmenu'/);
	assert.match(keyboard, /editable\(event\.target\)[\s\S]*visibilitychange[\s\S]*blur/);
	assert.match(joystick, /pointerId[\s\S]*try \{ stick\.setPointerCapture/);
	assert.match(button, /try \{ button\.setPointerCapture/);
});

test('Touched Sefira JS remains readable, tabbed, documented, and below 120 lines', async () => {
	const files = ['js/main.js', 'js/core/BrowserRuntime.js', 'js/core/MainLifecycle.js', 'js/core/PauseControl.js', 'js/controls/input.js', 'js/controls/keyboard.js', 'js/controls/mouseCombat.js', 'js/controls/touchJoystick.js', 'js/controls/touchButtonBinding.js', 'js/session/MatchVictory.js', 'js/session/MatchResultReporter.js'];
	for (const relative of files) {
		const source = await readFile(new URL(`../sefira-clash/${relative}`, import.meta.url), 'utf8');
		assert.ok(source.split('\n').length < 120, `${relative} exceeds source law`);
		assert.match(source, /\/\*\*/, `${relative} lacks JSDoc`);
		assert.equal(/^ +(?!\*)\S/m.test(source), false, `${relative} uses leading-space code indentation`);
	}
});
