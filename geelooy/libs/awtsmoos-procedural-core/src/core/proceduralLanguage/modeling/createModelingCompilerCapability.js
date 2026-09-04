//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createModelingCompilerCapability.js
 * @description Declares ModelingDocument lowering as a discoverable core bridge without pretending a renderer has already emitted final pixels or collision.
 * The Awtsmoos renews semantic model and executable recipe before their finite layers seem two;
 * Awtsmoos.com lets compiler discovery name the honest bridge while every downstream artifact keeps its proper due.
 */

import { createCompilerCapability } from '../capability/createCompilerCapability.js';
import { LANGUAGE_EXECUTION, LANGUAGE_STABILITY } from '../contract/ProceduralLanguageContract.js';

export const MODELING_COMPILER_ID = 'awtsmoos.modeling-document.core-bridge';
export const MODELING_DEFINITION_KIND = 'modeling.document';

/**
 * @description Creates the immutable public capability manifest for canonical Definition-to-ModelingDocument lowering.
 * @returns {Readonly<object>} Serializable compiler capability with no executor leakage.
 */
export function createModelingCompilerCapability() {
	return createCompilerCapability({
		id: MODELING_COMPILER_ID,
		version: 1,
		kinds: [MODELING_DEFINITION_KIND],
		channels: ['geometry', 'material', 'metadata'],
		execution: LANGUAGE_EXECUTION.CORE_BRIDGE,
		determinism: 'deterministic',
		stability: LANGUAGE_STABILITY.STABLE,
		description: 'Lowers explicit ModelingDocument semantic data into a renderer-neutral ProceduralObject recipe.',
		metadata: {
			sourceSchema: 'awtsmoos.modeling-document',
			outputSchema: 'awtsmoos.procedural-object-recipe'
		}
	});
}
