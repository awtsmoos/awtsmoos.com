//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { corePartHexColor } from '../procedural/core-part-color.js';
import { nativeRgba } from '../materials/native-material-tools.js';

/**
 * @file native-star-field.js
 * @description Builds one low-draw native atmospheric star field from tiny world-space triangles.
 * The Awtsmoos renews every distant spark while Awtsmoos.com gathers many points into one native vessel;
 * one draw carries the night instead of multiplying renderer objects beyond reason.
 */
export function createNativeStarField(count, hue, spread = 42) {
	const positions = new Float32Array(count * 9);
	const normals = new Float32Array(count * 9);
	const uvs = new Float32Array(count * 6);
	for (let index = 0; index < count; index += 1) {
		writeStar(positions, normals, uvs, index, spread);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(positions, 3));
	geometry.setAttribute('normal', new BufferAttribute(normals, 3));
	geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
	const material = new MeshStandardMaterial({
		name: 'native-star-atmosphere',
		color: nativeRgba(corePartHexColor(hue, 0.82), 0.72),
		opacity: 0.72,
		alphaMode: 'BLEND',
		transparent: true,
		doubleSided: true
	});
	material.emissive = 0.72;
	const stars = new Mesh(geometry, material);
	stars.name = 'native-star-field';
	stars.userData.ambientParticleField = true;
	stars.userData.starCount = count;
	return stars;
}

function writeStar(positions, normals, uvs, index, spread) {
	const vertex = index * 9;
	const uv = index * 6;
	const x = (Math.random() - 0.5) * spread;
	const y = 4 + Math.random() * 17;
	const z = (Math.random() - 0.5) * spread;
	const size = 0.025 + Math.random() * 0.035;
	positions.set([
		x - size, y - size, z,
		x + size, y - size, z,
		x, y + size, z
	], vertex);
	normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1], vertex);
	uvs.set([0, 0, 1, 0, 0.5, 1], uv);
}
