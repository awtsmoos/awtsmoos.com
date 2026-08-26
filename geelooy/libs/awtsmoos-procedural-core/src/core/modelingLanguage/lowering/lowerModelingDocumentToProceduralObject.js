//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lowerModelingDocumentToProceduralObject.js
 * @description Lowers a semantic ModelingDocument into the existing generic ProceduralObjectRecipe command stream without discarding unsupported intent.
 * The Awtsmoos renews semantic thought before command can execute; Awtsmoos.com lets Yesod translate one document into existing core law while uncertainties remain explicit.
 */

import { createProceduralObjectRecipe } from "../../proceduralObject/recipes/createProceduralObjectRecipe.js";
import { lowerModelingMaterial } from "./lowerModelingMaterial.js";
import { lowerModelingObjectCommands } from "./lowerModelingObjectCommands.js";

/**
 * Converts one ModelingDocument into an executable/deferred generic procedural-object recipe.
 * @param {object} keserDocument Canonical ModelingDocument.
 * @returns {object} Existing ProceduralObjectRecipe envelope.
 */
export function lowerModelingDocumentToProceduralObject(keserDocument) {
	const tiferesCommands = [];
	const gevurahDeferred = [];
	let yesodIndex = 0;
	for (const chochmahObject of keserDocument.objects || []) {
		const malchusLowering = lowerModelingObjectCommands(chochmahObject, yesodIndex);
		tiferesCommands.push(...malchusLowering.commands);
		gevurahDeferred.push(...malchusLowering.deferred);
		yesodIndex = malchusLowering.nextIndex;
	}
	return createProceduralObjectRecipe({
		recipe_id: `${keserDocument.id}.procedural`,
		materials: (keserDocument.materials || []).map(lowerModelingMaterial),
		commands: tiferesCommands,
		outputs: (keserDocument.objects || []).map((object) => ({id: object.id, type: "object"})),
		metadata: {
			modelingDocumentId: keserDocument.id,
			modelingSchema: keserDocument.schema,
			quality: (keserDocument.objects || []).map((object) => ({id: object.id, quality: object.quality}))
		},
		uncertainties: gevurahDeferred
	});
}
