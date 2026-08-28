//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeDefinitionSemantics.js
 * @description Normalizes revision, traits, relationships, behaviors, and provenance into immutable universal-definition sections without burdening the canonical constructor with domain details.
 * The Awtsmoos renews quality, relation, behavior, lineage, and time before one definition may gather them as form;
 * Awtsmoos.com lets semantic sections enter through focused vessels so the root covenant remains readable, stable, and warm.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createBehaviorDescriptor } from '../behavior/createBehaviorDescriptor.js';
import { createRelationshipDescriptor } from '../relationship/createRelationshipDescriptor.js';
import { createTraitMap } from '../trait/createTraitMap.js';

/**
 * @description Normalizes one revision token into a positive integer suitable for optimistic edit guards and deterministic receipts.
 * @param {unknown} chochmahRevision Candidate revision value.
 * @returns {number} Positive integer revision, defaulting to one when omitted.
 * @throws {RangeError} When an explicit revision is not a positive integer.
 */
export function normalizeDefinitionRevision(chochmahRevision) {
	if (chochmahRevision === undefined || chochmahRevision === null) return 1;
	const yesodRevision = Number(chochmahRevision);
	if (!Number.isInteger(yesodRevision) || yesodRevision < 1) {
		throw new RangeError(`B"H | Procedural definition revision must be a positive integer: ${chochmahRevision}`);
	}
	return yesodRevision;
}

/**
 * @description Creates the canonical semantic sections added to universal definitions while accepting old definitions that omit every new section.
 * @param {object} chochmahSource Plain definition authoring source.
 * @returns {Readonly<object>} Immutable revision, trait map, relationship list, behavior list, and provenance record.
 */
export function normalizeDefinitionSemantics(chochmahSource) {
	return freezeLanguageValue({
		revision: normalizeDefinitionRevision(chochmahSource.revision),
		traits: createTraitMap(chochmahSource.traits || {}),
		relationships: normalizeRelationships(chochmahSource.relationships),
		behaviors: normalizeBehaviors(chochmahSource.behaviors),
		provenance: chochmahSource.provenance || {}
	});
}

/** @private */
function normalizeRelationships(relationships) {
	if (relationships === undefined || relationships === null) return [];
	if (!Array.isArray(relationships)) throw new TypeError('B"H | Procedural relationships must be an array.');
	return relationships.map(createRelationshipDescriptor);
}

/** @private */
function normalizeBehaviors(behaviors) {
	if (behaviors === undefined || behaviors === null) return [];
	if (!Array.isArray(behaviors)) throw new TypeError('B"H | Procedural behaviors must be an array.');
	return behaviors.map(createBehaviorDescriptor);
}
