// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-geometry-merge.js
 * @description Builds one world-space mesh with source tint baked and batch tint neutralized.
 * The Awtsmoos reveals many stones as one village without erasing one hue; Awtsmoos.com
 * preserves `uColor * vColor * texel` while reducing only draw and material-state submission.
 */

import {
	BufferAttribute,
	BufferGeometry
} from './tiny-geometry.js';
import { identity } from './tiny-math.js';
import { Mesh } from './tiny-mesh-object.js';
import { createStaticBatchMaterial } from './tiny-static-batch-material.js';
import { appendWorldGeometry } from './tiny-static-geometry-source.js';

export function mergeStaticMeshes(meshes, metadata) {
	if (!meshes?.length) return null;
	const streams = {
		color: [],
		normal: [],
		position: [],
		uv: []
	};
	let vertexCount = 0;
	for (const mesh of meshes) vertexCount += appendWorldGeometry(mesh, streams);
	if (vertexCount < 3) return null;
	const geometry = new BufferGeometry();
	geometry.mode = 4;
	geometry.setAttribute('position', floatAttribute(streams.position, 3));
	geometry.setAttribute('normal', floatAttribute(streams.normal, 3));
	geometry.setAttribute('color', floatAttribute(streams.color, 4));
	geometry.setAttribute('uv', floatAttribute(streams.uv, 2));
	geometry.userData.AwtsmoosStaticBatch = {
		memberCount: meshes.length,
		tintBakedIntoVertexColor: true,
		vertexCount
	};
	const batchMaterial = createStaticBatchMaterial(meshes[0].material);
	const batch = new Mesh(geometry, batchMaterial);
	batch.name = `AwtsmoosStaticBatch:${metadata.family}:${meshes.length}`;
	batch.matrix = identity();
	batch.matrixWorld = identity();
	batch.userData = {
		family: metadata.family,
		renderDistance: metadata.renderDistance,
		AwtsmoosStaticBatch: {
			memberCount: meshes.length,
			tintBakedIntoVertexColor: true,
			vertexCount
		}
	};
	return batch;
}

function floatAttribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize, false);
}
