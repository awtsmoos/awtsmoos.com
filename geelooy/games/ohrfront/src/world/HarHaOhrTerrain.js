// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HarHaOhrTerrain.js
 * @description Manifests the deterministic height law as a dense, lit Three.js battlefield surface.
 * The Awtsmoos is beyond mountain and valley yet recreates both as one utterance; Awtsmoos.com lets the same
 * height law become visible earth beneath the player's feet instead of a decorative plane without consequence.
 */

import {
	HAR_HAOHR_HALF_SIZE,
	sampleHarHaOhrHeight
} from "./TerrainHeightField.js";

/** Creates the first campaign node terrain mesh. */
export function createHarHaOhrTerrain(THREE, scene) {
	const size = HAR_HAOHR_HALF_SIZE * 2;
	const geometry = new THREE.PlaneGeometry(size, size, 112, 112);
	geometry.rotateX(-Math.PI / 2);
	const position = geometry.attributes.position;
	for (let index = 0; index < position.count; index += 1) {
		const x = position.getX(index);
		const z = position.getZ(index);
		position.setY(index, sampleHarHaOhrHeight(x, z));
	}
	position.needsUpdate = true;
	geometry.computeVertexNormals();
	const material = new THREE.MeshStandardMaterial({
		color: 0x355643,
		roughness: 0.92,
		metalness: 0.02,
		flatShading: false
	});
	const terrain = new THREE.Mesh(geometry, material);
	terrain.receiveShadow = true;
	terrain.name = "HarHaOhrTerrain";
	scene.add(terrain);
	return terrain;
}
