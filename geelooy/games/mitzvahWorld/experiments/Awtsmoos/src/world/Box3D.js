// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Box3D.js
 * @description Orchestrates primitive geometry, material, collision, and world-baked UVs.
 * The Awtsmoos reveals one world through focused responsibilities; Awtsmoos.com keeps
 * original image pixels untouched while physical surfaces share one exact world-unit UV basis.
 */

import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { trianglesFromIndexed } from '../collision/TriangleCollider.js';
import {
	createPrimitiveGeometryData,
	isProceduralShape
} from './primitives/PrimitiveGeometryFactory.js';
import {
	createPrimitiveVertexNormals,
	flattenPrimitiveVertices,
	primitiveIndexArray
} from './primitives/PrimitiveGeometryBuffers.js';
import { createPrimitiveMaterial } from './primitives/PrimitiveMaterialFactory.js';
import { primitiveUsesNativeDensity } from './primitives/PrimitiveTexturePolicy.js';
import {
	measureUvUnitsPerWorld,
	normalizePrimitiveUvsToWorld,
	projectPrimitiveUvs
} from './primitives/PrimitiveUvProjection.js';

const WORLD_UV_BASIS = Object.freeze([1, 1]);

export function createPrimitiveMesh(definition) {
	const sourceData = createPrimitiveGeometryData(definition);
	const normals = createPrimitiveVertexNormals(sourceData);
	const authoredUvs = sourceData.uvs
		|| projectPrimitiveUvs(sourceData.vertices, normals, definition);
	const measuredData = { ...sourceData, uvs: authoredUvs };
	const measuredUnits = measureUvUnitsPerWorld(measuredData);
	const physical = Boolean(primitiveUsesNativeDensity(definition) && measuredUnits);
	const uvs = physical
		? normalizePrimitiveUvsToWorld(authoredUvs, measuredUnits)
		: authoredUvs;
	const data = { ...sourceData, uvs };
	const textureBasis = physical ? WORLD_UV_BASIS : measuredUnits;
	const geometry = createBufferGeometry(data, normals);
	const material = createPrimitiveMaterial(definition, textureBasis);
	const mesh = new Mesh(geometry, material);
	mesh.name = definition.id;
	mesh.visible = definition.visible !== false;
	mesh.userData = primitiveUserData(definition, material, measuredUnits, textureBasis);
	mesh.setBaseTransform();
	return mesh;
}

export function primitiveColliders(definition) {
	if (definition.solid === false) return [];
	const data = createPrimitiveGeometryData(definition);
	const floor = definition.walkable === true ? undefined : false;
	return trianglesFromIndexed(data.vertices, data.indices, {
		floor,
		kind: definition.id,
		solid: true
	});
}

function primitiveUserData(definition, material, measuredUnits, textureBasis) {
	return {
		...(definition.userData || {}),
		AwtsmoosMaterialEnforcement: material.mapImage
			? 'real-mapImage-bound'
			: 'url-only-not-yet-loaded',
		AwtsmoosTextureDensity: {
			bakedWorldUv: material.texturePolicy.nativeTexelDensity,
			measuredUnits,
			native: material.texturePolicy.nativeTexelDensity,
			originalPixelsOnly: true,
			textureBasis
		},
		AwtsmoosTextureUrl: material.textureUrl,
		procedural: isProceduralShape(definition.shape)
	};
}

function createBufferGeometry(data, normals) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		flattenPrimitiveVertices(data.vertices)
	), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setIndex(new BufferAttribute(primitiveIndexArray(data.indices), 1));
	return geometry;
}
