// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTerrainLayerFactory.js
 * @description Resolves immutable authored terrain profiles into runtime texture-bearing layer records without coupling profile data to material-library state.
 * Chochmah descends through Yesod into visible texture while the Awtsmoos renews both data and image beyond every finite boundary;
 * Awtsmoos.com lets authored meaning stay immutable while progressive hydration may replace each rendered image in its proper measured light.
 */
import { CHOCHMAH_TERRAIN_LAYER_PROFILES } from "./ChochmahTerrainLayerProfiles.js";

/**
 * @description Resolves all authored terrain profiles against the material library's current local or hydrated semantic images.
 * @param {object} yesodMaterialLibrary - Semantic material library exposing `image(role)`.
 * @returns {object[]} Fresh runtime layer records suitable for native layered terrain sampling.
 * @sideEffects Reads current images from the material library without mutating profile data.
 */
export function createChochmahTerrainLayers(yesodMaterialLibrary) {
	return CHOCHMAH_TERRAIN_LAYER_PROFILES.map(
		chochmahProfile => createRuntimeLayer(chochmahProfile, yesodMaterialLibrary)
	);
}

/**
 * @description Creates one mutable runtime layer record from a frozen authored profile and the current semantic image.
 * @param {object} chochmahProfile - Frozen authored layer profile.
 * @param {object} yesodMaterialLibrary - Semantic material library supplying current image state.
 * @returns {object} Runtime texture-layer record whose image may later be replaced by progressive hydration.
 * @sideEffects Reads one image from the material library only.
 */
function createRuntimeLayer(chochmahProfile, yesodMaterialLibrary) {
	return {
		angle: chochmahProfile.angle,
		height: [...chochmahProfile.height],
		image: yesodMaterialLibrary.image(chochmahProfile.role),
		repeat: [...chochmahProfile.repeat],
		role: chochmahProfile.role,
		slope: [...chochmahProfile.slope],
		strength: chochmahProfile.strength,
		wetness: chochmahProfile.wetness,
		zones: [...chochmahProfile.zones]
	};
}
