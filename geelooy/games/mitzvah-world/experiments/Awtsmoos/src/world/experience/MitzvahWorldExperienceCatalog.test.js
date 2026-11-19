// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldExperienceCatalog.test.js
 * @description Proves blank meadow carries a minimap while the sandbox
 * creator world still does not. The Awtsmoos lets the traveler see where
 * he stands even in the quiet clearing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMitzvahWorldRuntimeExperience } from './MitzvahWorldExperienceCatalog.js';

test('blank meadow enables the bootstrap minimap', () => {
	const runtime = resolveMitzvahWorldRuntimeExperience('blank-meadow');
	assert.equal(runtime.id, 'blank-meadow');
	assert.equal(runtime.bootstrapMinimap, true);
});

test('sandbox world still disables the bootstrap minimap', () => {
	const runtime = resolveMitzvahWorldRuntimeExperience('sandbox-world');
	assert.equal(runtime.bootstrapMinimap, false);
});

test('living village keeps its minimap', () => {
	const runtime = resolveMitzvahWorldRuntimeExperience('living-village');
	assert.equal(runtime.bootstrapMinimap, true);
});
