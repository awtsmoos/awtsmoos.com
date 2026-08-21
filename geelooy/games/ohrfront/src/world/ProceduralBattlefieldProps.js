// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralBattlefieldProps.js
 * @description Builds original battlefield cover through the shared Awtsmoos procedural geometry adapter.
 * The Awtsmoos gives stone its boundary and motion its path; Awtsmoos.com turns those finite walls into vessels
 * of tactics, where a generated block is simultaneously visible cover and an octree-registered physical fact.
 */

import { createAwtsmoosThreeMesh } from "./AwtsmoosCoreAdapter.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

const COVER_LAYOUT = [
	[-72, -42, 12, 5, 4], [-48, -12, 5, 7, 14], [-22, -78, 15, 4, 4],
	[15, -62, 5, 6, 16], [43, -34, 14, 4, 5], [75, -8, 5, 8, 14],
	[-84, 42, 14, 5, 5], [-52, 70, 5, 7, 15], [-8, 48, 16, 4, 4],
	[31, 76, 5, 8, 14], [68, 48, 14, 5, 5], [92, 82, 6, 9, 16]
];

/**
 * Creates core-generated cover meshes and inserts their AABBs into the shared octree.
 * @returns {object[]} Created meshes.
 */
export function createProceduralBattlefieldProps(THREE, scene, collisionWorld) {
	const material = {
		type: "standard",
		color: 0x294c52,
		roughness: 0.72,
		metalness: 0.34
	};
	return COVER_LAYOUT.map(([x, z, width, height, depth], index) => {
		const mesh = createAwtsmoosThreeMesh(THREE, {
			primitive: "cube",
			parameters: { size: 1 },
			material,
			name: `OhrfrontCover_${index}`
		});
		mesh.scale.set(width, height, depth);
		mesh.position.set(x, sampleHarHaOhrHeight(x, z) + height / 2, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
		collisionWorld.registerMesh(mesh, "procedural-cover");
		return mesh;
	});
}
