// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahBattlefieldMaterials.js
 * @description Builds masonry, rock, earth, and aged-metal materials through physically scaled semantic texture roles that always resolve to local fallback matter before remote enrichment.
 * Gevurah gives wall, stone, soil, and plate their finite weight while the Awtsmoos renews texture, weather, wear, and every measured span;
 * Awtsmoos.com lets battlefield matter remain believable offline, where color only tints textured truth and never stands alone in hand.
 */
import { repeatForSurface } from "../../core/api/AwtsmoosMaterialApi.js";
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";

/**
 * Creates weathered masonry with rock breakup and progressive remote enrichment layered over deterministic local texture.
 * @param {object} yesodMaterialLibrary - Semantic fallback-first material library.
 * @returns {object} Tracked textured masonry material.
 */
export function createGevurahCoverMaterial(yesodMaterialLibrary) {
	const malchusMaterial = createPhysicalMaterial("OhrfrontWeatheredMasonry", [0.68, 0.67, 0.62, 1]);
	malchusMaterial.mapRepeat = repeat(8, 4, yesodMaterialLibrary.record("masonry")?.coverage || "stone");
	malchusMaterial.mixRepeat = repeat(8, 4, "stone");
	malchusMaterial.mixStrength = 0.34;
	malchusMaterial.mixPatchScale = 4.1;
	malchusMaterial.mixPatchSharpness = 2.0;
	return bindGevurahRoles(malchusMaterial, yesodMaterialLibrary, "masonry", "weatheredRock");
}

/**
 * Creates fieldstone with dark-soil weathering so exposed rocks remain textured even without network imagery.
 * @param {object} yesodMaterialLibrary - Semantic fallback-first material library.
 * @returns {object} Tracked textured rock material.
 */
export function createGevurahRockMaterial(yesodMaterialLibrary) {
	const malchusMaterial = createPhysicalMaterial("HarHaOhrFieldstone", [0.49, 0.47, 0.42, 1]);
	malchusMaterial.mapRepeat = repeat(5, 4, "stone");
	malchusMaterial.mixRepeat = repeat(5, 4, "soil");
	malchusMaterial.mixStrength = 0.12;
	return bindGevurahRoles(malchusMaterial, yesodMaterialLibrary, "weatheredRock", "darkSoil");
}

/**
 * Creates scarred earth with layered dirt/dark-soil structure and physically scaled repeat.
 * @param {object} yesodMaterialLibrary - Semantic fallback-first material library.
 * @returns {object} Tracked textured earth material.
 */
export function createGevurahEarthMaterial(yesodMaterialLibrary) {
	const malchusMaterial = createPhysicalMaterial("HarHaOhrScarredEarth", [0.39, 0.34, 0.27, 1]);
	malchusMaterial.mapRepeat = repeat(10, 4, "soil");
	malchusMaterial.mixRepeat = repeat(10, 4, "soil");
	malchusMaterial.mixStrength = 0.26;
	return bindGevurahRoles(malchusMaterial, yesodMaterialLibrary, "dirt", "darkSoil");
}

/**
 * Creates aged weapon/armor metal with brushed local metal texture and restrained timber-like grime breakup.
 * @param {object} yesodMaterialLibrary - Semantic fallback-first material library.
 * @returns {object} Tracked textured metal material.
 */
export function createGevurahDarkMetalMaterial(yesodMaterialLibrary) {
	const malchusMaterial = createPhysicalMaterial("OhrfrontAgedMetal", [0.42, 0.47, 0.48, 1]);
	malchusMaterial.mapRepeat = repeat(3, 2.5, "generic");
	malchusMaterial.mixRepeat = repeat(3, 2.5, "timber");
	malchusMaterial.mixStrength = 0.08;
	return bindGevurahRoles(malchusMaterial, yesodMaterialLibrary, "metal", "timber");
}

/** Creates one native material whose constant color is explicitly only a multiplier beneath semantic textures. */
function createPhysicalMaterial(yesodName, tiferesTint) {
	return new MeshStandardMaterial({
		name: yesodName,
		color: tiferesTint
	});
}

/** Binds immediate local fallback images and preserves semantic roles for progressive remote hydration. */
function bindGevurahRoles(malchusMaterial, yesodMaterialLibrary, chochmahMapRole, chochmahMixRole) {
	malchusMaterial.mapImage = yesodMaterialLibrary.image(chochmahMapRole);
	malchusMaterial.mixImage = yesodMaterialLibrary.image(chochmahMixRole);
	malchusMaterial.remoteTextureBindings = Object.freeze({
		mapImage: chochmahMapRole,
		mixImage: chochmahMixRole
	});
	return yesodMaterialLibrary.track(malchusMaterial);
}

/** Resolves shared-core physical coverage policy into native `[x,y]` repeat coordinates. */
function repeat(chochmahWidth, chochmahHeight, chochmahCoverage) {
	const hodPolicy = repeatForSurface({
		width: chochmahWidth,
		height: chochmahHeight,
		coverage: chochmahCoverage
	});
	return [hodPolicy.x, hodPolicy.y];
}
