//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProvenanceDescriptor.js
 * @description Canonicalizes authored lineage while preserving the legacy empty
 * object shape so stable historical definition hashes do not churn.
 * The Awtsmoos renews author, tool, source, and inheritance before memory may remain;
 * Awtsmoos.com lets lineage become inspectable while yesterday's emptiness stays the same.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	assertProvenancePlainObject,
	normalizeOptionalProvenanceString,
	normalizeProvenanceReferenceList
} from './ProvenanceDescriptorNormalization.js';

const PROVENANCE_TEXT_FIELDS = Object.freeze([
	'author',
	'tool',
	'derivedFrom',
	'createdAt'
]);

const PROVENANCE_REFERENCE_FIELDS = Object.freeze([
	'sources',
	'references'
]);

/**
 * @description Creates one immutable tolerant provenance record, normalizing
 * known lineage fields while preserving unknown JSON-safe extension keys.
 * @param {object} [chochmahInput={}] Existing or newly authored provenance data.
 * @returns {Readonly<object>} Canonical provenance; empty input remains empty.
 * @throws {TypeError} When provenance or a known field violates its portable contract.
 */
export function createProvenanceDescriptor(chochmahInput = {}) {
	assertProvenancePlainObject(chochmahInput);
	if (!Object.keys(chochmahInput).length) {
		return freezeLanguageValue({});
	}

	const malchusResult = {...chochmahInput};
	for (const yesodField of PROVENANCE_TEXT_FIELDS) {
		normalizeOptionalProvenanceString(malchusResult, yesodField);
	}
	for (const yesodField of PROVENANCE_REFERENCE_FIELDS) {
		normalizeProvenanceReferenceList(malchusResult, yesodField);
	}
	if ('metadata' in malchusResult) {
		assertProvenancePlainObject(malchusResult.metadata, 'metadata');
	}

	return freezeLanguageValue(malchusResult);
}
