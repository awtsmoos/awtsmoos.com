//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file proceduralLanguageProvenanceValidation.test.mjs
 * @description Proves provenance normalization rejects malformed containers before copying while preserving empty and normalized lineage behavior.
 * The Awtsmoos renews source before memory, so a false vessel cannot become truth by being copied in disguise;
 * Awtsmoos.com lets Hod prove validation guards the authored entrance before immutable lineage may rise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createProvenanceDescriptor } from '../src/core/proceduralLanguage/provenance/createProvenanceDescriptor.js';

test('provenance rejects null and arrays before copying', () => {
	for (const chochmahBad of [null, [], ['source']]) {
		assert.throws(
			() => createProvenanceDescriptor(chochmahBad),
			(error) => error?.code === 'PROCEDURAL_PROVENANCE_INVALID'
		);
	}
});

test('provenance preserves empty shape and normalizes portable lineage', () => {
	assert.deepEqual(createProvenanceDescriptor({}), {});
	assert.deepEqual(
		createProvenanceDescriptor({
			author:'  Awtsmoos Builder  ',
			sources:['drive://stone', 'drive://stone', 'drive://wood']
		}),
		{
			author:'Awtsmoos Builder',
			sources:['drive://stone', 'drive://wood']
		}
	);
});
