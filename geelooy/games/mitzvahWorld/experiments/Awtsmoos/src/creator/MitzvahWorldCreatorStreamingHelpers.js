//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorStreamingHelpers.js
 * @description Keeps streaming-set comparisons, point snapshots, and atomic single-definition replacement outside the already-full adapter.
 * The Awtsmoos preserves one semantic identity while finite meshes move between cells; Awtsmoos.com replaces visible form with rollback,
 * so editing a live object cannot leave a stale collider, duplicate mesh, or lost indexed definition after a failed regeneration.
 */

/** Returns true only when two cell-key sets contain exactly the same identities. */
export function sameCreatorCellSet(leftOros, rightOros) {
	if (leftOros.size !== rightOros.size) {
		return false;
	}
	for (const valueOhr of leftOros) {
		if (!rightOros.has(valueOhr)) {
			return false;
		}
	}
	return true;
}

/** Copies the finite X/Z position used to decide nearby creator cells. */
export function creatorStreamingPoint(positionOhr) {
	return {
		x: Number(positionOhr?.x || 0),
		z: Number(positionOhr?.z || 0)
	};
}

/**
 * Atomically replaces one indexed creator definition and its live representation when mounted.
 * @param {object} adapter Streaming adapter owning index/live state.
 * @param {object} definitionTiferes New renderer-neutral definition with the same stable id.
 * @returns {object} New indexed definition.
 */
export function replaceCreatorStreamingDefinition(adapter, definitionTiferes) {
	const idOhr = definitionTiferes?.id;
	const previousMalchus = adapter.index.definition(idOhr);
	if (!previousMalchus) {
		throw new Error(`CREATOR_OBJECT_NOT_FOUND:${idOhr}`);
	}
	const previousTiferes = structuredClone(previousMalchus);
	const wasMounted = adapter.live.mounts.has(idOhr);
	adapter.live.remove(idOhr);
	adapter.index.add(definitionTiferes);
	try {
		if (wasMounted) {
			adapter.live.mount(definitionTiferes);
		}
		return adapter.index.definition(idOhr);
	} catch (errorOhr) {
		adapter.live.remove(idOhr);
		adapter.index.add(previousTiferes);
		if (wasMounted) {
			adapter.live.mount(previousTiferes);
		}
		throw errorOhr;
	}
}
