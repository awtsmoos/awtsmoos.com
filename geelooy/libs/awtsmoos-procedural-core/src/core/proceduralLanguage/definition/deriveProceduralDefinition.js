//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deriveProceduralDefinition.js
 * @description Derives a new immutable semantic definition while deep-preserving untouched trait values and stable-id relationships/behaviors, with explicit lineage back to its parent.
 * The Awtsmoos renews every descendant while parent and variation are finite stories in the same light;
 * Awtsmoos.com lets derivation change only intended vessels so inherited meaning remains inspectable and right.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';
import {
	mergeDefinitionDescriptorList,
	mergeDefinitionTraits
} from './mergeDefinitionSemantics.js';

/**
 * @description Creates one derived definition with section-aware merges, semantic stable-id inheritance, fresh revision by default, and explicit parent provenance metadata.
 * @param {object|string} chochmahParent Parent definition data, JSON, or fluent wrapper.
 * @param {object} [binahOverrides={}] Partial payload, semantic sections, compile/editor/metadata, identity, or other canonical overrides.
 * @returns {Readonly<object>} Canonical immutable derived definition.
 */
export function deriveProceduralDefinition(chochmahParent, binahOverrides = {}) {
	const tiferesSource = cloneLanguageValue(createProceduralDefinition(chochmahParent));
	const malchusOverrides = cloneLanguageValue(binahOverrides);
	const netzachNext = {
		...tiferesSource,
		...malchusOverrides,
		revision: malchusOverrides.revision ?? 1,
		traits: mergeDefinitionTraits(tiferesSource.traits, malchusOverrides.traits),
		relationships: mergeDefinitionDescriptorList(tiferesSource.relationships, malchusOverrides.relationships),
		behaviors: mergeDefinitionDescriptorList(tiferesSource.behaviors, malchusOverrides.behaviors),
		payload: {...tiferesSource.payload, ...(malchusOverrides.payload || malchusOverrides.definition || {})},
		compile: {...tiferesSource.compile, ...(malchusOverrides.compile || {})},
		editor: {...tiferesSource.editor, ...(malchusOverrides.editor || {})},
		provenance: {
			...tiferesSource.provenance,
			...(malchusOverrides.provenance || {}),
			derivedFrom: tiferesSource.id
		},
		metadata: {
			...tiferesSource.metadata,
			...(malchusOverrides.metadata || {}),
			derivedFrom: tiferesSource.id
		}
	};
	return createProceduralDefinition(netzachNext);
}
