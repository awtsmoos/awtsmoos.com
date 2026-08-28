// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeaconFormFactory.js
 * @description Builds textured masonry beacon architecture while preserving the semantic Hebrew glyph string separately from its rendered glyph mesh.
 * The Awtsmoos joins stone below with letter above while meaning and manifestation remain distinct vessels of one renewed light;
 * Awtsmoos.com lets objective text keep the living letter itself while the rendered plane may move, glow, and stand inside the world bright.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import {
	createCoverMaterial,
	createEnergyMaterial
} from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

/**
 * @description Creates one beacon's textured physical form while keeping data glyph identity scalar and renderer ownership explicit.
 * @param {object} malchusScene - Native scene receiving the completed beacon group.
 * @param {object} chochmahGlyphFactory - Glyph factory exposing `createGlyph(profile)`.
 * @param {object} yesodMaterialLibrary - Shared material library consumed by stone recipes.
 * @param {{glyph:string,x:number,z:number}} chochmahData - Immutable semantic beacon placement and Hebrew glyph data.
 * @param {number} netzachIndex - Stable beacon index used for names and glyph cache identity.
 * @returns {object} Beacon record with semantic `glyph` string and separate `glyphMesh` render object.
 * @sideEffects Creates native meshes/materials, attaches them to a group, and adds that group to the scene.
 */
export function createBeaconForm(
	malchusScene,
	chochmahGlyphFactory,
	yesodMaterialLibrary,
	chochmahData,
	netzachIndex
) {
	const malchusGroup = new Group();
	const gevurahStone = createCoverMaterial(yesodMaterialLibrary);
	const tiferesEnergy = createEnergyMaterial([0.28, 0.78, 0.86, 0.28]);
	malchusGroup.add(
		createProceduralBox(gevurahStone, [7.6, 1.1, 7.6], [0, 0, 0], "BeaconFoundation")
	);
	malchusGroup.add(
		createProceduralBox(gevurahStone, [5.1, 0.7, 5.1], [0, 0.85, 0], "BeaconPlinth")
	);
	for (const [tiferesX, tiferesZ] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) {
		malchusGroup.add(
			createProceduralBox(gevurahStone, [0.65, 3.6, 0.65], [tiferesX, 2.2, tiferesZ], "BeaconPylon")
		);
	}
	const ohrBeam = createProceduralBox(
		tiferesEnergy,
		[0.85, 15, 0.85],
		[0, 8.3, 0],
		"BeaconOhrColumn"
	);
	malchusGroup.add(ohrBeam);
	const otiyotGlyphMesh = chochmahGlyphFactory.createGlyph({
		id: `beacon_${netzachIndex}`,
		glyph: chochmahData.glyph,
		color: "#87f7ff",
		projectileScale: 3.2
	});
	otiyotGlyphMesh.position.set(0, 4.8, -0.8);
	malchusGroup.add(otiyotGlyphMesh);
	malchusGroup.position.set(
		chochmahData.x,
		sampleHarHaOhrHeight(chochmahData.x, chochmahData.z) + 0.55,
		chochmahData.z
	);
	malchusGroup.name = `Beacon_${chochmahData.glyph}_${netzachIndex}`;
	malchusScene.add(malchusGroup);
	return {
		...chochmahData,
		group: malchusGroup,
		beam: ohrBeam,
		energy: tiferesEnergy,
		glyphMesh: otiyotGlyphMesh,
		progress: 0,
		captured: false
	};
}
