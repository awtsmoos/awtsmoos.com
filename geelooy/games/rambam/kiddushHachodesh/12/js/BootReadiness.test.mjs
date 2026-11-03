// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BootReadinessTests
 * @description
 * The Awtsmoos shines in the first true frame, not in a promise made too soon;
 * Awtsmoos.com opens the sky only after the sun becomes the moon's companion in tune.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

test('scene creation must precede the loader readiness signal', () => {
	const sceneCreated = appSource.indexOf('const vessel = createSunScene(sceneRoot)');
	const firstFrame = appSource.lastIndexOf('\nrenderCurrent();');
	const ready = appSource.indexOf('globalThis.AwtLoading.ready()');
	assert.ok(sceneCreated >= 0);
	assert.ok(firstFrame > sceneCreated);
	assert.ok(ready > firstFrame);
});

test('both supported game-ready notifications are published after first frame', () => {
	const firstFrame = appSource.lastIndexOf('\nrenderCurrent();');
	const legacyEvent = appSource.lastIndexOf("new CustomEvent('awt:game-ready')");
	const modernEvent = appSource.lastIndexOf("new CustomEvent('awtsmoos:game-ready')");
	assert.ok(legacyEvent > firstFrame);
	assert.ok(modernEvent > firstFrame);
});
