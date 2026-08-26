// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileMaterialAtzilut.js
 * @description Creates fallback-first progressively hydrated hostile armor, structural plate, and patterned visor materials while keeping faction color subordinate to physical surface identity.
 * Atzilut names only the source-near intention of these finite garments; the Awtsmoos renews metal, scar, visor, color, and every apparent form;
 * Awtsmoos.com lets hostile appearance become richer without welding rendering to cognition, so future factions may change garments while combat truth stays warm.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { rgbaFromHex } from "../../core/OhrColor.js";
import { createEnergyMaterial } from "../../render/OhrfrontMaterialRecipes.js";

/**
 * Creates textured hostile torso armor whose faction hue only gently tints a fallback-first metal/weathered-rock surface.
 * @param {object} chochmahRole - Immutable hostile role carrying stable `id` and accent `color`.
 * @param {object} malchusMaterialLibrary - Progressive fallback-first semantic material authority.
 * @returns {object} Tracked native material whose local canvases are available immediately and remote imagery may hydrate later.
 * @sideEffects Enrolls the material in progressive hydration through the supplied material library.
 */
export function createAtzilutArmorMaterial(chochmahRole, malchusMaterialLibrary) {
	const malchusArmor = new MeshStandardMaterial({
		name: `HostileArmor_${chochmahRole.id}`,
		color: createTiferesRoleTint(chochmahRole.color, 0.34)
	});
	malchusArmor.mapImage = malchusMaterialLibrary.image("metal");
	malchusArmor.mapRepeat = [3.2, 2.6];
	malchusArmor.mixImage = malchusMaterialLibrary.image("weatheredRock");
	malchusArmor.mixRepeat = [1.8, 1.8];
	malchusArmor.mixStrength = 0.16;
	malchusArmor.remoteTextureBindings = Object.freeze({
		mapImage: "metal",
		mixImage: "weatheredRock"
	});
	return malchusMaterialLibrary.track(malchusArmor);
}

/**
 * Creates dark structural head plate with actual metal/rock texture identity rather than relying on near-black color as visible matter.
 * @param {object} malchusMaterialLibrary - Progressive fallback-first semantic material authority.
 * @returns {object} Tracked textured structural plate material.
 * @sideEffects Enrolls the plate in progressive hydration.
 */
export function createAtzilutDarkPlateMaterial(malchusMaterialLibrary) {
	const malchusDarkPlate = new MeshStandardMaterial({
		name: "HostileDarkPlate",
		color: [0.36, 0.38, 0.4, 1]
	});
	malchusDarkPlate.mapImage = malchusMaterialLibrary.image("metal");
	malchusDarkPlate.mapRepeat = [2.4, 2.4];
	malchusDarkPlate.mixImage = malchusMaterialLibrary.image("weatheredRock");
	malchusDarkPlate.mixRepeat = [1.4, 1.4];
	malchusDarkPlate.mixStrength = 0.1;
	malchusDarkPlate.remoteTextureBindings = Object.freeze({
		mapImage: "metal",
		mixImage: "weatheredRock"
	});
	return malchusMaterialLibrary.track(malchusDarkPlate);
}

/**
 * Creates the hostile's exceptional energy accent through the shared patterned emissive material path.
 * @returns {object} Pattern-textured transparent visor material.
 */
export function createAtzilutVisorMaterial() {
	return createEnergyMaterial([1, 0.35, 0.87, 0.94]);
}

/**
 * Blends a role accent toward neutral armor so faction identity remains readable without turning the entire physical plate into saturated paint.
 * @param {string} chochmahHex - Role accent hex color.
 * @param {number} gevurahInfluence - Fraction of role color retained in the final multiplier.
 * @returns {number[]} Normalized RGBA tint used only beneath textured material evidence.
 * @sideEffects None.
 */
function createTiferesRoleTint(chochmahHex, gevurahInfluence) {
	const tiferesRole = rgbaFromHex(chochmahHex, 1);
	const chochmahNeutral = [0.7, 0.72, 0.72, 1];
	return chochmahNeutral.map((chochmahBase, netzachIndex) => {
		if (netzachIndex === 3) return 1;
		return chochmahBase * (1 - gevurahInfluence) + tiferesRole[netzachIndex] * gevurahInfluence;
	});
}
