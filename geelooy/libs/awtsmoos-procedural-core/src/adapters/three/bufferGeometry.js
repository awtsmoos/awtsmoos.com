//B"H
//Boruch Hashem
//Blessed is He

import { ensureGeometryUvs } from './threeUvProjection.js';

/**
 * @file bufferGeometry.js
 * @description
 * The Awtsmoos renews procedural numbers as visible geometry while Awtsmoos.com lets this Malchus-like adapter attach positions, normals, UVs, colors, and indices to one Three.js BufferGeometry.
 * Authored UVs remain authoritative; missing UVs gain a renderer-side projection while the adapter preserves the established normal recomputation contract and never changes gameplay or geometry generation law.
 */
export function createAwtsmoosThreeBufferGeometry(THREE, renderData, options = {}) {
	validateInputs(THREE, renderData);
	const geometry = new THREE.BufferGeometry();
	setFloatAttribute(THREE, geometry, 'position', readAny(renderData, ['positions', 'position', 'vertices']), 3);
	setFloatAttribute(THREE, geometry, 'normal', readAny(renderData, ['normals', 'normal']), 3);
	setFloatAttribute(THREE, geometry, 'uv', readAny(renderData, ['uvs', 'uv']), 2);
	attachColors(THREE, geometry, readAny(renderData, ['colors', 'color']));
	attachIndex(THREE, geometry, readAny(renderData, ['indices', 'index', 'triangles']));
	if (options.preserveNormals !== true && options.computeNormalsIfMissing !== false) {
		geometry.computeVertexNormals();
	}
	if (options.generateUvsIfMissing !== false) {
		ensureGeometryUvs(THREE, geometry, options.uvProjection || 'box');
	}
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();
	return geometry;
}

function validateInputs(THREE, renderData) {
	if (!THREE?.BufferGeometry || !THREE?.BufferAttribute) {
		throw new Error('B"H | THREE namespace with BufferGeometry and BufferAttribute is required');
	}
	if (!renderData || typeof renderData !== 'object') {
		throw new Error('B"H | renderData object is required');
	}
}

function readAny(data, names) {
	for (const name of names) {
		if (data?.[name]) {
			return data[name];
		}
	}
	return null;
}

function setFloatAttribute(THREE, geometry, name, values, itemSize) {
	if (!values?.length) {
		return;
	}
	const typed = values instanceof Float32Array ? values : new Float32Array(values);
	geometry.setAttribute(name, new THREE.BufferAttribute(typed, itemSize));
}

function attachColors(THREE, geometry, colors) {
	if (!colors?.length) {
		return;
	}
	const itemSize = colors.length % 4 === 0 ? 4 : 3;
	setFloatAttribute(THREE, geometry, 'color', colors, itemSize);
}

function attachIndex(THREE, geometry, indices) {
	if (!indices?.length) {
		return;
	}
	let maximum = 0;
	for (const value of indices) {
		maximum = Math.max(maximum, value);
	}
	const typed = indices instanceof Uint16Array || indices instanceof Uint32Array
		? indices
		: maximum > 65535
			? new Uint32Array(indices)
			: new Uint16Array(indices);
	geometry.setIndex(new THREE.BufferAttribute(typed, 1));
}

export default createAwtsmoosThreeBufferGeometry;
