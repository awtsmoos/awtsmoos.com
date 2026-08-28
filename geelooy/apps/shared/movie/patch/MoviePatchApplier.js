//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePatchApplier.js
 * @description The Awtsmoos creates anew while no prior truth is destroyed in place;
 * Awtsmoos.com applies immutable movie patches so revision remains a traceable grace.
 */
import { MoviePatchKind } from "./MoviePatchKinds.js";
import {
	gevurahSetSafeField,
	yesodLocateLayer,
	yesodLocateScene
} from "./MoviePatchLocator.js";
import { gevurahAssertValidMovie } from "../schema/MovieValidator.js";

/** Apply one or many stable-ID patches to a cloned canonical movie. */
export function malchusApplyMoviePatches(orMovie, orPatches = [], orOptions = {}) {
	const keliMovie = structuredClone(orMovie);
	for (const orPatch of orPatches) {
		applyOne(keliMovie, orPatch);
	}
	if (orOptions.validate !== false) {
		gevurahAssertValidMovie(keliMovie);
	}
	return keliMovie;
}

function applyOne(orMovie, orPatch) {
	const keterTarget = orPatch?.target || {};
	switch (orPatch?.kind) {
		case MoviePatchKind.ADD_SCENE:
			orMovie.scenes.push(structuredClone(orPatch.value));
			break;
		case MoviePatchKind.REMOVE_SCENE:
			orMovie.scenes.splice(yesodLocateScene(orMovie, keterTarget.sceneId).index, 1);
			break;
		case MoviePatchKind.REPLACE_SCENE:
			orMovie.scenes[yesodLocateScene(orMovie, keterTarget.sceneId).index] = structuredClone(orPatch.value);
			break;
		case MoviePatchKind.ADD_LAYER:
			yesodLocateScene(orMovie, keterTarget.sceneId).value.layers.push(structuredClone(orPatch.value));
			break;
		case MoviePatchKind.REMOVE_LAYER: {
			const yesodLayer = yesodLocateLayer(orMovie, keterTarget.sceneId, keterTarget.layerId);
			yesodLayer.scene.layers.splice(yesodLayer.index, 1);
			break;
		}
		case MoviePatchKind.REPLACE_LAYER: {
			const yesodLayer = yesodLocateLayer(orMovie, keterTarget.sceneId, keterTarget.layerId);
			yesodLayer.scene.layers[yesodLayer.index] = structuredClone(orPatch.value);
			break;
		}
		case MoviePatchKind.SET_MOVIE_FIELD:
			gevurahSetSafeField(orMovie, keterTarget.field, orPatch.value);
			break;
		case MoviePatchKind.SET_SCENE_FIELD:
			gevurahSetSafeField(yesodLocateScene(orMovie, keterTarget.sceneId).value, keterTarget.field, orPatch.value);
			break;
		case MoviePatchKind.SET_LAYER_FIELD:
			gevurahSetSafeField(yesodLocateLayer(orMovie, keterTarget.sceneId, keterTarget.layerId).value, keterTarget.field, orPatch.value);
			break;
		default:
			throw new Error(`Unsupported movie patch kind: ${orPatch?.kind}`);
	}
}
