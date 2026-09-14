//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-grid-scene.js
 * @description Creates camera and batched particle vessels for semantic native 3D grid games.
 * These scene garments remain decorative and never participate in board rules.
 */
import {
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera
} from '../../runtime/native/tiny-runtime.js';
import { createNativeParticleGeometry } from './native-particle-geometry.js';

/** Create a perspective camera sized to one finite semantic grid. */
export function createNativeGridCamera(rows, columns) {
	const extent = Math.max(rows, columns);
	const camera = new PerspectiveCamera(42, 1, 0.1, 160);
	camera.position.set(columns * 0.24, rows * 0.04, extent * 1.42 + 3.5);
	camera.target = [0, 0, 0];
	return camera;
}

/** Create one intense but bounded particle mesh behind the semantic grid. */
export function createNativeGridParticles(rows, columns) {
	const geometry = createNativeParticleGeometry({
		count: 88,
		spread: Math.max(rows, columns) * 1.45,
		seed: rows * 1000 + columns * 17 + 770
	});
	const material = new MeshStandardMaterial({
		name: 'AwtsmoosGridParticles',
		color: [1, 1, 1, 0.72],
		opacity: 0.72,
		alphaMode: 'BLEND',
		transparent: true,
		doubleSided: true
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'AwtsmoosGridParticleField';
	mesh.position.z = -2.2;
	return mesh;
}
