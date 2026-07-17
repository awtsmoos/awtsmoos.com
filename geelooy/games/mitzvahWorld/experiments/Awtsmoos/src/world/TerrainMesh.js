// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMesh.js
 * @description Creates one zoned terrain draw for canonical grass, bank, terrace, and rock.
 * The Awtsmoos clothes one continuous earth in changing ecological garments; Awtsmoos.com
 * preserves legacy zone names while the canonical valley carries richer measured weights.
 */

import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMaterial } from './terrain/TerrainMaterialFactory.js';

export function createTerrainMesh(data, grassImage, dirtImage, fallbackUrl, quality = 'medium') {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		data.vertices.flatMap((point) => [point.x, point.y, point.z])
	), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setAttribute('zone', new BufferAttribute(new Float32Array(zoneWeights(data.zones)), 4));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const material = createTerrainMaterial({
		dirtImage,
		fallbackUrl,
		grassImage,
		quality,
		size: data.size
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos_canonical_alpine_valley_terrain';
	mesh.userData.AwtsmoosTerrainValley = {
		...data.AwtsmoosTerrainValley,
		layerCount: material.textureLayers.length,
		shader: material.texturePolicy.shader
	};
	mesh.setBaseTransform();
	return mesh;
}

function zoneWeights(zones = []) {
	return zones.flatMap(zoneToWeight);
}

function zoneToWeight(zone) {
	if (zone === 'village-plaza') return [1, 0, 0, 0.45];
	if (zone === 'lake-basin') return [0.05, 0.72, 0.23, 0];
	if (zone === 'stream-channel') return [0.05, 0.72, 0.23, 0];
	if (zone === 'river-bank') return [0.22, 0.43, 0.35, 0];
	if (zone === 'village-terrace') return [0.48, 0.12, 0.1, 0.3];
	if (zone === 'alpine-rock') return [0.12, 0.05, 0.08, 0.75];
	return [0.82, 0.04, 0.12, 0.02];
}

function indexArray(indices) {
	return dataMaximum(indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}

function dataMaximum(indices) {
	let maximum = 0;
	for (const index of indices) maximum = Math.max(maximum, index);
	return maximum;
}
