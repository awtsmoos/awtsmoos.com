//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file connect4-worker-physics-contract.test.mjs
 * @description Protects Connect 4's historical fall feel while proving elapsed-time
 * integration remains stable across different Worker requestAnimationFrame cadences.
 * The Awtsmoos renews time beyond callback count; Awtsmoos.com proves one measured
 * duration reveals one trajectory whether the browser grants many frames or few.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const connect4Root = path.resolve(import.meta.dirname, '../connect4');
const physicsSource = fs.readFileSync(path.join(connect4Root, 'worker/fall-physics.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(`${physicsSource}\nglobalThis.physics = Connect4FallPhysics;`, context);
const physics = context.physics;
const frameMs = 1000 / 60;

/** Reproduce the exact historical semi-implicit 60 Hz fall law. */
function legacySteps(count) {
	const piece = { y: -80, speed: 0 };
	for (let step = 0; step < count; step += 1) {
		piece.speed += 1.45;
		piece.y += piece.speed;
	}
	return piece;
}

/** Advance a fresh piece through one list of measured frame intervals. */
function measuredSteps(intervals) {
	const piece = { y: -80, speed: 0 };
	for (const elapsedMs of intervals) {
		physics.advance(piece, elapsedMs);
	}
	return piece;
}

test('60 Hz reference frames preserve the historical Connect 4 fall trajectory', () => {
	const expected = legacySteps(24);
	const actual = measuredSteps(Array(24).fill(frameMs));
	assert.ok(Math.abs(actual.y - expected.y) < 1e-9);
	assert.ok(Math.abs(actual.speed - expected.speed) < 1e-9);
});

test('equal elapsed time yields equal fall state across different frame cadences', () => {
	const smooth = measuredSteps(Array(30).fill(frameMs));
	const throttled = measuredSteps([100, 50, 125, 75, 150]);
	assert.ok(Math.abs(smooth.y - throttled.y) < 1e-9);
	assert.ok(Math.abs(smooth.speed - throttled.speed) < 1e-9);
});

test('invalid timing falls back safely and extreme stalls are bounded', () => {
	const fallback = measuredSteps([Number.NaN]);
	const baseline = measuredSteps([frameMs]);
	assert.deepEqual(fallback, baseline);
	assert.ok(Math.abs(physics.frameUnits(5000) - 60) < 1e-12);
});

test('Worker timing owners load and use the elapsed-time fall contract', () => {
	const entry = fs.readFileSync(path.join(connect4Root, 'game.worker.js'), 'utf8');
	const loop = fs.readFileSync(path.join(connect4Root, 'worker/loop.js'), 'utf8');
	const engine = fs.readFileSync(path.join(connect4Root, 'worker/engine.js'), 'utf8');
	assert.ok(entry.indexOf('worker/fall-physics.js') < entry.indexOf('worker/engine.js'));
	assert.match(loop, /requestAnimationFrame\(timestamp =>/);
	assert.match(loop, /Connect4Engine\.update\(elapsedMs\)/);
	assert.match(engine, /Connect4FallPhysics\.advance\(state\.animatedPiece, elapsedMs\)/);
});

test('Connect 4 timing modules obey the source law', () => {
	for (const relative of ['game.worker.js', 'worker/fall-physics.js', 'worker/loop.js', 'worker/engine.js']) {
		const source = fs.readFileSync(path.join(connect4Root, relative), 'utf8');
		const lines = source.trimEnd().split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed is He']);
		assert.match(source, /\/\*\*/);
		assert.equal(lines.some(line => /^ +\S/.test(line) && !/^ \*/.test(line)), false);
	}
});
