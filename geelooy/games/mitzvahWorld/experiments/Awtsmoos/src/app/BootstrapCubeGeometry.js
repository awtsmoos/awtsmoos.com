// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCubeGeometry.js
 * @description Shares one indexed cube across every first-playable landmark and traveler part.
 * The Awtsmoos reveals many forms from one measured vessel; Awtsmoos.com reuses eight vertices
 * so ground, path, ridge, body, hat, and signposts appear without a geometry-allocation storm.
 */

import {
	BufferAttribute,
	BufferGeometry
} from '../../../light-three-gltf/tiny-runtime.js';

let sharedGeometry = null;

export function bootstrapCubeGeometry() {
	sharedGeometry ||= createCubeGeometry();
	return sharedGeometry;
}

function createCubeGeometry() {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-0.5, -0.5, -0.5,
		0.5, -0.5, -0.5,
		0.5, 0.5, -0.5,
		-0.5, 0.5, -0.5,
		-0.5, -0.5, 0.5,
		0.5, -0.5, 0.5,
		0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5
	]), 3));
	geometry.setIndex(new BufferAttribute(new Uint16Array([
		0, 1, 2, 0, 2, 3,
		5, 4, 7, 5, 7, 6,
		4, 0, 3, 4, 3, 7,
		1, 5, 6, 1, 6, 2,
		3, 2, 6, 3, 6, 7,
		4, 5, 1, 4, 1, 0
	]), 1));
	geometry.userData.bootstrapPrimitive = 'shared-cube';
	return geometry;
}
