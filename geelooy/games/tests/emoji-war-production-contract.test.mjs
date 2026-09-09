//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { EmojiPauseController } from '../emojis/js/runtime/pause-controller.js';
import { EmojiResultReporter } from '../emojis/js/runtime/result-reporter.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const gamesRoot = path.resolve(here, '..');

/**
 * @file emoji-war-production-contract.test.mjs
 * @description Protects Emoji War lifecycle, viewport containment, active-time result truth, pause affordance, and source-law requirements.
 * The Awtsmoos renews every finite interruption; Awtsmoos.com proves pauses and viewport changes never corrupt the run or its result.
 */
test('result reporter excludes pause time and publishes exactly once', () => {
	let now = 100;
	const published = [];
	const reporter = new EmojiResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	}, () => now);
	reporter.begin(false);
	now = 600;
	reporter.setPaused(true);
	now = 5600;
	reporter.setPaused(false);
	now = 6100;
	const result = reporter.finish(4200, 7);
	assert.equal(result.elapsedMs, 1000);
	assert.equal(result.score, 4200);
	assert.equal(result.level, 7);
	assert.equal(result.mode, 'arcade');
	assert.equal(published.length, 1);
	assert.equal(reporter.finish(9, 9), null);
});

test('pause controller composes independent lifecycle reasons', () => {
	const pauses = [];
	const attributes = new Map();
	const button = {
		hidden: true,
		textContent: '',
		setAttribute: (name, value) => attributes.set(name, value)
	};
	const controller = new EmojiPauseController({}, {
		button,
		setPaused: value => pauses.push(value),
		isPlaying: () => true
	});
	controller.reset();
	assert.equal(button.hidden, false);
	assert.equal(controller.setReason('background', true), true);
	assert.equal(controller.setReason('user', true), true);
	assert.equal(controller.setReason('background', false), true);
	assert.equal(controller.setReason('user', false), false);
	assert.deepEqual(pauses, [true, true, true, false]);
	assert.equal(attributes.get('aria-pressed'), 'false');
});

test('doorway keeps Arcade immediate and exposes zoom-friendly lifecycle chrome', () => {
	const html = fs.readFileSync(path.join(gamesRoot, 'emojis/index.html'), 'utf8');
	assert.match(html, /Play Arcade/);
	assert.match(html, /Creator · Caption Remix/);
	assert.match(html, /id="gamePauseButton"/);
	assert.match(html, /player-shell-003/);
	assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
});

test('viewport ownership keeps canvas CSS responsive and touch suppression local', () => {
	const viewport = fs.readFileSync(path.join(gamesRoot, 'emojis/js/runtime/viewport.js'), 'utf8');
	const base = fs.readFileSync(path.join(gamesRoot, 'emojis/styles/base.css'), 'utf8');
	assert.match(viewport, /visualViewport\?\.width/);
	assert.match(viewport, /dom\.canvas\.style\.width = ''/);
	assert.doesNotMatch(viewport, /style\.width = `\$\{width\}px`/);
	assert.match(base, /#k[\s\S]*touch-action: none/);
	assert.doesNotMatch(base, /body[\s\S]{0,180}touch-action: none/);
});

test('touched Emoji War modules obey the production source law', () => {
	const relativeFiles = [
		'emojis/js/game.js',
		'emojis/js/input.js',
		'emojis/js/ui-bindings.js',
		'emojis/js/runtime/pause-controller.js',
		'emojis/js/runtime/result-reporter.js',
		'emojis/js/runtime/session-state.js',
		'emojis/js/runtime/viewport.js'
	];
	for (const relativeFile of relativeFiles) {
		const source = fs.readFileSync(path.join(gamesRoot, relativeFile), 'utf8');
		const lines = source.split('\n');
		assert.ok(lines.length <= 120, `${relativeFile} exceeds 120 lines`);
		assert.ok(source.startsWith('//B"H\n//Boruch Hashem\n//Blessed be He\n'));
		assert.match(source, /\/\*\*[\s\S]*@(?:file|description)/);
		for (const line of lines) {
			if (/^ +\S/.test(line) && !/^ \*/.test(line)) {
				assert.fail(`${relativeFile} contains space indentation: ${line}`);
			}
		}
	}
});
