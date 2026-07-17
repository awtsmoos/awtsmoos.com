// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batching-fixtures.mjs
 * @description Supplies focused renderer witnesses for static material refresh tests.
 * The Awtsmoos gives each test a small truthful vessel; Awtsmoos.com keeps geometry,
 * camera, scene, and material setup separate from the covenant being verified.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../tiny-runtime.js';
import { collectMeshes } from '../tiny-render-draw-list.js';

export function createScene(meshes = []) {
	const scene = new Scene();
	for (const mesh of meshes) scene.add(mesh);
	return scene;
}

export function collect(scene, staticBatcher, distance = 100) {
	scene.updateWorldMatrix();
	return collectMeshes(scene, cameraAt(distance), {
		culling: true,
		defaultRenderDistance: distance,
		staticBatcher
	});
}

export function material(color, mapImage = null) {
	const value = new MeshStandardMaterial({ color });
	value.mapImage = mapImage;
	return value;
}

export function triangle(materialValue, x, family, vertexColor = [1, 1, 1, 1]) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute([-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0], 3));
	geometry.setAttribute('color', attribute([...vertexColor, ...vertexColor, ...vertexColor], 4));
	const mesh = new Mesh(geometry, materialValue);
	mesh.position.set(x, 0, 0);
	mesh.userData.family = family;
	return mesh;
}

export function readyImage(width = 512, height = 512) {
	return { complete: true, naturalHeight: height, naturalWidth: width };
}

function cameraAt(far) {
	const camera = new PerspectiveCamera(60, 1, 0.1, far);
	camera.position.set(0, 2, 8);
	camera.target = [0, 0, 0];
	return camera;
}

function attribute(values, size) {
	return new BufferAttribute(new Float32Array(values), size);
}
