// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file highFidelityCanvas.test.mjs
 * @description Guards smooth DPR rendering and the production visual path.
 *
 * The Awtsmoos renews every physical pixel without changing one world measure.
 * Awtsmoos.com proves here that clarity remains bounded, overhead, deterministic,
 * and attached to the real Projector rather than a parallel imitation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	clampPixelRatio,
	resolveCanvasQuality
} from '../../src/tiferet/render/canvas/CanvasQualityProfile.js';
import { CanvasSurface } from '../../src/tiferet/render/canvas/CanvasSurface.js';

const source = relativePath => readFileSync(
	fileURLToPath(new URL(relativePath, import.meta.url)),
	'utf8'
);

assert.equal(clampPixelRatio(3, 2), 2);
assert.equal(clampPixelRatio(0, 2), 1);
assert.equal(clampPixelRatio(1.5, 2), 1.5);

const quality = resolveCanvasQuality({
	devicePixelRatio: 3,
	navigator: { deviceMemory: 8 },
	location: { search: '' },
	matchMedia: () => ({ matches: false })
});
assert.equal(quality.pixelRatio, 2);

const calls = [];
const context = {
	canvas: null,
	clearRect() {},
	setTransform(...values) {
		calls.push(values);
	}
};
const canvas = {
	id: 'quality-test',
	width: 390,
	height: 844,
	clientWidth: 390,
	clientHeight: 844,
	getBoundingClientRect: () => ({ width: 390, height: 844 }),
	getContext: () => context
};
context.canvas = canvas;
const surface = new CanvasSurface(canvas, {
	environment: {
		devicePixelRatio: 2,
		navigator: { deviceMemory: 8 },
		location: { search: '' },
		matchMedia: () => ({ matches: false })
	}
});
surface.resize(true);
assert.equal(canvas.width, 780);
assert.equal(canvas.height, 1688);
assert.deepEqual(calls.at(-1), [2, 0, 0, 2, 0, 0]);
assert.equal(context.imageSmoothingEnabled, true);
assert.equal(context.imageSmoothingQuality, 'high');
assert.equal(surface.viewport().width, 390);

const frameSource = source('../../src/design/revelation/vessels/frame.css');
const projectorSource = source('../../src/tiferet/Projector.js');
const terrainSource = source('../../src/tiferet/render/world/RegionalGroundDetails.js');
const playerSource = source('../../src/tiferet/render/PlayerRenderer.js');
assert.doesNotMatch(frameSource, /pixelated|crisp-edges/);
assert.doesNotMatch(projectorSource, /imageSmoothingEnabled\s*=\s*false/);
assert.match(projectorSource, /CanvasLayerSet/);
assert.match(projectorSource, /WorldProjectionRenderer/);
assert.doesNotMatch(terrainSource, /fillRect/);
assert.match(terrainSource, /quadraticCurveTo|ellipse/);
assert.match(playerSource, /drawPlayerShadow/);
assert.match(playerSource, /drawPlayerLightBar/);

console.log('BH_HIGH_FIDELITY_CANVAS_PASS');
