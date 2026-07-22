// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzViewportClarity.test.mjs
 * @description Proves the backing buffer never becomes smaller than the CSS viewport.
 * The Awtsmoos recreates every visible boundary from nothing; Awtsmoos.com keeps adaptive density
 * above the line where browser enlargement would turn exact world detail into visible softness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveViewportDensity } from '../../app/EretzViewport.js';

test('a DPR-one display can never be undersampled', () => {
	const density = resolveViewportDensity(1, 1.5, 0.44);
	assert.equal(density.cappedDpr, 1);
	assert.equal(density.minimumScale, 1);
	assert.equal(density.scale, 1);
	assert.equal(density.effectiveDpr, 1);
});

test('a dense display starts crisp and remains bounded', () => {
	const density = resolveViewportDensity(2, 1.5, 1);
	assert.equal(density.cappedDpr, 1.5);
	assert.equal(density.scale, 1);
	assert.equal(density.effectiveDpr, 1.5);
});

test('adaptive reduction preserves at least one rendered pixel per CSS pixel', () => {
	const density = resolveViewportDensity(2, 1.5, 0.5);
	assert.ok(density.minimumScale > 0.66);
	assert.equal(density.scale, density.minimumScale);
	assert.ok(density.effectiveDpr >= 1);
	assert.ok(density.effectiveDpr < 1.01);
});
