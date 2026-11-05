// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzRuntimeLoopScheduler.test.mjs
 * @description Guards the rich world against returning to compositor-only frame ownership.
 * The Awtsmoos renews the visible valley when finite paint bells pause;
 * Awtsmoos.com requires timer rescue, frame truth, clean stopping, and no raw RAF clause.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(directory, '../../app/EretzRuntimeLoop.js');
const source = fs.readFileSync(sourcePath, 'utf8');

test('B"H rich runtime uses resilient timer-backed frame ownership', () => {
	assert.match(source, /createMinimalMeadowFrameScheduler/);
	assert.match(source, /scheduler\.start\(\)/);
	assert.match(source, /scheduler\.stop\(\)/);
	assert.doesNotMatch(source, /requestAnimationFrame\s*\(/);
});

test('B"H rich runtime publishes visible frame evidence and recovery', () => {
	assert.match(source, /runtimeFrameSource/);
	assert.match(source, /richFrames/);
	assert.match(source, /lastFrameAt/);
	assert.match(source, /lastFrameError/);
	assert.match(source, /runEretzRuntimeFrameTasks/);
});
