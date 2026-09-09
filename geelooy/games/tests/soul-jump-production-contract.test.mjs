//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const gamesRoot = path.resolve(import.meta.dirname, '..');
const source = relative => fs.readFileSync(path.join(gamesRoot, relative), 'utf8');

/** Import one module through its absolute file URL without requiring package-wide ESM mode. */
async function importGame(relative) {
	return import(`${pathToFileURL(path.join(gamesRoot, relative)).href}?test=${Date.now()}-${Math.random()}`);
}

test('Soul Jump result timing excludes paused wall time and publishes once', async () => {
	const { RunResultReporter } = await importGame('soul-jump/js/runtime/RunResultReporter.js');
	let now = 100;
	const published = [];
	const reporter = new RunResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	}, () => now);
	reporter.begin();
	now = 200;
	reporter.setPaused(true);
	now = 700;
	reporter.setPaused(false);
	now = 900;
	const result = reporter.finish(42, 2);
	assert.equal(result.elapsedMs, 300);
	assert.equal(result.level, 3);
	assert.equal(published.length, 1);
	assert.equal(reporter.finish(99, 4), null);
});

test('Soul Jump doorway exposes current shell and semantic lifecycle controls', () => {
	const html = source('soul-jump/index.html');
	assert.match(html, /player-shell-003/);
	assert.match(html, /id="soulPauseButton"/);
	assert.match(html, /id="soulResult"/);
	assert.match(html, /id="soulRetryButton"/);
	assert.doesNotMatch(html, /user-scalable\s*=\s*no/i);
});

test('Soul Jump runtime delegates loop, result, viewport, and diagnostics', () => {
	const runtime = source('soul-jump/js/runtime/GameRuntime.js');
	assert.match(runtime, /new RuntimeLoop/);
	assert.match(runtime, /new RunResultReporter/);
	assert.match(runtime, /new Viewport/);
	assert.match(runtime, /createRuntimeSnapshot/);
	assert.match(runtime, /onResult\?\./);
});

test('Soul Jump input separates live run from controllable run', () => {
	const input = source('soul-jump/js/input/DragInput.js');
	assert.match(input, /isRunActive/);
	assert.match(input, /canControl/);
	assert.doesNotMatch(input, /touchstart|touchmove/);
});

const touched = [
	'soul-jump/main.js',
	'soul-jump/js/input/DragInput.js',
	'soul-jump/js/runtime/GameRuntime.js',
	'soul-jump/js/runtime/RunResultReporter.js',
	'soul-jump/js/runtime/RuntimeLoop.js',
	'soul-jump/js/runtime/RuntimeSnapshot.js',
	'soul-jump/js/runtime/SessionUi.js',
	'soul-jump/js/runtime/Viewport.js'
];

test('touched Soul Jump modules obey the production source law', () => {
	for (const relative of touched) {
		const text = source(relative);
		const lines = text.split(/\r?\n/);
		assert.ok(lines.length <= 121, `${relative} exceeds 120 content lines`);
		assert.equal(lines[0], '//B"H', `${relative} B\"H header`);
		assert.equal(lines[1], '//Boruch Hashem', `${relative} Boruch Hashem header`);
		assert.equal(lines[2], '//Blessed be He', `${relative} Blessed be He header`);
		assert.match(text, /\/\*\*/, `${relative} needs JSDoc`);
		for (const line of lines) {
			if (!line.trim() || /^\s*\*/.test(line) || /^\s*\/\*/.test(line)) continue;
			assert.doesNotMatch(line, /^ +\S/, `${relative} must not use space indentation`);
		}
	}
});
