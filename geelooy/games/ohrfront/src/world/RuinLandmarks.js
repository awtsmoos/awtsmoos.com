// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuinLandmarks.js
 * @description Builds quality-scaled non-colliding fortification remnants and explicitly declares their decorative visibility contract.
 * The Awtsmoos renews broken wall and standing gate while no visual tier can alter the path of the fight;
 * Awtsmoos.com lets distant military memory become richer, lighter, hidden, or revealed without moving one collision boundary in sight.
 */
import { setEulerQuaternion } from "../core/OhrVectorMath.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import { createCoverMaterial, createEnergyMaterial } from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

const SITES = Object.freeze([
	[-188, 126, 22, 0.18],
	[162, 154, 28, -0.22],
	[201, -103, 18, 0.08],
	[-154, -172, 25, -0.15],
	[62, -216, 16, 0.24]
]);

/**
 * Manifests one rotated native wall fragment at a terrain-relative ruin site.
 * @param {object} malchusScene - Native scene receiving the decorative mesh.
 * @param {object} malchusMaterial - Material used by this ruin fragment.
 * @param {number[]} chochmahSite - Site record `[x,z,height,yaw]`.
 * @param {string} yesodName - Stable object name for diagnostics.
 * @param {number[]} tiferesOffset - Local `[x,y,z]` site offset.
 * @param {number[]} gevurahSize - Procedural box dimensions.
 * @param {number} [yesodYaw=0] - Horizontal rotation in radians.
 * @returns {object} Added decorative native wall.
 * @sideEffects Adds one non-colliding mesh to the native scene.
 */
function addWall(malchusScene, malchusMaterial, chochmahSite, yesodName, tiferesOffset, gevurahSize, yesodYaw = 0) {
	const [netzachSiteX, netzachSiteZ] = chochmahSite;
	const netzachX = netzachSiteX + tiferesOffset[0];
	const netzachZ = netzachSiteZ + tiferesOffset[2];
	const netzachY = sampleHarHaOhrHeight(netzachX, netzachZ) + tiferesOffset[1] + gevurahSize[1] / 2;
	const malchusWall = createProceduralBox(malchusMaterial, gevurahSize, [netzachX, netzachY, netzachZ], yesodName);
	setEulerQuaternion(malchusWall.quaternion, 0, yesodYaw, 0);
	malchusScene.add(malchusWall);
	return malchusWall;
}

/**
 * Builds one asymmetric render-only ruin cluster with a restrained energy trace on alternating sites.
 * @param {object} malchusScene - Native scene receiving the cluster.
 * @param {object} malchusStone - Physical stone material.
 * @param {object} malchusGlow - Restrained Hebrew-energy material.
 * @param {number[]} chochmahSite - Immutable ruin site record.
 * @param {number} netzachIndex - Deterministic site index.
 * @returns {object[]} Decorative ruin meshes belonging to this cluster.
 * @sideEffects Adds returned meshes to the scene only; no collision authority is touched.
 */
function createRuin(malchusScene, malchusStone, malchusGlow, chochmahSite, netzachIndex) {
	const malchusObjects = [];
	const [, , gevurahHeight, yesodYaw] = chochmahSite;
	malchusObjects.push(addWall(malchusScene, malchusStone, chochmahSite, `Ruin_${netzachIndex}_Tower`, [0, 0, 0], [7, gevurahHeight, 7], yesodYaw));
	malchusObjects.push(addWall(malchusScene, malchusStone, chochmahSite, `Ruin_${netzachIndex}_WallA`, [8, 0, 2], [13, 5.5, 2.4], yesodYaw + 0.15));
	malchusObjects.push(addWall(malchusScene, malchusStone, chochmahSite, `Ruin_${netzachIndex}_WallB`, [-6, 0, -5], [9, 3.8, 2.2], yesodYaw - 0.38));
	malchusObjects.push(addWall(malchusScene, malchusStone, chochmahSite, `Ruin_${netzachIndex}_Buttress`, [2, 0, -7], [3, 8, 3], yesodYaw + 0.08));
	if (netzachIndex % 2 === 0) {
		malchusObjects.push(addWall(malchusScene, malchusGlow, chochmahSite, `Ruin_${netzachIndex}_Ohr`, [0, gevurahHeight + 0.7, 0], [2.6, 0.2, 2.6], yesodYaw));
	}
	return malchusObjects;
}

/**
 * Creates the quality-bounded render-only ruin field and explicitly marks it safe for decorative visibility policy.
 * @returns {{decorativeOnly:true,landmarks:object[]}} Ruin result consumed by atmosphere, visibility, and diagnostics.
 */
export function createRuinLandmarks(malchusScene, malchusMaterialLibrary, chochmahQuality) {
	const malchusStone = createCoverMaterial(malchusMaterialLibrary);
	const malchusGlow = createEnergyMaterial([0.35, 0.86, 0.9, 0.48]);
	const malchusLandmarks = [];
	const chochmahSites = SITES.slice(0, chochmahQuality?.ruinSites || SITES.length);
	chochmahSites.forEach((chochmahSite, netzachIndex) => {
		malchusLandmarks.push(...createRuin(malchusScene, malchusStone, malchusGlow, chochmahSite, netzachIndex));
	});
	return { decorativeOnly: true, landmarks: malchusLandmarks };
}
