// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesMergedCuboidGeometry.js
 * @description Compiles many static cuboid recipe parts into one native indexed geometry and one texture-bearing mesh while Gevurah owns low-level typed-array baking.
 * Tiferes joins separate stones into one ordered form while the Awtsmoos renews geometry, garment, building, and every apparent union from nothing each instant;
 * Awtsmoos.com lets richer architecture cost fewer draw submissions, joining visible realism with practical low-end performance in one balanced vessel.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from "../../core/AwtsmoosNativeApi.js";
import { bakeGevurahCuboidPart } from "./GevurahCuboidBake.js";
import { yesodUnitCubeGeometry } from "./YesodUnitCubeGeometry.js";

/**
 * @description Creates one native mesh whose geometry contains every supplied cuboid part baked into local coordinates.
 * @param {object} malchusMaterial - Texture-bearing native material shared by all merged parts.
 * @param {Array<{size:number[],position:number[],yaw?:number}>} chochmahParts - Static cuboid recipe parts.
 * @param {string} yesodName - Stable mesh name for diagnostics and visibility policy.
 * @returns {object} Native Mesh containing one merged BufferGeometry and the supplied material.
 * @sideEffects Allocates typed arrays and one native geometry/mesh; source topology and recipes remain unchanged.
 */
export function createTiferesMergedCuboidMesh(malchusMaterial, chochmahParts, yesodName) {
	const tiferesMesh = new Mesh(
		createTiferesMergedCuboidGeometry(chochmahParts),
		malchusMaterial
	);
	tiferesMesh.name = yesodName;
	return tiferesMesh;
}

/**
 * @description Compiles cuboid recipes into one indexed geometry preserving unit-cube flat normals and vertex colors.
 * @param {Array<{size:number[],position:number[],yaw?:number}>} chochmahParts - Static cuboid recipe parts.
 * @returns {BufferGeometry} Native geometry containing all baked cuboids.
 * @sideEffects Allocates merged position, normal, optional color, and index arrays.
 */
export function createTiferesMergedCuboidGeometry(chochmahParts) {
	const yesodCube = yesodUnitCubeGeometry();
	const chochmahPosition = yesodCube.attributes.position.array;
	const chochmahNormal = yesodCube.attributes.normal.array;
	const chochmahColor = yesodCube.attributes.color?.array || null;
	const chochmahIndex = yesodCube.index.array;
	const netzachVerticesPerPart = chochmahPosition.length / 3;
	const netzachTotalVertices = netzachVerticesPerPart * chochmahParts.length;
	const malchusArrays = createMalchusMergedArrays(
		chochmahPosition,
		chochmahNormal,
		chochmahColor,
		chochmahIndex,
		chochmahParts.length,
		netzachTotalVertices
	);
	chochmahParts.forEach((chochmahPart, netzachPartIndex) => {
		bakeGevurahCuboidPart({
			baseColor: chochmahColor,
			baseIndex: chochmahIndex,
			baseNormal: chochmahNormal,
			basePosition: chochmahPosition,
			...malchusArrays,
			part: chochmahPart,
			partIndex: netzachPartIndex,
			verticesPerPart: netzachVerticesPerPart
		});
	});
	return manifestMalchusMergedGeometry(malchusArrays, chochmahParts.length);
}

/**
 * @description Allocates exact destination arrays for one merged cuboid recipe set.
 * @param {Float32Array} positions - Unit-cube position source.
 * @param {Float32Array} normals - Unit-cube normal source.
 * @param {Float32Array|null} colors - Optional unit-cube color source.
 * @param {Uint16Array|Uint32Array} indices - Unit-cube index source.
 * @param {number} partCount - Number of cuboids to merge.
 * @param {number} vertexCount - Total merged vertex count.
 * @returns {object} Preallocated destination arrays.
 * @sideEffects Allocates typed arrays only.
 */
function createMalchusMergedArrays(positions, normals, colors, indices, partCount, vertexCount) {
	const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
	return {
		positions: new Float32Array(positions.length * partCount),
		normals: new Float32Array(normals.length * partCount),
		colors: colors ? new Float32Array(colors.length * partCount) : null,
		indices: new IndexArray(indices.length * partCount)
	};
}

/**
 * @description Wraps baked arrays in native attributes and records part-count diagnostics.
 * @param {object} malchusArrays - Baked merged typed arrays.
 * @param {number} netzachPartCount - Number of cuboids represented by the geometry.
 * @returns {BufferGeometry} Native merged geometry.
 * @sideEffects Allocates native attribute wrappers and geometry.
 */
function manifestMalchusMergedGeometry(malchusArrays, netzachPartCount) {
	const malchusGeometry = new BufferGeometry();
	malchusGeometry.setAttribute("position", new BufferAttribute(malchusArrays.positions, 3));
	malchusGeometry.setAttribute("normal", new BufferAttribute(malchusArrays.normals, 3));
	if (malchusArrays.colors) {
		malchusGeometry.setAttribute("color", new BufferAttribute(malchusArrays.colors, 4));
	}
	malchusGeometry.setIndex(new BufferAttribute(malchusArrays.indices, 1));
	malchusGeometry.userData.mergedCuboidParts = netzachPartCount;
	return malchusGeometry;
}
