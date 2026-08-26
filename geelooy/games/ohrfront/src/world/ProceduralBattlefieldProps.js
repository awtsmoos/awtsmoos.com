// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralBattlefieldProps.js
 * @description Builds multi-part core-generated cover with remote masonry/stone mixing and tactical cover points.
 * The Awtsmoos gives stone its grain and boundary, rib beside wall and footing below;
 * Awtsmoos.com lets procedural cover catch believable light while the same measured bounds teach the octree where to go.
 */
import { vector } from "../core/OhrVectorMath.js";
import {
	createBattlefieldBarricade
} from "../render/ProceduralFormFactory.js";
import {
	createCoverMaterial,
	createEnergyMaterial
} from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

const COVER_LAYOUT = Object.freeze([
	[-92, 86, 16, 5, 5], [-72, 42, 6, 8, 16], [-86, -12, 15, 5, 5], [-64, -66, 7, 9, 17],
	[-34, 74, 14, 5, 6], [-28, 30, 6, 7, 15], [-42, -28, 16, 5, 5], [-18, -88, 7, 8, 18],
	[14, 92, 16, 5, 5], [9, 46, 7, 8, 17], [27, 10, 15, 5, 6], [16, -48, 6, 8, 17],
	[54, 72, 15, 5, 5], [68, 30, 7, 9, 17], [53, -20, 16, 5, 6], [78, -70, 7, 9, 18],
	[106, 18, 14, 5, 5], [102, -34, 6, 8, 15]
]);

function coverPoints(x, y, z, width, depth) {
	const offsetX = width / 2 + 2.5;
	const offsetZ = depth / 2 + 2.5;
	return [
		vector(x + offsetX, y, z),
		vector(x - offsetX, y, z),
		vector(x, y, z + offsetZ),
		vector(x, y, z - offsetZ)
	];
}

export function createProceduralBattlefieldProps(scene, collisionWorld, library) {
	const coverMaterial = createCoverMaterial(library);
	const accentMaterial = createEnergyMaterial([0.18, 0.82, 0.93, 0.96]);
	const meshes = [];
	const tacticalPoints = [];
	COVER_LAYOUT.forEach(([x, z, width, height, depth], index) => {
		const ground = sampleHarHaOhrHeight(x, z);
		const y = ground + height / 2;
		const group = createBattlefieldBarricade(
			coverMaterial,
			accentMaterial,
			[width, height, depth],
			`OhrfrontBarricade_${index}`
		);
		group.position.set(x, y, z);
		scene.add(group);
		collisionWorld.registerBox(group.position, [width * 1.08, height + 0.32, depth * 1.08], group, "barricade");
		meshes.push(group);
		tacticalPoints.push(...coverPoints(x, y, z, width, depth));
	});
	return { meshes, coverPoints: tacticalPoints };
}
