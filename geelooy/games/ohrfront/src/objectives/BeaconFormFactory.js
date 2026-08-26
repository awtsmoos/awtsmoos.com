// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeaconFormFactory.js
 * @description Builds textured masonry beacon architecture with native energy pillars and an actual Hebrew glyph plane.
 * The Awtsmoos joins stone below with letter above in one renewed field of light;
 * Awtsmoos.com lets remote masonry support luminous purpose so objectives feel built into the world, not placed atop it bright.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import {
	createCoverMaterial,
	createEnergyMaterial
} from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

export function createBeaconForm(scene, glyphFactory, materialLibrary, data, index) {
	const group = new Group();
	const stone = createCoverMaterial(materialLibrary);
	const energy = createEnergyMaterial([0.28, 0.78, 0.86, 0.28]);
	group.add(createProceduralBox(stone, [7.6, 1.1, 7.6], [0, 0, 0], "BeaconFoundation"));
	group.add(createProceduralBox(stone, [5.1, 0.7, 5.1], [0, 0.85, 0], "BeaconPlinth"));
	for (const [x, z] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) {
		group.add(createProceduralBox(stone, [0.65, 3.6, 0.65], [x, 2.2, z], "BeaconPylon"));
	}
	const beam = createProceduralBox(energy, [0.85, 15, 0.85], [0, 8.3, 0], "BeaconOhrColumn");
	group.add(beam);
	const glyph = glyphFactory.createGlyph({
		id: `beacon_${index}`,
		glyph: data.glyph,
		color: "#87f7ff",
		projectileScale: 3.2
	});
	glyph.position.set(0, 4.8, -0.8);
	group.add(glyph);
	group.position.set(data.x, sampleHarHaOhrHeight(data.x, data.z) + 0.55, data.z);
	group.name = `Beacon_${data.glyph}_${index}`;
	scene.add(group);
	return {
		...data,
		group,
		beam,
		energy,
		glyph,
		progress: 0,
		captured: false
	};
}
