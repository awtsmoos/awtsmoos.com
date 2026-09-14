//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Box3D.js
 * @description Converts MitzvahWorld primitive semantics into portable geometry, UV, ecology, collision, and Core mesh intent.
 * The game keeps authored shape meaning and collision truth; Procedural Core owns native BufferGeometry and Mesh
 * materialization so cottages, roads, rocks, props, and future products share one renderer-facing geometry authority.
 */
import { createNativeGeometryMesh } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { trianglesFromIndexed } from '../collision/TriangleCollider.js';
import { createPrimitiveGeometryData, isProceduralShape } from './primitives/PrimitiveGeometryFactory.js';
import {
	createPrimitiveVertexNormals,
	flattenPrimitiveVertices,
	primitiveColorArray,
	primitiveIndexArray
} from './primitives/PrimitiveGeometryBuffers.js';
import { createPrimitiveMaterial } from './primitives/PrimitiveMaterialFactory.js';
import { primitiveUsesNativeDensity } from './primitives/PrimitiveTexturePolicy.js';
import { primitiveZoneWeights } from './primitives/PrimitiveZoneWeights.js';
import {
	measureUvUnitsPerWorld,
	normalizePrimitiveUvsToWorld,
	projectPrimitiveUvs
} from './primitives/PrimitiveUvProjection.js';

const WORLD_UV_BASIS = Object.freeze([1, 1]);

/** Materialize one game-authored primitive through the shared Core native geometry doorway. */
export function createPrimitiveMesh(definition) {
	const sourceData = createPrimitiveGeometryData(definition);
	const normals = createPrimitiveVertexNormals(sourceData);
	const authoredUvs = sourceData.uvs || projectPrimitiveUvs(sourceData.vertices, normals, definition);
	const measuredData = { ...sourceData, uvs: authoredUvs };
	const measuredUnits = measureUvUnitsPerWorld(measuredData);
	const physical = Boolean(primitiveUsesNativeDensity(definition) && measuredUnits);
	const uvs = physical ? normalizePrimitiveUvsToWorld(authoredUvs, measuredUnits) : authoredUvs;
	const data = { ...sourceData, uvs };
	const textureBasis = physical ? WORLD_UV_BASIS : measuredUnits;
	const material = createPrimitiveMaterial(definition, textureBasis);
	const mesh = createNativeGeometryMesh(
		portableGeometry(data, normals, definition),
		material,
		{ name: definition.id, family: definition.userData?.family || 'mitzvah-world-primitive' }
	);
	mesh.visible = definition.visible !== false;
	mesh.userData = primitiveUserData(definition, material, measuredUnits, textureBasis, mesh.geometry);
	mesh.setBaseTransform();
	return mesh;
}

/** Preserve game collision semantics independently from renderer materialization. */
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

function portableGeometry(data, normals, definition) {
	const colors = primitiveColorArray(data.colors, data.vertices.length);
	const zones = primitiveZoneWeights(
		data.zones,
		data.vertices.length,
		Boolean(definition.textureLayers?.length)
	);
	return {
		colors,
		indices: primitiveIndexArray(data.indices),
		normals: new Float32Array(normals),
		positions: new Float32Array(flattenPrimitiveVertices(data.vertices)),
		uvs: new Float32Array(data.uvs),
		zoneWeights: zones ? new Float32Array(zones) : null
	};
}

function primitiveUserData(definition, material, measuredUnits, textureBasis, geometry) {
	return {
		...(definition.userData || {}),
		AwtsmoosLayeredMaterial: {
			layerCount: material.textureLayers?.length || 0,
			shader: material.texturePolicy?.shader || 'standard',
			vertexColor: Boolean(geometry.attributes.color),
			zoneAttribute: Boolean(geometry.attributes.zone)
		},
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
