// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadRibbon.js
 * @description Builds a visible mixed road with physical world-space UV density.
 * The Awtsmoos lays measured stone through grass and soil; Awtsmoos.com keeps each cobble
 * near native resolution while the continuous road remains aligned to terrain collision.
 */

import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { textureDensityPlan } from '../assets/TextureRepeat.js';
import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';
import {
	MINIMAL_MEADOW_ROAD_LENGTH,
	minimalMeadowRoadSamples
} from './MinimalMeadowBezierPath.js';

export function createMinimalMeadowRoadRibbon(image, heightAt, options = {}) {
	const width = options.width || 5.2;
	const samples = minimalMeadowRoadSamples(options.segments || 128);
	const density = textureDensityPlan({
		image,
		maximumAnisotropy: options.mobile ? 4 : 12,
		mobile: options.mobile,
		quality: options.quality || 'high',
		texelsPerWorld: options.mobile ? 64 : 96,
		worldDepth: MINIMAL_MEADOW_ROAD_LENGTH,
		worldWidth: width
	});
	const geometry = roadGeometry(samples, width, heightAt, density.tileWorld);
	const material = createPrimitiveMaterial({
		anisotropy: density.anisotropy,
		color: '#d0b98f',
		id: 'Awtsmoos_mixed_physical_road',
		mapImage: image,
		mapRepeat: [1, 1],
		mixImage: options.shoulderImage || null,
		mixRepeat: [1, 1],
		mixStrength: 0.32,
		textureLayers: roadLayers(image, options),
		texturePolicy: {
			densityPlan: density,
			projection: 'bezier-world-density',
			roadAuthority: 'MinimalMeadowBezierPath'
		}
	}, [1, 1]);
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos_real_mixed_bezier_road';
	mesh.frustumCulled = false;
	mesh.visible = true;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.AwtsmoosRoad = {
		collisionAuthority: 'underlying-shared-terrain-heightAt',
		density,
		length: MINIMAL_MEADOW_ROAD_LENGTH,
		segments: samples.length - 1,
		sourceCount: roadLayers(image, options).length,
		uvProjection: 'bezier-world-density',
		width
	};
	mesh.setBaseTransform();
	return mesh;
}

function roadGeometry(samples, width, heightAt, tileWorld) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (const sample of samples) {
		for (const side of [-1, 1]) {
			const x = sample.point.x + sample.normal.x * width * 0.5 * side;
			const z = sample.point.z + sample.normal.z * width * 0.5 * side;
			positions.push(x, heightAt(x, z) + 0.12, z);
			normals.push(0, 1, 0);
			uvs.push(
				(side < 0 ? 0 : width) / tileWorld[0],
				sample.distance / tileWorld[1]
			);
		}
	}
	for (let index = 0; index < samples.length - 1; index += 1) {
		const first = index * 2;
		indices.push(first, first + 2, first + 1, first + 1, first + 2, first + 3);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
	return geometry;
}

function roadLayers(image, options) {
	return [
		{ image, repeat: [1, 1], strength: 0.72, zones: [0, 1, 0, 0] },
		{ image: options.shoulderImage, repeat: [1, 1], strength: 0.34, zones: [0.3, 0.7, 0, 0] },
		{ image: options.soilImage, repeat: [1, 1], strength: 0.2, zones: [0.2, 0.8, 0, 0] }
	].filter(layer => layer.image);
}
