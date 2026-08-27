// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMesh.js
 * @description Carries strong ecological and Bézier-road weights through one terrain mesh.
 * The Awtsmoos reveals one earth through many garments; Awtsmoos.com encodes meadow,
 * road, moisture, soil, dryness, village wear, lake mud, and rock in a proven four-value vessel.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMaterial } from './terrain/TerrainMaterialFactory.js';

export function createTerrainMesh(
	data,
	grassImage,
	pathImage,
	fallbackUrl,
	quality = 'high'
) {
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		'position',
		attribute(data.vertices.flatMap(point => [point.x, point.y, point.z]), 3)
	);
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	geometry.setAttribute('zone', attribute(
		data.zones.flatMap((zone, index) => {
			return minimalMeadowZoneWeight(
				zone,
				data.roadMasks?.[index] || 0
			);
		}),
		4
	));
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
		ecologicalWeightPolicy: 'strong-six-source-mobile-blend',
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

export function minimalMeadowZoneWeight(zone, rawRoad = 0) {
	const road = clamp(rawRoad);
	if (road > 0) {
		return [0.18 * (1 - road), road, 0.08 * (1 - road), 0.02];
	}
	if (zone === 'lake-basin') return [0.06, 0, 0.92, 0.02];
	if (zone === 'river-bank') return [0.12, 0, 0.86, 0.02];
	if (zone === 'wet-meadow') return [0.3, 0, 0.66, 0.04];
	if (zone === 'meadow-dry-grass') return [0.64, 0, 0.14, 0.22];
	if (zone === 'village-terrace') return [0.54, 0, 0.16, 0.3];
	if (zone === 'alpine-rock') return [0.05, 0, 0.04, 0.91];
	return [0.8, 0, 0.14, 0.06];
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function indexArray(indices) {
	return Math.max(0, ...indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
