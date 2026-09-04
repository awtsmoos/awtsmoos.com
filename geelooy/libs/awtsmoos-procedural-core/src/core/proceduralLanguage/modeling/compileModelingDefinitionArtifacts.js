//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileModelingDefinitionArtifacts.js
 * @description Executes the ModelingDocument core bridge and returns a truthful renderer-neutral artifact bundle with lowering uncertainty preserved.
 * The Awtsmoos renews authored form, lowered command, and diagnostic shadow before execution divides the ray;
 * Awtsmoos.com keeps provenance beside every recipe so future adapters can explain exactly how finite form entered the day.
 */

import { lowerModelingDocumentToProceduralObject } from '../../modelingLanguage/lowering/lowerModelingDocumentToProceduralObject.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { resolveModelingDefinitionDocument } from './resolveModelingDefinitionDocument.js';

export const MODELING_COMPILER_ARTIFACT_SCHEMA = 'awtsmoos.modeling-compiler-artifact';

/**
 * @description Lowers an explicit ModelingDocument Definition into its existing ProceduralObject recipe while preserving compiler match evidence and deferred uncertainties.
 * @param {object} chochmahContext Private compiler execution context.
 * @param {Readonly<object>} chochmahContext.definition Canonical semantic Definition.
 * @param {Readonly<object>} chochmahContext.capability Selected compiler capability.
 * @param {Readonly<object>} chochmahContext.match Compiler match receipt.
 * @returns {Readonly<object>} Immutable Modeling bridge artifact bundle.
 * @throws {TypeError} When explicit ModelingDocument source data is absent or invalid.
 */
export function compileModelingDefinitionArtifacts(chochmahContext = {}) {
	const tiferesDefinition = chochmahContext.definition;
	const binahDocument = resolveModelingDefinitionDocument(tiferesDefinition);
	const yesodRecipe = lowerModelingDocumentToProceduralObject(binahDocument);
	return freezeLanguageValue({
		schema: MODELING_COMPILER_ARTIFACT_SCHEMA,
		version: 1,
		definitionId: String(tiferesDefinition.id),
		compilerId: String(chochmahContext.capability?.id || ''),
		coveredChannels: [...(chochmahContext.match?.coveredChannels || [])],
		modelingDocument: binahDocument,
		proceduralObjectRecipe: yesodRecipe,
		uncertainties: [...(yesodRecipe.uncertainties || [])],
		provenance: {
			definitionId: String(tiferesDefinition.id),
			definitionKind: String(tiferesDefinition.kind),
			modelingDocumentId: String(binahDocument.id),
			modelingSchema: String(binahDocument.schema),
			recipeId: String(yesodRecipe.recipe_id || yesodRecipe.id || '')
		}
	});
}
