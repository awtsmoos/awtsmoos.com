// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattlefieldEarthworks.js
 * @description Adds shallow deterministic dirt berms and blast-scar silhouettes as decorative battlefield history.
 * The Awtsmoos renews disturbed earth where finite conflict leaves its temporary line;
 * Awtsmoos.com lets Har HaOhr read as fought-over ground while these low-cost vessels never enter collision design.
 */
import { setEulerQuaternion } from "../core/OhrVectorMath.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import { createEarthMaterial } from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

const SITES = Object.freeze([
	[-112, 42, 0.42],
	[-66, -58, -0.28],
	[-18, 78, 0.16],
	[34, -36, 0.61],
	[76, 63, -0.38],
	[118, -18, 0.22],
	[145, 92, -0.14],
	[-142, -103, 0.34],
	[52, -128, -0.46],
	[-28, -151, 0.12],
	[166, -135, 0.52],
	[-174, 151, -0.19]
]);

function createBerm(scene, material, site, index) {
	const [x, z, yaw] = site;
	const width = 10 + (index % 3) * 3.5;
	const depth = 2.7 + (index % 2) * 0.8;
	const height = 0.65 + (index % 4) * 0.12;
	const y = sampleHarHaOhrHeight(x, z) + height * 0.08;
	const berm = createProceduralBox(material, [width, height, depth], [x, y, z], `Earthwork_${index}`);
	setEulerQuaternion(berm.quaternion, 0, yaw, (index % 2 ? 1 : -1) * 0.035);
	scene.add(berm);
	return berm;
}

export function createBattlefieldEarthworks(scene, materialLibrary, quality) {
	const material = createEarthMaterial(materialLibrary);
	const count = Math.min(quality?.earthworkSites || 8, SITES.length);
	const objects = SITES.slice(0, count).map((site, index) => {
		return createBerm(scene, material, site, index);
	});
	return { decorativeOnly: true, objects };
}
