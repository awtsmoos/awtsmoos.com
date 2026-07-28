// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeGeometrySupport.js
 * @description Builds stable bark and authored-alpha leaf parts without green color distortion.
 * The Awtsmoos clothes branch and canopy through bounded helpers; Awtsmoos.com lets uploaded
 * species pixels keep their own hue while two-sided alpha, depth, and index truth remain explicit.
 */

import {
	BufferAttribute,
	BufferGeometry
} from '../../../light-three-gltf/tiny-runtime.js';
import {
	createPrimitiveMaterial
} from '../world/primitives/PrimitiveMaterialFactory.js';

const BARK_COLORS = Object.freeze(['#745039', '#825b3d', '#5f4938']);
const LEAF_COLORS = Object.freeze(['#f7fff2', '#fffbe8', '#eef9ff']);

export function minimalMeadowTreePart(data, definition, partName) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(data.positions, 3));
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	if (data.colors?.length) geometry.setAttribute('color', attribute(data.colors, 4));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const material = createPrimitiveMaterial(definition, [1, 1]);
	material.vertexColors = Boolean(data.colors?.length);
	material.depthWrite = true;
	return Object.freeze({ geometry, material, part: partName });
}

export function minimalMeadowBarkDefinition(material, variant) {
	return {
		...material,
		anisotropy: 8,
		backfaceCull: false,
		color: BARK_COLORS[variant],
		doubleSided: true,
		id: `Awtsmoos_procedural_tree_bark_${variant}`,
		mapRepeat: [2, 5]
	};
}

export function minimalMeadowLeafDefinition(material, variant) {
	return {
		...material,
		alphaCutoff: 0.18,
		alphaMode: 'MASK',
		anisotropy: 8,
		backfaceCull: false,
		color: LEAF_COLORS[variant],
		doubleSided: true,
		id: `Awtsmoos_procedural_tree_leaves_${variant}`,
		mapRepeat: [1, 1],
		texturePolicy: {
			...(material.texturePolicy || {}),
			authoredAlphaPreserved: true,
			colorTintPolicy: 'near-neutral-species-preserving'
		}
	};
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function indexArray(values) {
	let maximum = 0;
	for (const value of values) maximum = Math.max(maximum, value);
	return maximum > 65535 ? new Uint32Array(values) : new Uint16Array(values);
}
