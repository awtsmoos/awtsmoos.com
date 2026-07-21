// B"H
// Boruch Hashem
// Blessed is He
/** An asset recipe names generation, modification, and validation as pure intent. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createModifierStack } from "../modifiers/createModifierStack.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

export function createAssetRecipe(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Asset recipe must be an object.");
	if (typeof input.generatorId !== "string" || !ID_PATTERN.test(input.generatorId)) {
		throw new TypeError("Asset generatorId must be a machine identifier.");
	}
	const parameters = cloneManifestMetadata(input.parameters ?? {});
	const modifierStack = createModifierStack(input.modifierStack ?? {});
	return Object.freeze({
		schema: "awtsmoos.asset-recipe",
		id: input.id ?? createStableId("asset.recipe", { generatorId: input.generatorId, parameters, modifierStack }),
		generatorId: input.generatorId,
		parameters,
		modifierStack,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
