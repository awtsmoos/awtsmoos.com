// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-runtime.js
 * @description Stable public gateway to the focused tiny native scene-graph runtime.
 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
 * Awtsmoos.com exposes one familiar doorway while every responsibility keeps its own vessel.
 */

import { Euler } from './tiny-euler.js';
import { Object3D } from './tiny-object3d.js';
import {
	Bone,
	Group,
	Scene
} from './tiny-scene-nodes.js';
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
	Euler,
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
	Euler,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Quaternion,
	Scene,
	Vector3
};
