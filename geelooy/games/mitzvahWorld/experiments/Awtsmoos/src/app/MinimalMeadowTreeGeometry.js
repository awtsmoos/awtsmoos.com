// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeGeometry.js
 * @description Adapts canonical procedural-core branch and canopy buffers to the tiny runtime.
 * The Awtsmoos grows connected pipe-model branches and botanical leaf fields; Awtsmoos.com shares
 * each preset geometry and material across instances without crossed cards, cubes, or fake fallback.
 */

import { generateTreeProceduralData } from 'awtsmoos-procedural-core';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';

const templates = new Map();

export function minimalMeadowTreeTemplate(preset, materials) {
	const key = `${preset}|${materials.cacheKey}`;
	if (!templates.has(key)) templates.set(key, buildTemplate(preset, materials));
	return templates.get(key);
}

export function clearMinimalMeadowTreeTemplates() {
	templates.clear();
}

export function createTreePart(templatePart, name) {
	const mesh = new Mesh(templatePart.geometry, templatePart.material);
	mesh.name = name;
	mesh.userData = { part: templatePart.part, proceduralCore: true, sharedTemplate: true };
	mesh.setBaseTransform();
	return mesh;
}

function buildTemplate(preset, materials) {
	const data = generateTreeProceduralData(preset);
	return Object.freeze({
		bark: part(data.branches, barkDefinition(materials.bark), 'procedural-core-connected-branches'),
		leaf: part(data.leaves, leafDefinition(materials.leaf), 'procedural-core-botanical-canopy'),
		materials: data.materials,
		preset: data.preset,
		stats: data.stats
	});
}

function part(data, definition, partName) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(data.positions, 3));
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	if (data.colors?.length) geometry.setAttribute('color', attribute(data.colors, 4));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const material = createPrimitiveMaterial(definition, [1, 1]);
	material.vertexColors = Boolean(data.colors?.length);
	material.depthWrite = partName.includes('branches');
	return Object.freeze({ geometry, material, part: partName });
}

function barkDefinition(material) {
	return {
		...material,
		anisotropy: 8,
		color: '#745039',
		id: 'Awtsmoos_procedural_tree_bark',
		mapRepeat: [3, 9]
	};
}

function leafDefinition(material) {
	return {
		...material,
		alphaCutoff: 0.34,
		alphaMode: 'MASK',
		anisotropy: 4,
		color: '#ffffff',
		doubleSided: true,
		id: 'Awtsmoos_procedural_tree_leaves',
		mapRepeat: [1, 1]
	};
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function indexArray(values) {
	return Math.max(0, ...values) > 65535 ? new Uint32Array(values) : new Uint16Array(values);
}
