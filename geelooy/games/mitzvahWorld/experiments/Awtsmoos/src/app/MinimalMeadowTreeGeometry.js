// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeGeometry.js
 * @description Adapts canonical tree buffers into stable shared bark and canopy templates.
 * The Awtsmoos branches endlessly without waste; Awtsmoos.com reuses finite vessels while
 * two-sided bark and cutout leaves remain whole through imperfect procedural winding.
 */

import { Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import {
	generateTreeProceduralData
} from './MinimalMeadowTreeCoreFacade.js';
import {
	minimalMeadowBarkDefinition,
	minimalMeadowLeafDefinition,
	minimalMeadowTreePart
} from './MinimalMeadowTreeGeometrySupport.js';

const templates = new Map();
const VARIANT_COUNT = 3;

export function minimalMeadowTreeTemplate(preset, materials, variant = 0) {
	const normalizedVariant = Math.abs(Number(variant) || 0) % VARIANT_COUNT;
	const key = `${preset}|${materials.cacheKey}|${normalizedVariant}`;
	if (!templates.has(key)) {
		templates.set(
			key,
			buildTemplate(preset, materials, normalizedVariant, key)
		);
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
	mesh.userData = {
		part: templatePart.part,
		proceduralCore: true,
		sharedTemplate: true,
		surfaceStable: true
	};
	mesh.setBaseTransform();
	return mesh;
}

function buildTemplate(preset, materials, variant, key) {
	const data = generateTreeProceduralData(preset);
	const bark = minimalMeadowTreePart(
		data.branches,
		minimalMeadowBarkDefinition(materials.bark, variant),
		'procedural-core-connected-branches'
	);
	const leaf = minimalMeadowTreePart(
		data.leaves,
		minimalMeadowLeafDefinition(materials.leaf, variant),
		'procedural-core-botanical-canopy'
	);
	return Object.freeze({
		bark,
		key,
		leaf,
		preset: data.preset,
		stats: Object.freeze({
			...data.stats,
			triangles: data.branches.indices.length / 3
				+ data.leaves.indices.length / 3
		})
	});
}
