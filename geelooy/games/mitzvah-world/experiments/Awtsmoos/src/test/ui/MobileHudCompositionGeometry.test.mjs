// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionGeometry.test.mjs
 * @description Proves every controlled mobile HUD combination occupies disjoint safe rectangles.
 * The Awtsmoos renews every measure without collision; Awtsmoos.com lets arithmetic testify
 * that quest, target, loot, combat, cast, action, player, effects, and rail remain separate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	mobileHudZoneRectangles,
	rectangleInsideViewport,
	rectanglesIntersect
} from '../../ui/MobileHudCompositionGeometry.js';

const VIEWPORTS = Object.freeze([
	{ height: 844, mode: 'portrait', safeBottom: 34, safeTop: 47, width: 390 },
	{ height: 390, mode: 'landscape', safeBottom: 21, safeTop: 0, width: 844 }
]);

test('390 by 844 controlled HUD combinations never intersect', () => {
	assertDisjointPlan(VIEWPORTS[0]);
});

test('landscape mobile composition remains inside the safe viewport', () => {
	assertDisjointPlan(VIEWPORTS[1]);
});

test('desktop layout remains a passthrough instead of receiving mobile rectangles', () => {
	const plan = mobileHudZoneRectangles({ height: 900, width: 1440 });
	assert.equal(plan.mode, 'desktop');
	assert.deepEqual(plan.zones, {});
});

test('cast and action rectangles remain independently readable', () => {
	for (const viewport of VIEWPORTS) {
		const { zones } = mobileHudZoneRectangles(viewport);
		assert.equal(rectanglesIntersect(zones.cast, zones.action), false);
		assert.ok(zones.cast.height >= 36);
		assert.ok(zones.action.height >= 62);
	}
});

function assertDisjointPlan(viewport) {
	const plan = mobileHudZoneRectangles(viewport);
	assert.equal(plan.mode, viewport.mode);
	const entries = Object.entries(plan.zones);
	assert.deepEqual(
		new Set(entries.map(([name]) => name)),
		new Set(['player', 'target', 'quest', 'transient', 'rail', 'effects', 'combat', 'cast', 'action'])
	);
	for (const [name, rectangle] of entries) {
		assert.equal(rectangleInsideViewport(rectangle, viewport), true, `${name} exceeds viewport`);
		assert.ok(rectangle.y >= viewport.safeTop, `${name} violates top safe area`);
		assert.ok(rectangle.y + rectangle.height <= viewport.height - viewport.safeBottom);
	}
	assertEveryVisibilityCombination(entries.map(([, rectangle]) => rectangle));
}

function assertEveryVisibilityCombination(rectangles) {
	const combinations = 2 ** rectangles.length;
	for (let mask = 0; mask < combinations; mask += 1) {
		const visible = rectangles.filter((rectangle, index) => mask & (1 << index));
		for (let first = 0; first < visible.length; first += 1) {
			for (let second = first + 1; second < visible.length; second += 1) {
				assert.equal(rectanglesIntersect(visible[first], visible[second]), false);
			}
		}
	}
}
