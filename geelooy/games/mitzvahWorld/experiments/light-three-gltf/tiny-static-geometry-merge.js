// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-geometry-merge.js
 * @description Builds one world-space mesh from proven static triangle vessels.
 * The Awtsmoos reveals many stones as one village without erasing one edge; Awtsmoos.com
 * preserves every triangle, normal, color, and UV while reducing only submission count.
 */

import {
	BufferAttribute,
	BufferGeometry
} from './tiny-geometry.js';
import { identity } from './tiny-math.js';
import { Mesh } from './tiny-mesh-object.js';
import { appendWorldGeometry } from './tiny-static-geometry-source.js';

export function mergeStaticMeshes(meshes, metadata) {
	if (!meshes?.length) return null;
	const streams = {
		position: [],
		normal: [],
		color: [],
		uv: []
	};
	let vertexCount = 0;
	for (const mesh of meshes) {
		vertexCount += appendWorldGeometry(mesh, streams);
	}
	if (vertexCount < 3) return null;
	const geometry = new BufferGeometry();
	geometry.mode = 4;
	geometry.setAttribute('position', floatAttribute(streams.position, 3));
	geometry.setAttribute('normal', floatAttribute(streams.normal, 3));
	geometry.setAttribute('color', floatAttribute(streams.color, 4));
	geometry.setAttribute('uv', floatAttribute(streams.uv, 2));
	geometry.userData.AwtsmoosStaticBatch = {
		memberCount: meshes.length,
		vertexCount
	};
	const batch = new Mesh(geometry, meshes[0].material);
	batch.name = `AwtsmoosStaticBatch:${metadata.family}:${meshes.length}`;
	batch.matrix = identity();
	batch.matrixWorld = identity();
	batch.userData = {
		family: metadata.family,
		renderDistance: metadata.renderDistance,
		AwtsmoosStaticBatch: {
			memberCount: meshes.length,
			vertexCount
		}
	};
	return batch;
}

function floatAttribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize, false);
}
