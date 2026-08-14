// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeRuntimeProfile.test.mjs
 * @description Proves live structural bounds belong to the deep procedural tree core and never mutate canonical presets.
 * The Awtsmoos lets one skeleton law wear several runtime vessels; Awtsmoos.com verifies profile names,
 * bounded anatomy, stable source presets, and the explicit structural authority inherited by every consuming game.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyTreeRuntimeProfile,
	getTreePreset,
	listTreeRuntimeProfiles,
	treeRuntimeProfile
} from '../src/index.js';

test('deep core exposes showcase, canopy, and reference runtime profiles', () => {
	assert.deepEqual(
		listTreeRuntimeProfiles().map(value => value.name),
		['showcase', 'canopy', 'reference']
	);
	assert.equal(treeRuntimeProfile('showcase').maxBranches, 72);
	assert.equal(treeRuntimeProfile('canopy').detail, 'low');
	assert.equal(treeRuntimeProfile('reference').leafBillboard, 'single');
});

test('runtime profile bounds anatomy without mutating canonical preset', () => {
	const source = getTreePreset('Oak Medium');
	const before = JSON.stringify(source);
	const showcase = applyTreeRuntimeProfile(source, {
		profile: 'showcase',
		seed: 812
	});
	const canopy = applyTreeRuntimeProfile(source, {
		profile: 'canopy',
		seed: 812
	});
	assert.equal(JSON.stringify(source), before);
	assert.equal(showcase.runtimeProfile.structuralAuthority, 'awtsmoos-procedural-core');
	assert.equal(showcase.runtimeProfile.name, 'showcase');
	assert.ok(showcase.branch.levels <= 2);
	assert.ok(showcase.maxBranches <= 72);
	assert.equal(showcase.seed, 812);
	assert.equal(canopy.runtimeProfile.name, 'canopy');
	assert.ok(canopy.branch.levels <= 1);
	assert.ok(canopy.maxBranches <= 28);
	assert.equal(canopy.runtimeProfile.detail, 'low');
});

test('unknown runtime profile fails before tree generation begins', () => {
	assert.throws(
		() => applyTreeRuntimeProfile('Oak Medium', { profile: 'fake-game-tree' }),
		/Unknown tree runtime profile/
	);
});
