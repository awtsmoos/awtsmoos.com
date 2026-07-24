// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeGeometry.js
 * @description Adapts canonical tree buffers into a small shared silhouette-and-material template pool.
 * The Awtsmoos branches endlessly without waste; Awtsmoos.com reuses finite bark and leaf vessels
 * while three readable palettes let mobile groves retain depth, identity, and botanical difference.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';
import { generateTreeProceduralData } from './MinimalMeadowTreeCoreFacade.js';

const BARK_COLORS = Object.freeze(['#745039', '#825b3d', '#5f4938']);
const LEAF_COLORS = Object.freeze(['#558d43', '#719b45', '#3f7853']);
const templates = new Map();

export function minimalMeadowTreeTemplate(preset, materials, variant = 0) {
	const normalizedVariant = Math.abs(Number(variant) || 0) % BARK_COLORS.length;
	const key = `${preset}|${materials.cacheKey}|${normalizedVariant}`;
	if (!templates.has(key)) {
		templates.set(key, buildTemplate(preset, materials, normalizedVariant, key));
	}
	return templates.get(key);
}

export function clearMinimalMeadowTreeTemplates() {
	templates.clear();
}

export function createTreePart(templatePart, name) {
	const mesh = new Mesh(templatePart.geometry, templatePart.material);
	mesh.name = name;
	mesh.frustumCulled = false;
	mesh.userData = { part: templatePart.part, proceduralCore: true, sharedTemplate: true };
	mesh.setBaseTransform();
	return mesh;
}

function buildTemplate(preset, materials, variant, key) {
	const data = generateTreeProceduralData(preset);
	const bark = part(data.branches, barkDefinition(materials.bark, variant), 'procedural-core-connected-branches');
	const leaf = part(data.leaves, leafDefinition(materials.leaf, variant), 'procedural-core-botanical-canopy');
	return Object.freeze({
		bark,
		key,
		leaf,
		preset: data.preset,
		stats: Object.freeze({
			...data.stats,
			triangles: data.branches.indices.length / 3 + data.leaves.indices.length / 3
		})
	});
}

function part(data, definition, partName) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(data.positions, 3));
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	if (data.colors?.length) {
		geometry.setAttribute('color', attribute(data.colors, 4));
	}
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const material = createPrimitiveMaterial(definition, [1, 1]);
	material.vertexColors = Boolean(data.colors?.length);
	material.depthWrite = partName.includes('branches');
	return Object.freeze({ geometry, material, part: partName });
}

function barkDefinition(material, variant) {
	return {
		...material,
		anisotropy: 8,
		color: BARK_COLORS[variant],
		id: `Awtsmoos_procedural_tree_bark_${variant}`,
		mapRepeat: [3, 9]
	};
}

function leafDefinition(material, variant) {
	return {
		...material,
		alphaCutoff: 0.3,
		alphaMode: 'MASK',
		anisotropy: 4,
		color: LEAF_COLORS[variant],
		doubleSided: true,
		id: `Awtsmoos_procedural_tree_leaves_${variant}`,
		mapRepeat: [1, 1]
	};
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function indexArray(values) {
	let maximum = 0;
	for (const value of values) {
		maximum = Math.max(maximum, value);
	}
	return maximum > 65535 ? new Uint32Array(values) : new Uint16Array(values);
}
