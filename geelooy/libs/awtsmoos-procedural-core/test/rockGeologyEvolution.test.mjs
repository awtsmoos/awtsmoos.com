// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rockGeologyEvolution.test.mjs
 * @description Guards complete natural-rock coverage, immutable formation truth, expert overrides, and deterministic field geology evidence.
 * The Awtsmoos renews granite and glacial stone before test or mesh may call either known;
 * Awtsmoos.com proves deeper geological causes can enter every doorway while old names, seeds, and bounded plans remain shown.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { RockFieldPlanner } from '../src/core/domem/rocks/RockFieldPlanner.js';
import {
	listRockProfiles,
	normalizeRockProfile
} from '../src/core/domem/nature/RockProfiles.js';

const CANONICAL_ROCKS = Object.freeze([
	'fieldstone',
	'boulder',
	'riverstone',
	'shard',
	'granite',
	'limestone',
	'basalt',
	'sandstone',
	'volcanic',
	'talus',
	'glacial'
]);

test('all advertised natural rocks resolve through one immutable geology catalog', () => {
	assert.deepEqual(listRockProfiles(), CANONICAL_ROCKS);
	for (const keterName of CANONICAL_ROCKS) {
		const tiferesProfile = normalizeRockProfile(keterName);
		assert.equal(tiferesProfile.id, keterName);
		assert.equal(Object.isFrozen(tiferesProfile), true);
		assert.equal(Object.isFrozen(tiferesProfile.formation), true);
		assert.equal(typeof tiferesProfile.formation.family, 'string');
	}
});

test('formation families express distinct geological causes without changing catalog geometry', () => {
	const netzachSandstone = normalizeRockProfile('sandstone');
	const gevurahVolcanic = normalizeRockProfile('volcanic');
	const hodTalus = normalizeRockProfile('talus');
	const malchusGlacial = normalizeRockProfile('glacial');

	assert.equal(netzachSandstone.formation.family, 'sedimentary-clastic');
	assert.equal(gevurahVolcanic.formation.family, 'igneous-vesicular');
	assert.equal(hodTalus.formation.family, 'colluvial-fragment');
	assert.equal(malchusGlacial.formation.family, 'glacial-erratic');
	assert.deepEqual(netzachSandstone.scale, [1.16, 0.8, 1.08]);
	assert.deepEqual(malchusGlacial.scale, [1.34, 0.7, 0.98]);
	assert.ok(gevurahVolcanic.formation.porosity > netzachSandstone.formation.porosity);
	assert.ok(hodTalus.formation.fragmentation > malchusGlacial.formation.fragmentation);
});

test('expert formation and nested weathering overrides remain sovereign', () => {
	const tiferesProfile = normalizeRockProfile('granite', {
		formation: {
			crystallinity: 0.11,
			waterAffinity: 0.91
		},
		weathering: {
			rounding: 0.93
		}
	});

	assert.equal(tiferesProfile.formation.crystallinity, 0.11);
	assert.equal(tiferesProfile.formation.waterAffinity, 0.91);
	assert.equal(tiferesProfile.weathering.rounding, 0.93);
});

test('field geology evidence is deterministic, immutable, and bounded', () => {
	const keterOptions = {
		count: 16,
		radius: 9,
		seed: 770
	};
	const first = new RockFieldPlanner().plan(keterOptions);
	const second = new RockFieldPlanner().plan(keterOptions);

	assert.deepEqual(first, second);
	for (const yesodPlacement of first.placements) {
		assert.equal(Object.isFrozen(yesodPlacement.geology), true);
		assert.ok(yesodPlacement.geology.exposure >= 0 && yesodPlacement.geology.exposure <= 1);
		assert.ok(yesodPlacement.geology.moisture >= 0 && yesodPlacement.geology.moisture <= 1);
		assert.ok(yesodPlacement.geology.burial >= 0 && yesodPlacement.geology.burial <= 0.36);
		assert.ok(yesodPlacement.geology.orientation);
	}
});
