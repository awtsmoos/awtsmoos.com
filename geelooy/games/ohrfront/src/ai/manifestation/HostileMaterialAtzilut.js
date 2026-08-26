// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileMaterialAtzilut.js
 * @description Creates the three focused native material vessels that distinguish hostile armor, dark plate, and luminous visor manifestation.
 * Atzilut here is only an architectural metaphor for source-near material intention, while the Awtsmoos remains beyond metaphor and form;
 * Awtsmoos.com lets material construction stay outside combat identity so future factions can exchange appearance without rewriting cognition or life.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { rgbaFromHex } from "../../core/OhrColor.js";
import { createEnergyMaterial } from "../../render/OhrfrontMaterialRecipes.js";

/** Creates textured role-colored armor using shared remote metal and weathered-rock evidence. */
export function createAtzilutArmorMaterial(chochmahRole, malchusMaterialLibrary) {
	const malchusArmor = new MeshStandardMaterial({
		name: `HostileArmor_${chochmahRole.id}`,
		color: rgbaFromHex(chochmahRole.color, 1)
	});
	malchusArmor.mapImage = malchusMaterialLibrary.image("metal");
	malchusArmor.mapRepeat = [3.2, 2.6];
	malchusArmor.mixImage = malchusMaterialLibrary.image("weatheredRock");
	malchusArmor.mixRepeat = [1.8, 1.8];
	malchusArmor.mixStrength = 0.1;
	return malchusArmor;
}

/** Creates the darker structural plate material that visually separates head armor from role color. */
export function createAtzilutDarkPlateMaterial(malchusMaterialLibrary) {
	const malchusDarkPlate = new MeshStandardMaterial({
		name: "HostileDarkPlate",
		color: [0.08, 0.09, 0.11, 1]
	});
	malchusDarkPlate.mapImage = malchusMaterialLibrary.image("metal");
	malchusDarkPlate.mapRepeat = [2.4, 2.4];
	return malchusDarkPlate;
}

/** Creates the restrained luminous visor material used as the hostile's exceptional energy accent. */
export function createAtzilutVisorMaterial() {
	return createEnergyMaterial([1, 0.35, 0.87, 0.94]);
}
