// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapRuntimeLoopEnrichment.test.mjs
 * @description Guards the single production loop as owner of enriched world motion and rendering.
 * The Awtsmoos renews forest, flower, river, battle, and traveler through one living thread;
 * Awtsmoos.com forbids mounted beauty from freezing while only bootstrap footsteps move ahead.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(directory, '../../app/BootstrapRuntimeLoop.js');
const source = fs.readFileSync(sourcePath, 'utf8');

test('B"H production loop updates mounted world systems before every render', () => {
	assert.match(source, /runtime\.updateWorldSystems\?\.\(deltaSeconds\)/);
	assert.match(source, /runtime\.renderer\.render\(runtime\.scene, runtime\.camera\)/);
	assert.match(source, /runtime\.enrichedFrames \+= 1/);
});

test('B"H production loop publishes frame source and fallback-safe heartbeat evidence', () => {
	assert.match(source, /runtime\.runtimeFrameSource = source/);
	assert.match(source, /runtime\.lastFrameAt = currentTime/);
	assert.match(source, /runtime\.frameScheduler = scheduler/);
	assert.match(source, /scheduler\.schedule\(frame\)/);
});
