//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowTreeGeometry.js
 * @description Adapts canonical procedural-tree buffers into six shared bark/canopy template families.
 * MitzvahWorld owns preset choice, botanical family identity, cache keys, and gameplay evidence; Procedural Core
 * owns the native mesh wrapper so template reuse, frustum behavior, and renderer construction remain centralized.
 */

import {
	createNativeMeshFromGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { generateTreeProceduralData } from './MinimalMeadowTreeCoreFacade.js';
import {
	minimalMeadowBarkDefinition,
	minimalMeadowLeafDefinition,
	minimalMeadowTreePart
} from './MinimalMeadowTreeGeometrySupport.js';

const templates = new Map();
const VARIANT_COUNT = 6;

/**
 * Returns one cached bark/canopy template for a procedural tree preset and material family.
 * @returns {Readonly<object>} Shared immutable template record.
 */
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

/** Clears cached native tree templates so tests or content reloads can rebuild deterministically. */
export function clearMinimalMeadowTreeTemplates() {
	templates.clear();
}

/**
 * Creates one named renderable from a shared template part without duplicating its geometry or material.
 * @param {Readonly<object>} templatePart Shared bark or canopy template record.
 * @param {string} name Stable scene-graph name.
 * @returns {object} Core-owned native mesh sharing the template resources.
 */
export function createTreePart(templatePart, name) {
	const mesh = createNativeMeshFromGeometry(
		templatePart.geometry,
		templatePart.material,
		{
			family: 'minimal-meadow-tree-template',
			frustumCulled: true,
			name,
			userData: {
				part: templatePart.part,
				proceduralCore: true,
				sharedTemplate: true,
				surfaceStable: true
			}
		}
	);
	mesh.setBaseTransform();
	return mesh;
}

/** Builds the shared renderer resources and immutable stats for one cached tree family. */
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
