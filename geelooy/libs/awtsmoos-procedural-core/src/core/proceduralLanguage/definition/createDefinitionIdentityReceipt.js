//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDefinitionIdentityReceipt.js
 * @description Projects deterministic semantic identity evidence from a
 * canonical definition without confusing authored content identity with
 * compiler-plan or artifact-cache identity.
 * The Awtsmoos renews identity before hash, revision, lineage, or schema can
 * witness one finite definition's face;
 * Awtsmoos.com lets callers compare semantic vessels directly while compilation
 * remains another measured place.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';

export const DEFINITION_IDENTITY_RECEIPT_SCHEMA =
	'awtsmoos.procedural-definition-identity';
export const DEFINITION_IDENTITY_RECEIPT_VERSION = 1;

/**
 * @description Canonicalizes supported definition input, hashes the complete
 * semantic definition, and returns a small immutable receipt for cache
 * diagnostics, editors, and distributed comparison.
 * @param {object|string} chochmahInput Definition object, JSON string, or fluent
 * wrapper accepted by `createProceduralDefinition`.
 * @returns {Readonly<object>} Frozen semantic identity receipt containing root
 * identity, revision, deterministic non-cryptographic hash, and parent lineage.
 */
export function createDefinitionIdentityReceipt(chochmahInput) {
	const tiferesDefinition = createProceduralDefinition(chochmahInput);
	return Object.freeze({
		schema: DEFINITION_IDENTITY_RECEIPT_SCHEMA,
		version: DEFINITION_IDENTITY_RECEIPT_VERSION,
		definitionSchema: tiferesDefinition.schema,
		definitionVersion: tiferesDefinition.version,
		id: tiferesDefinition.id,
		kind: tiferesDefinition.kind,
		revision: tiferesDefinition.revision,
		contentHash: stableLanguageHash(tiferesDefinition),
		derivedFrom: tiferesDefinition.provenance?.derivedFrom || null
	});
}
