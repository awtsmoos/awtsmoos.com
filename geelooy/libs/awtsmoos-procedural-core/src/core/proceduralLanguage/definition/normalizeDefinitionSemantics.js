//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeDefinitionSemantics.js
 * @description Normalizes revision, traits, graph relationships, behaviors, and tolerant canonical provenance as one semantic section bundle for the root procedural definition.
 * The Awtsmoos renews quality, relation, behavior, lineage, and revision before a finite definition can gather them as one;
 * Awtsmoos.com lets each semantic vessel keep its own normalizer while the root receives a stable immutable sun.
 */

import { createBehaviorDescriptor } from '../behavior/createBehaviorDescriptor.js';
import { createProvenanceDescriptor } from '../provenance/createProvenanceDescriptor.js';
import { createRelationshipDescriptor } from '../relationship/createRelationshipDescriptor.js';
import { createTraitMap } from '../trait/createTraitMap.js';

/**
 * @description Converts a candidate revision into a non-negative finite integer while preserving revision zero as a valid original authored revision.
 * @param {unknown} chochmahRevision Candidate revision value.
 * @returns {number} Canonical non-negative integer revision.
 * @throws {TypeError} When revision is not a finite non-negative integer.
 */
export function normalizeDefinitionRevision(chochmahRevision) {
	const malchusRevision = chochmahRevision ?? 0;
	if (!Number.isInteger(malchusRevision) || malchusRevision < 0) {
		const gevurahError = new TypeError('B"H | Procedural definition revision must be a non-negative integer.');
		gevurahError.code = 'PROCEDURAL_DEFINITION_REVISION_INVALID';
		throw gevurahError;
	}
	return malchusRevision;
}

/**
 * @description Normalizes every first-class authored semantic section without teaching this aggregate helper any domain noun or renderer implementation.
 * @param {object} [chochmahSource={}] Raw definition source containing revision, traits, relationships, behaviors, and provenance.
 * @returns {Readonly<object>} Canonical semantic sections ready to be merged into the root immutable definition.
 */
export function normalizeDefinitionSemantics(chochmahSource = {}) {
	return Object.freeze({
		revision: normalizeDefinitionRevision(chochmahSource.revision),
		traits: createTraitMap(chochmahSource.traits || {}),
		relationships: normalizeRelationships(chochmahSource.relationships),
		behaviors: normalizeBehaviors(chochmahSource.behaviors),
		provenance: createProvenanceDescriptor(chochmahSource.provenance || {})
	});
}

/**
 * @description Canonicalizes an ordered relationship list while supplying only deterministic index fallback ids when authors omit explicit ids.
 * @param {unknown} chochmahRelationships Candidate relationship list.
 * @returns {ReadonlyArray<object>} Frozen canonical relationship descriptors.
 */
function normalizeRelationships(chochmahRelationships) {
	if (!Array.isArray(chochmahRelationships)) return Object.freeze([]);
	return Object.freeze(
		chochmahRelationships.map(createRelationshipDescriptor)
	);
}

/**
 * @description Canonicalizes an ordered behavior list while preserving explicit behavior ids and deterministic index fallback behavior.
 * @param {unknown} chochmahBehaviors Candidate behavior list.
 * @returns {ReadonlyArray<object>} Frozen canonical behavior descriptors.
 */
function normalizeBehaviors(chochmahBehaviors) {
	if (!Array.isArray(chochmahBehaviors)) return Object.freeze([]);
	return Object.freeze(
		chochmahBehaviors.map(createBehaviorDescriptor)
	);
}
