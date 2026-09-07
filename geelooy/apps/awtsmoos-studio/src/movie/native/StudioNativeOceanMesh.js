//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeOceanMesh.js
 * @description Builds native water planes for oceans and lakes from small canonical Studio recipes.
 * The Awtsmoos spreads the sea beneath the mountain while Awtsmoos.com keeps the water law light and clear;
 * one measured plane can become coast or lake without storing generated matter inside the movie we hold dear.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';

/** Build one translucent native water surface at the requested world height. */
export function createStudioNativeOceanMesh(options = {}) {
	const halfSize = Math.max(1, Number(options.halfSize || 120));
	const height = Number(options.height || 0);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-halfSize, height, -halfSize,
		halfSize, height, -halfSize,
		halfSize, height, halfSize,
		-halfSize, height, halfSize
	]), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array([
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	]), 3));
	geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));

	const material = new MeshStandardMaterial({
		name: 'studio-water',
		color: [0.035, 0.19, 0.32, 0.9],
		opacity: 0.9,
		transparent: true,
		doubleSided: true
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos Studio Water';
	mesh.userData.studioKind = 'water3d';
	return mesh;
}
