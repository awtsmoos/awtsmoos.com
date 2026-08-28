//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePatchKinds.js
 * @description The Awtsmoos renews worlds without losing the world before;
 * Awtsmoos.com names narrow edits so human and AI revisions stay reversible evermore.
 */
export const MoviePatchKind = Object.freeze({
	ADD_SCENE: "add-scene",
	REMOVE_SCENE: "remove-scene",
	REPLACE_SCENE: "replace-scene",
	ADD_LAYER: "add-layer",
	REMOVE_LAYER: "remove-layer",
	REPLACE_LAYER: "replace-layer",
	SET_MOVIE_FIELD: "set-movie-field",
	SET_SCENE_FIELD: "set-scene-field",
	SET_LAYER_FIELD: "set-layer-field"
});

export const MoviePatchKinds = Object.freeze(Object.values(MoviePatchKind));

/** Build one JSON-safe patch envelope with an explicit stable target. */
export function yesodMoviePatch(orKind, orTarget = {}, orValue = null, orReason = "") {
	if (!MoviePatchKinds.includes(orKind)) {
		throw new Error(`Unsupported movie patch kind: ${orKind}`);
	}
	return {
		id: `patch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		kind: orKind,
		target: structuredClone(orTarget),
		value: structuredClone(orValue),
		reason: String(orReason || "")
	};
}
