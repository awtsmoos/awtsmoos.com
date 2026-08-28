//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePatchLocator.js
 * @description The Awtsmoos knows every vessel by the truth that gives it place;
 * Awtsmoos.com locates stable scene and layer IDs before revision changes face.
 */
/** Locate one scene and return both value and array index. */
export function yesodLocateScene(orMovie, orSceneId) {
	const yesodIndex = (orMovie?.scenes || []).findIndex(orScene => orScene?.id === orSceneId);
	if (yesodIndex < 0) {
		throw new Error(`Scene not found: ${orSceneId}`);
	}
	return {
		index: yesodIndex,
		value: orMovie.scenes[yesodIndex]
	};
}

/** Locate one layer inside a stable scene target. */
export function yesodLocateLayer(orMovie, orSceneId, orLayerId) {
	const keterScene = yesodLocateScene(orMovie, orSceneId);
	const yesodIndex = (keterScene.value.layers || []).findIndex(orLayer => orLayer?.id === orLayerId);
	if (yesodIndex < 0) {
		throw new Error(`Layer not found: ${orSceneId}/${orLayerId}`);
	}
	return {
		scene: keterScene.value,
		index: yesodIndex,
		value: keterScene.value.layers[yesodIndex]
	};
}

/** Set one dotted field path on a cloned target without arbitrary prototype traversal. */
export function gevurahSetSafeField(orTarget, orField, orValue) {
	const keliParts = String(orField || "").split(".").filter(Boolean);
	if (!keliParts.length || keliParts.some(orPart => ["__proto__", "prototype", "constructor"].includes(orPart))) {
		throw new Error(`Unsafe field path: ${orField}`);
	}
	let keliCursor = orTarget;
	for (const yesodPart of keliParts.slice(0, -1)) {
		if (!keliCursor[yesodPart] || typeof keliCursor[yesodPart] !== "object") {
			keliCursor[yesodPart] = {};
		}
		keliCursor = keliCursor[yesodPart];
	}
	keliCursor[keliParts.at(-1)] = structuredClone(orValue);
	return orTarget;
}
