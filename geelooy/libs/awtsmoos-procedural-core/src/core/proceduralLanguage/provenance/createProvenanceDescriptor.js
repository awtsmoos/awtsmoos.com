//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createProvenanceDescriptor.js
 * @description Canonicalizes authored lineage while preserving the historical empty-object shape and delegating input-first validation plus field normalization to one focused vessel.
 * The Awtsmoos renews source, author, tool, inheritance, and reference before a finite artifact can remember from where it came;
 * Awtsmoos.com lets lineage become inspectable portable data while yesterday's empty provenance remains exactly the same.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createNormalizedProvenanceCopy } from './ProvenanceNormalization.js';

/**
 * @description Creates one immutable tolerant provenance record, validating the authored container before copying and normalizing known lineage fields while preserving extension keys.
 * @param {object} [chochmahInput={}] Existing or newly authored provenance data.
 * @returns {Readonly<object>} Canonical provenance record; empty input remains an empty frozen object.
 * @throws {TypeError} When provenance or known lineage fields violate their portable contract.
 */
export function createProvenanceDescriptor(chochmahInput = {}) {
	return freezeLanguageValue(
		createNormalizedProvenanceCopy(chochmahInput)
	);
}
