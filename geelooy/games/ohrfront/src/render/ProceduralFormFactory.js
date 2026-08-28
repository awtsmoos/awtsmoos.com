// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralFormFactory.js
 * @description Manifests reusable single boxes and draw-efficient merged battlefield architecture from one cached procedural unit-cube topology.
 * The Awtsmoos renews stone, wall, parapet, and patterned light while many finite pieces may appear through one deeper geometric vessel;
 * Awtsmoos.com lets richer defensive silhouettes reduce draw pressure instead of multiplying it, joining realism and performance in ordered sight.
 */
import {
	Group,
	Mesh
} from "../core/AwtsmoosNativeApi.js";
import { createChochmahBarricadeRecipe } from "./architecture/ChochmahBarricadeRecipe.js";
import { createTiferesMergedCuboidMesh } from "./geometry/TiferesMergedCuboidGeometry.js";
import { yesodUnitCubeGeometry } from "./geometry/YesodUnitCubeGeometry.js";

/**
 * @description Creates one scaled and positioned procedural box while sharing immutable unit-cube geometry across every call.
 * @param {object} malchusMaterial - Native material, expected to carry semantic texture data for visible world matter.
 * @param {number[]} gevurahSize - XYZ box dimensions.
 * @param {number[]} netzachPosition - XYZ local or world center.
 * @param {string} [yesodName="ProceduralBox"] - Stable diagnostic object name.
 * @returns {object} Native Mesh using the shared cached unit-cube geometry.
 * @sideEffects Allocates one mesh transform only; geometry remains shared and immutable.
 */
export function createProceduralBox(
	malchusMaterial,
	gevurahSize,
	netzachPosition,
	yesodName = "ProceduralBox"
) {
	const malchusMesh = new Mesh(yesodUnitCubeGeometry(), malchusMaterial);
	malchusMesh.name = yesodName;
	malchusMesh.scale.set(gevurahSize[0], gevurahSize[1], gevurahSize[2]);
	malchusMesh.position.set(netzachPosition[0], netzachPosition[1], netzachPosition[2]);
	return malchusMesh;
}

/**
 * @description Builds one richer defensive barricade as a single merged textured masonry mesh plus one patterned-energy trace.
 * @param {object} malchusMaterial - Texture-bearing structural material.
 * @param {object} tiferesAccentMaterial - Patterned energy material.
 * @param {number[]} gevurahDimensions - Overall `[width,height,depth]` tactical dimensions.
 * @param {string} yesodName - Stable barricade group name.
 * @returns {Group} Native group whose two children replace the former six-draw assembly.
 * @sideEffects Allocates one group, one merged stone mesh, and one patterned-energy mesh.
 */
export function createBattlefieldBarricade(
	malchusMaterial,
	tiferesAccentMaterial,
	gevurahDimensions,
	yesodName
) {
	const [gevurahWidth, gevurahHeight, gevurahDepth] = gevurahDimensions;
	const malchusGroup = new Group();
	malchusGroup.name = yesodName;
	malchusGroup.add(
		createTiferesMergedCuboidMesh(
			malchusMaterial,
			createChochmahBarricadeRecipe(gevurahWidth, gevurahHeight, gevurahDepth),
			`${yesodName}_Masonry`
		)
	);
	malchusGroup.add(
		createProceduralBox(
			tiferesAccentMaterial,
			[gevurahWidth * 0.38, 0.08, gevurahDepth * 0.84],
			[0, gevurahHeight * 0.18, 0],
			`${yesodName}_PatternedOhr`
		)
	);
	return malchusGroup;
}
