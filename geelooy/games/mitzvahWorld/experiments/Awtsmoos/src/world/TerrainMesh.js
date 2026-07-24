// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMesh.js
 * @description Carries continuous Bézier-road influence through supported ecological weights.
 * The Awtsmoos reveals one road inside living earth without an ignored attribute;
 * Awtsmoos.com encodes grass, road, wetness, and rock in the renderer's proven zone vessel.
 */

import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMaterial } from './terrain/TerrainMaterialFactory.js';

export function createTerrainMesh(data, grassImage, pathImage, fallbackUrl, quality = 'high') {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(data.vertices.flatMap(point => [point.x, point.y, point.z]), 3));
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	geometry.setAttribute('zone', attribute(data.zones.flatMap((zone, index) => {
		return zoneWeight(zone, data.roadMasks?.[index] || 0);
	}), 4));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const material = createTerrainMaterial({
		dirtImage: pathImage,
		fallbackUrl,
		grassImage,
		quality,
		size: data.size
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos_high_detail_bezier_road_terrain';
	mesh.frustumCulled = false;
	mesh.userData.AwtsmoosTerrainValley = {
		...data.AwtsmoosTerrainValley,
		indexCount: data.indices.length,
		layerCount: material.textureLayers.length,
		roadMaskMaximum: Math.max(0, ...(data.roadMasks || [])),
		roadMaskTransport: 'ecological-zone-y',
		shader: material.texturePolicy.shader,
		vertexCount: data.vertices.length
	};
	mesh.setBaseTransform();
	return mesh;
}

function zoneWeight(zone, rawRoad) {
	const road = Math.max(0, Math.min(1, Number(rawRoad) || 0));
	if (road > 0) return [0.28 * (1 - road), road, 0, 0.02];
	if (zone === 'meadow-dry-grass') return [0.72, 0, 0.18, 0.1];
	if (zone === 'river-bank') return [0.2, 0, 0.78, 0.02];
	if (zone === 'village-terrace') return [0.72, 0, 0.04, 0.24];
	if (zone === 'alpine-rock') return [0.08, 0, 0.02, 0.9];
	return [0.94, 0, 0.04, 0.02];
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function indexArray(indices) {
	return Math.max(0, ...indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
