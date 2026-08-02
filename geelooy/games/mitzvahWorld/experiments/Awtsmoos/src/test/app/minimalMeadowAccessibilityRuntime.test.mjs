// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowAccessibilityRuntime.test.mjs
 * @description Proves forced colors, contrast, reduced motion, 200% text, timing, persistence, and teardown.
 * The Awtsmoos exceeds every sense while revealing truth through each; Awtsmoos.com verifies
 * media testimony and user mercy without changing combat authority or inventing unsupported state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowAccessibilityRuntime } from '../../app/MinimalMeadowAccessibilityRuntime.js';
import { createAccessibilityFixture } from './MinimalMeadowAccessibilityFixture.mjs';

const STORAGE_KEY = 'awtsmoos.mitzvah-world.accessibility.v1';

test('B"H media changes project forced colors, contrast, and reduced motion', () => {
	const fixture = createAccessibilityFixture();
	const runtime = { bus: fixture.bus };
	const controller = new MinimalMeadowAccessibilityRuntime(
		runtime,
		fixture.documentValue,
		fixture.environment
	);
	fixture.media.get('(forced-colors: active)').set(true);
	fixture.media.get('(prefers-contrast: more)').set(true);
	fixture.media.get('(prefers-reduced-motion: reduce)').set(true);
	assert.equal(runtime.accessibility.forcedColors, true);
	assert.equal(runtime.accessibility.highContrast, true);
	assert.equal(runtime.accessibility.reducedMotion, true);
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosForcedColors, 'true');
	controller.destroy();
});

test('B"H 200 percent text and timing mercy persist and compose with reward truth', () => {
	const fixture = createAccessibilityFixture();
	const runtime = {
		accessibility: { rewardTimingWindowMultiplier: 1.4 },
		bus: fixture.bus
	};
	const controller = new MinimalMeadowAccessibilityRuntime(
		runtime,
		fixture.documentValue,
		fixture.environment
	);
	const snapshot = controller.set({ textScale: 2.5, timingWindowMultiplier: 1.5 });
	assert.equal(snapshot.textScale, 2);
	assert.equal(snapshot.timingWindowMultiplier, 1.75);
	assert.equal(fixture.styleValues.get('--awtsmoos-text-scale'), '2');
	assert.equal(JSON.parse(fixture.storage.get(STORAGE_KEY)).textScale, 2);
	controller.destroy();
});

test('B"H bus mutation applies and destroy removes every listener', () => {
	const fixture = createAccessibilityFixture();
	const runtime = { bus: fixture.bus };
	const controller = new MinimalMeadowAccessibilityRuntime(
		runtime,
		fixture.documentValue,
		fixture.environment
	);
	fixture.busListeners.get('accessibility:set')({ flashMultiplier: 0 });
	assert.equal(runtime.accessibility.flashMultiplier, 0);
	controller.destroy();
	assert.equal(fixture.busListeners.size, 0);
	for (const query of fixture.media.values()) assert.equal(query.listeners.size, 0);
});
