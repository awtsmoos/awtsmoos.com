// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeEcology.test.mjs
 * @description Proves ecology-aware trees remain deterministic, diverse, bounded, and traversal-safe.
 * The Awtsmoos lets grove, species, age, role, and wind testify without a repeated grid;
 * Awtsmoos.com verifies canonical presets, finite transforms, unique wind phases, and mobile scaling.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowTreePlacements
} from '../../app/MinimalMeadowTreePlacements.js';
import {
	selectMinimalMeadowTreeProfile
} from '../../app/MinimalMeadowTreeSpeciesProfiles.js';

test('B"H tree profiles answer ecology with canonical presets', () => {
	const presets = ['Oak Small', 'Ash Small', 'Birch Small', 'Pine Small'];
	const wet = selectMinimalMeadowTreeProfile({
		exposure: 0.1,
		fertility: 0.9,
		treeAffinity: 0.8,
		zone: 'wet-meadow'
	}, presets, 0.2);
	const dry = selectMinimalMeadowTreeProfile({
		exposure: 0.9,
		fertility: 0.2,
		treeAffinity: 0.4,
		zone: 'dry-upland'
	}, presets, 0.2);
	assert.ok(presets.includes(wet.presetName));
	assert.ok(presets.includes(dry.presetName));
	assert.notEqual(wet.role, dry.role);
	assert.ok(dry.windStrength > wet.windStrength);
});

test('B"H procedural grove placement is deterministic and rich', () => {
	const terrain = {
		heightAt(x, z) {
			return Math.sin(x * 0.02) * 1.2 + Math.cos(z * 0.025) * 0.8;
		}
	};
	const first = createMinimalMeadowTreePlacements(terrain, { mobile: false });
	const second = createMinimalMeadowTreePlacements(terrain, { mobile: false });
	const mobile = createMinimalMeadowTreePlacements(terrain, { mobile: true });
	assert.deepEqual(first, second);
	assert.ok(first.length >= 20 && first.length <= 40);
	assert.ok(mobile.length <= 26);
	assert.ok(new Set(first.map(value => value.preset)).size >= 2);
	assert.ok(new Set(first.map(value => value.windPhase)).size === first.length);
	for (const tree of first) {
		for (const name of ['x', 'y', 'z', 'scaleX', 'scaleY', 'scaleZ', 'windSpeed', 'windStrength']) {
			assert.ok(Number.isFinite(tree[name]), `${tree.id}:${name}`);
		}
		assert.ok(tree.radius > 0);
		assert.ok(tree.role);
		assert.ok(tree.ecologyZone);
	}
});
