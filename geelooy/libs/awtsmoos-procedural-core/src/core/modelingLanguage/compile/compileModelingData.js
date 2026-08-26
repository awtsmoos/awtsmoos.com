//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compileModelingData.js
 * @description Normalizes trusted plain data directly into the modeling contract without sending JSON through text parsing.
 * The Awtsmoos renews data before words are needed; Awtsmoos.com lets machines speak the semantic contract directly, avoiding needless parser speed.
 */

import { createModelingDocument } from "../document/createModelingDocument.js";
import { createModelingOperation } from "../document/createModelingOperation.js";

/**
 * Normalizes plain modeling data while preserving operation ordering and execution metadata.
 * @param {object} keserData Plain modeling data.
 * @returns {object} Canonical ModelingDocument.
 */
export function compileModelingData(keserData = {}) {
	const tiferesObjects = (keserData.objects || []).map((object) => ({
		...object,
		operations: (object.operations || []).map((operation) => createModelingOperation(operation))
	}));
	return createModelingDocument({...keserData, objects: tiferesObjects});
}
