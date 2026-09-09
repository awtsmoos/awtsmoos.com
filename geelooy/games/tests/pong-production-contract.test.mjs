//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const gamesRoot = path.resolve(import.meta.dirname, '..');
const source = relative => fs.readFileSync(path.join(gamesRoot, relative), 'utf8');

/** Evaluate one classic Pong helper and expose its requested factory. */
function classic(relative, factoryName, additions = {}) {
	const context = vm.createContext({ ...additions });
	vm.runInContext(`${source(relative)}\nthis.factory = ${factoryName};`, context);
	return context.factory;
}

test('Pong active clock excludes paused wall time', () => {
	let now = 1000;
	const createUpdater = classic('pong/js/match-update.js', 'createPongUpdater', {
		performance: { now: () => now },
		createParticleExplosion() {}
	});
	const actor = { score: 0, speed: 3, update() {} };
	const ball = { x: 100, y: 100, size: 20, speed: 5, dx: 5, update() {}, reset() {} };
	const updater = createUpdater({
		canvas: { width: 400, height: 300 },
		player: { ...actor },
		ai: { ...actor },
		ball,
		getRandomEmoji: () => '✨',
		now: () => now
	});
	updater.reset();
	now += 4000;
	updater.pause();
	now += 9000;
	assert.equal(updater.elapsedMs(), 4000);
	updater.resume();
	now += 1000;
	assert.equal(updater.elapsedMs(), 5000);
});

test('Pong lifecycle keeps user pause independent and owns one RAF', () => {
	let nextFrame = 0;
	const scheduled = new Set();
	const listeners = {};
	const createLifecycle = classic('pong/js/lifecycle.js', 'createPongLifecycle', {
		document: {
			hidden: false,
			addEventListener(type, handler) { listeners[type] = handler; }
		},
		requestAnimationFrame(handler) {
			nextFrame += 1;
			scheduled.add(nextFrame);
			return nextFrame;
		},
		cancelAnimationFrame(id) { scheduled.delete(id); }
	});
	let resets = 0;
	const lifecycle = createLifecycle({ reset: () => { resets += 1; }, frame: () => true });
	lifecycle.start();
	assert.equal(resets, 1);
	assert.equal(scheduled.size, 1);
	assert.equal(lifecycle.toggleUserPause(), true);
	assert.equal(scheduled.size, 0);
	assert.equal(lifecycle.toggleUserPause(), false);
	assert.equal(scheduled.size, 1);
});

test('Pong doorway exposes deliberate lifecycle and current shell', () => {
	const html = source('pong/index.html');
	assert.match(html, /id="pongStartButton"/);
	assert.match(html, /id="pongPauseButton"/);
	assert.match(html, /id="pongRematchButton"/);
	assert.match(html, /player-shell-003/);
	assert.doesNotMatch(html, /user-scalable=no/);
});

test('touched Pong modules obey the production source law', () => {
	const files = [
		'pong/js/main.js',
		'pong/js/controls.js',
		'pong/js/match-update.js',
		'pong/js/result.js',
		'pong/js/court.js',
		'pong/js/lifecycle.js',
		'pong/js/session-ui.js'
	];
	for (const file of files) {
		const text = source(file);
		const lines = text.split('\n');
		const badIndent = lines.filter(line => /^ +\S/.test(line) && !/^ +\*/.test(line));
		assert.ok(lines.length <= 121, `${file} must remain at or below 120 lines`);
		assert.ok(text.startsWith('//B"H\n//Boruch Hashem\n//Blessed be He\n'), `${file} header`);
		assert.match(text, /\/\*\*[\s\S]*@file/, `${file} needs substantial JSDoc`);
		assert.deepEqual(badIndent, [], `${file} must use tabs for code indentation`);
	}
});
