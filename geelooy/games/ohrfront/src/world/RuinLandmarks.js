// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuinLandmarks.js
 * @description Builds quality-scaled non-colliding fortification ruins as merged textured architecture with portal silhouettes, broken parapets, buttresses, and patterned energy traces.
 * The Awtsmoos renews broken gate, remembered shelter, and standing stone while no visual tier can alter the path of the fight;
 * Awtsmoos.com lets each ruin become more legible and materially rich while fewer meshes carry the whole distant military memory in sight.
 */
import { setEulerQuaternion } from "../core/OhrVectorMath.js";
import { createChochmahRuinRecipe } from "../render/architecture/ChochmahRuinRecipe.js";
import { createTiferesMergedCuboidMesh } from "../render/geometry/TiferesMergedCuboidGeometry.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import {
	createCoverMaterial,
	createEnergyMaterial
} from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

const SITES = Object.freeze([
	[-188, 126, 22, 0.18],
	[162, 154, 28, -0.22],
	[201, -103, 18, 0.08],
	[-154, -172, 25, -0.15],
	[62, -216, 16, 0.24]
]);

/**
 * @description Builds one render-only ruin as one merged textured stone mesh plus an optional patterned energy trace.
 * @param {object} malchusScene - Native scene receiving decorative meshes.
 * @param {object} malchusStone - Texture-bearing structural stone material.
 * @param {object} malchusGlow - Patterned transparent energy material.
 * @param {number[]} chochmahSite - Site record `[x,z,height,yaw]`.
 * @param {number} netzachIndex - Deterministic ruin index.
 * @returns {object[]} One or two decorative meshes belonging to the site.
 * @sideEffects Adds returned render-only meshes to the native scene; no collision authority is touched.
 */
function createRuin(malchusScene, malchusStone, malchusGlow, chochmahSite, netzachIndex) {
	const [netzachX, netzachZ, gevurahHeight, yesodYaw] = chochmahSite;
	const malchusGroundY = sampleHarHaOhrHeight(netzachX, netzachZ);
	const malchusStoneMesh = createTiferesMergedCuboidMesh(
		malchusStone,
		createChochmahRuinRecipe(gevurahHeight, netzachIndex),
		`Ruin_${netzachIndex}_MergedMasonry`
	);
	malchusStoneMesh.position.set(netzachX, malchusGroundY, netzachZ);
	setEulerQuaternion(malchusStoneMesh.quaternion, 0, yesodYaw, 0);
	malchusScene.add(malchusStoneMesh);
	const malchusObjects = [malchusStoneMesh];
	if (netzachIndex % 2 === 0) {
		malchusObjects.push(
			addOhrTrace(
				malchusScene,
				malchusGlow,
				chochmahSite,
				malchusGroundY,
				netzachIndex
			)
		);
	}
	return malchusObjects;
}

/**
 * @description Adds one narrow patterned light trace across the ruined portal instead of a flat solid-color slab.
 * @param {object} malchusScene - Native scene receiving the energy trace.
 * @param {object} malchusGlow - Patterned energy material.
 * @param {number[]} chochmahSite - Site record containing height and yaw.
 * @param {number} malchusGroundY - Sampled terrain height at site center.
 * @param {number} netzachIndex - Deterministic ruin index.
 * @returns {object} Added patterned energy mesh.
 * @sideEffects Adds one non-colliding mesh to the native scene.
 */
function addOhrTrace(malchusScene, malchusGlow, chochmahSite, malchusGroundY, netzachIndex) {
	const [netzachX, netzachZ, gevurahHeight, yesodYaw] = chochmahSite;
	const netzachTraceY = malchusGroundY + Math.min(gevurahHeight * 0.72, 6.2) + 1.15;
	const malchusTrace = createProceduralBox(
		malchusGlow,
		[3.4, 0.16, 1.3],
		[netzachX, netzachTraceY, netzachZ],
		`Ruin_${netzachIndex}_PatternedOhr`
	);
	setEulerQuaternion(malchusTrace.quaternion, 0, yesodYaw, 0);
	malchusScene.add(malchusTrace);
	return malchusTrace;
}

/**
 * @description Creates the quality-bounded render-only ruin field and marks it safe for decorative visibility policy.
 * @param {object} malchusScene - Native scene receiving ruin meshes.
 * @param {object} malchusMaterialLibrary - Semantic texture/material library.
 * @param {object} chochmahQuality - Current visual quality profile containing optional `ruinSites`.
 * @returns {{decorativeOnly:true,landmarks:object[]}} Ruin result consumed by visibility and diagnostics.
 * @sideEffects Adds quality-bounded decorative meshes to the scene.
 */
export function createRuinLandmarks(malchusScene, malchusMaterialLibrary, chochmahQuality) {
	const malchusStone = createCoverMaterial(malchusMaterialLibrary);
	const malchusGlow = createEnergyMaterial([0.35, 0.86, 0.9, 0.48]);
	const malchusLandmarks = [];
	const chochmahSites = SITES.slice(0, chochmahQuality?.ruinSites || SITES.length);
	chochmahSites.forEach((chochmahSite, netzachIndex) => {
		malchusLandmarks.push(
			...createRuin(malchusScene, malchusStone, malchusGlow, chochmahSite, netzachIndex)
		);
	});
	return { decorativeOnly: true, landmarks: malchusLandmarks };
}
