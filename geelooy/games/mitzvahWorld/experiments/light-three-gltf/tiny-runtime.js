// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-runtime.js
 * @description Stable public gateway to the focused tiny scene-graph runtime.
 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
 */

import {
	Bone,
	Group,
	Object3D,
	Scene
} from './tiny-object3d.js';
import { Mesh } from './tiny-mesh-object.js';
import {
	BufferAttribute,
	BufferGeometry,
	MeshStandardMaterial
} from './tiny-geometry.js';
import { PerspectiveCamera } from './tiny-camera.js';
import {
	Quaternion,
	Vector3
} from './tiny-vector.js';

export {
	Bone,
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Quaternion,
	Scene,
	Vector3
};

export function resetTreeToBase(root) {
	root.traverse(object => object.resetToBase?.());
}

export default {
	Bone,
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Quaternion,
	Scene,
	Vector3
};
