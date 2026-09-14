//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowTreeGeometrySupport.js
 * @description Converts procedural tree streams into shared bark/canopy templates through Procedural Core.
 * MitzvahWorld retains botanical color-family and material semantics; Core owns indexed BufferGeometry creation,
 * index-width selection, and renderer-native attribute materialization so dense vegetation never duplicates engine law.
 */

import {
	createNativeIndexedGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import {
	createPrimitiveMaterial
} from '../world/primitives/PrimitiveMaterialFactory.js';

const BARK_COLORS = Object.freeze([
	'#745039',
	'#825b3d',
	'#5f4938',
	'#8d6a4d',
	'#514338',
	'#96745a'
]);
const LEAF_COLORS = Object.freeze([
	'#f7fff2',
	'#fffbe8',
	'#eef9ff',
	'#f4ffe5',
	'#eaf3dc',
	'#fff4db'
]);

/**
 * Builds one reusable tree-part template from portable procedural streams.
 * @param {object} data Position, normal, UV, optional color, and index streams.
 * @param {object} definition Semantic primitive material recipe.
 * @param {string} partName Stable evidence name for bark or canopy identity.
 * @returns {Readonly<object>} Frozen geometry/material template record.
 */
export function minimalMeadowTreePart(data, definition, partName) {
	const geometry = createNativeIndexedGeometry({
		colors: data.colors,
		indices: data.indices,
		normals: data.normals,
		positions: data.positions,
		uvs: data.uvs
	}, {
		geometryUserData: {
			botanicalTemplate: true,
			part: partName
		}
	});
	const material = createPrimitiveMaterial(definition, [1, 1]);
	material.vertexColors = Boolean(data.colors?.length);
	material.depthWrite = true;
	return Object.freeze({
		geometry,
		material,
		part: partName
	});
}

/** Creates a stable bark surface definition while preserving caller remote-material evidence. */
export function minimalMeadowBarkDefinition(material, variant) {
	const index = normalizedVariant(variant);
	return {
		...material,
		anisotropy: 8,
		backfaceCull: false,
		color: BARK_COLORS[index],
		doubleSided: true,
		id: `Awtsmoos_procedural_tree_bark_${index}`,
		mapRepeat: [2.2 + index * 0.08, 5.2 + index * 0.16],
		roughness: 0.86
	};
}

/** Creates a stable authored-alpha canopy definition with near-neutral species-preserving tint. */
export function minimalMeadowLeafDefinition(material, variant) {
	const index = normalizedVariant(variant);
	return {
		...material,
		alphaCutoff: 0.16,
		alphaMode: 'MASK',
		anisotropy: 8,
		backfaceCull: false,
		color: LEAF_COLORS[index],
		doubleSided: true,
		id: `Awtsmoos_procedural_tree_leaves_${index}`,
		mapRepeat: [1, 1],
		roughness: 0.72,
		texturePolicy: {
			...(material.texturePolicy || {}),
			authoredAlphaPreserved: true,
			colorTintPolicy: 'near-neutral-species-preserving',
			transmissionHint: 0.12 + index * 0.018
		}
	};
}

/** Normalizes arbitrary variant values into the fixed six-family botanical palette. */
function normalizedVariant(value) {
	return Math.abs(Number(value) || 0) % BARK_COLORS.length;
}
