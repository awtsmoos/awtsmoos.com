// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMesh.js
 * @description Creates one zoned terrain draw carrying a full eight-surface material recipe.
 * The Awtsmoos gives each valley vertex place and ecological meaning; Awtsmoos.com sends
 * meadow, lake, stream, and hill weights into seven sequential shader `mix()` revelations.
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
	dirtImage,
	fallbackUrl,
	quality = 'medium'
) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		data.vertices.flatMap(point => [point.x, point.y, point.z])
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
	mesh.name = 'Awtsmoos_hyper_real_valley_layered_terrain';
	mesh.userData.AwtsmoosTerrainValley = {
		...data.AwtsmoosTerrainValley,
		layerCount: material.textureLayers.length,
		shader: material.texturePolicy.shader
	};
	mesh.setBaseTransform();
	return mesh;
}

function zoneWeights(zones = []) {
	const weights = [];
	for (const zone of zones) weights.push(...zoneToWeight(zone));
	return weights;
}

function zoneToWeight(zone) {
	if (zone === 'lake-basin') return [0, 1, 0, 0];
	if (zone === 'stream-channel') return [0, 0, 1, 0];
	if (zone === 'village-plaza') return [1, 0, 0, 0.45];
	if (zone === 'distant-hills') return [0.65, 0, 0, 1];
	return [1, 0, 0, 0];
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
