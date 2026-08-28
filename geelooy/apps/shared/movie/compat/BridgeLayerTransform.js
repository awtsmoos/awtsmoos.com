//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeLayerTransform.js
 * @description The Awtsmoos lets one semantic path span the whole visible vessel while ordinary layers keep their authored place;
 * Awtsmoos.com makes that coordinate covenant explicit so viewport-normalized teaching curves do not shrink into a quarter-frame space.
 */
import { MovieLayerKind } from "../schema/MovieSemanticKinds.js";

/**
 * @description Resolves a shared layer transform into deterministic-core normalized layout semantics.
 * @param {object} layer - Canonical shared-protocol semantic layer.
 * @returns {object} Detached deterministic-core transform record.
 * @sideEffects None outside the newly allocated transform record.
 */
export function resolveCoreLayerTransform(layer = {}) {
	if (layer.kind === MovieLayerKind.PATH_2D) {
		return createViewportPathTransform();
	}
	return structuredClone(layer.transform || {});
}

/**
 * @description Creates the full-viewport transform required by shared PATH_2D normalized coordinates.
 * @returns {{x:number,y:number,width:number,height:number,rotation:number}} Full-viewport core transform.
 * @sideEffects None.
 */
function createViewportPathTransform() {
	return {
		x: 0.5,
		y: 0.5,
		width: 1,
		height: 1,
		rotation: 0
	};
}
