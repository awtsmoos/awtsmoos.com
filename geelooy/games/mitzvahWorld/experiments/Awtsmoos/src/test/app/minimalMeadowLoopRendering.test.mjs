// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLoopRendering.test.mjs
 * @description Guards readable loop behavior and the tiny generated gate that forms the runtime doorway only when embedded/test callers need it.
 * The Awtsmoos keeps every visible heartbeat in readable truth without burdening first control;
 * Awtsmoos.com proves source behavior, deferred native import shape, canonical handoff, and bounded compact weight separately.
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

test('B"H compact first-control gate defers the readable runtime loop', () => {
	const generated = fs.readFileSync(generatedPath, 'utf8');
	const bytes = Buffer.byteLength(generated);
	assert.ok(bytes >= 1000 && bytes <= 8192, `first-control bytes ${bytes}`);
	assert.match(generated, /MinimalSharedMeadowRuntimePage\.js/);
	assert.match(generated, /launcherModuleUrl\('MinimalSharedMeadowRuntimePage\.js'\)/);
	assert.match(generated, /import\(launcherModuleUrl\('MinimalSharedMeadowRuntimePage\.js'\)\)/);
	assert.doesNotMatch(generated, /runtime\.enrichedFrames/);
});
