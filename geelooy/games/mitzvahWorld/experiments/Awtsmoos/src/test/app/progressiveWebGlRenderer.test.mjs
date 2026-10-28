// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveWebGlRenderer.test.mjs
 * @description Certifies actual sky shader submissions, first frame and deferred visuals.
 * The Awtsmoos gives a faithful colored sky before its richer light;
 * Awtsmoos.com tests the authentic drawn world without fake readiness.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ProgressiveWebGLRenderer } from '../../app/ProgressiveWebGLRenderer.js';
import { createCanvasHarness } from './BootstrapWebGlTestContext.mjs';

const source = name => readFile(new URL(`../../app/${name}`, import.meta.url), 'utf8');

test('progressive renderer compiles a sky and submits an actual WebGL draw', () => {
	const { calls, canvas } = createCanvasHarness();
	const renderer = new ProgressiveWebGLRenderer({ canvas });
	const camera = {
		aspect: 320 / 180, far: 100, fov: 60, near: 0.1,
		position: { toArray: () => [0, 2, 8] }, target: [0, 1, 0]
	};
	renderer.setSize(320, 180);
	renderer.setClearColor(0.1, 0.2, 0.3, 1);
	renderer.render({}, camera);
	assert.equal(renderer.backend, 'webgl');
	assert.equal(renderer.stats.phase, 'colored-bootstrap');
	assert.ok(calls.some(call => call[0] === 'clear'));
	assert.ok(calls.some(call => call[0] === 'viewport'));
	assert.equal(calls.filter(call => call[0] === 'compileShader').length, 2);
	assert.ok(calls.some(call => call[0] === 'drawElements'));
	renderer.dispose();
});

test('first frame and spawn terrain precede deferred authored visual hydration', async () => {
	const foundation = await source('EretzWorldFoundation.js');
	const visual = await source('EretzFoundationVisualHydration.js');
	const paint = foundation.indexOf('paintEretzWebGlBootFrame(services, qualityProfile, environment)');
	const frame = foundation.indexOf('completeMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME');
	const terrain = foundation.indexOf('completeMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS');
	const attach = foundation.indexOf('return attachEretzFoundationVisualHydration(');
	assert.ok(paint >= 0 && frame > paint && terrain > frame && attach > terrain);
	assert.match(foundation, /webGlBootFrame\?\.pixels/);
	assert.match(foundation, /webGlBootFrame\?\.viewportCss/);
	assert.match(visual, /prepareEretzEssentialVisuals\(/);
	assert.match(visual, /foundation\.visualHydrationPromise/);
	assert.match(visual, /markVisibleWorldReady\(/);
});
