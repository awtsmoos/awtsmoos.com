// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLoopRendering.test.mjs
 * @description Guards source and generated first-control ownership of enriched timer-backed painting.
 * The Awtsmoos renews the visible meadow through paint and rescue with no silent branch erased;
 * Awtsmoos.com requires the compact vessel to preserve every heartbeat the source has placed.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(directory, '../../app/MinimalMeadowLoop.js');
const generatedPath = path.resolve(directory, '../../mitzvah-world.compact.js');
const source = fs.readFileSync(sourcePath, 'utf8');

test('B"H source renders and publishes evidence on every scheduler source', () => {
	assert.match(source, /runtime\.updateWorldSystems\?\.\(deltaSeconds\)/);
	assert.match(source, /runtime\.enrichedFrames/);
	assert.match(source, /runtime\.runtimeFrameSource = frame\.source/);
	assert.match(source, /runtime\.lastFrameAt = frame\.timeValue/);
	assert.doesNotMatch(source, /source === ['"]animation-frame['"]\) render/);
});

test('B"H generated first-control loop preserves enriched rescue rendering', () => {
	const generated = fs.readFileSync(generatedPath, 'utf8');
	const marker = 'compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowLoop.js';
	const start = generated.indexOf(marker);
	assert.ok(start >= 0, 'generated loop module marker must exist');
	const next = generated.indexOf('compact source:', start + marker.length);
	const moduleSource = generated.slice(start, next < 0 ? undefined : next);
	assert.match(moduleSource, /runtime\.updateWorldSystems\?\.\(deltaSeconds\)/);
	assert.match(moduleSource, /runtime\.enrichedFrames/);
	assert.match(moduleSource, /runtime\.runtimeFrameSource = frame\.source/);
	assert.match(moduleSource, /runtime\.lastFrameAt = frame\.timeValue/);
	assert.doesNotMatch(moduleSource, /source === ['"]animation-frame['"]\) render/);
});
