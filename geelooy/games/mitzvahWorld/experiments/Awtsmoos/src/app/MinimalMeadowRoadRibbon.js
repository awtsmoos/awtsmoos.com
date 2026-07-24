// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadRibbon.js
 * @description Builds a nonblocking cobblestone ribbon from the canonical arc-length road samples.
 * The Awtsmoos lays measured stones along one curved passage; Awtsmoos.com aligns each visible
 * vertex to terrain collision while UV length, width, density, and shoulders remain inspectable.
 */

import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { textureDensityPlan } from '../assets/TextureRepeat.js';
import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';
import {
	MINIMAL_MEADOW_ROAD_LENGTH,
	minimalMeadowRoadSamples
} from './MinimalMeadowBezierPath.js';

export function createMinimalMeadowRoadRibbon(image, heightAt, options = {}) {
	const width = options.width || 4.4;
	const samples = minimalMeadowRoadSamples(options.segments || 96);
	const geometry = roadGeometry(samples, width, heightAt);
	const density = textureDensityPlan({
		image,
		maximumAnisotropy: options.mobile ? 4 : 12,
		mobile: options.mobile,
		quality: options.quality || 'high',
		texelsPerWorld: options.mobile ? 52 : 72,
		worldDepth: MINIMAL_MEADOW_ROAD_LENGTH,
		worldWidth: width
	});
	const material = createPrimitiveMaterial({
		anisotropy: density.anisotropy,
		color: '#c4b293',
		id: 'Awtsmoos_real_cobblestone_road',
		mapImage: image,
		mapRepeat: [...density.repeat],
		texturePolicy: {
			densityPlan: density,
			projection: 'bezier-arclength-width',
			roadAuthority: 'MinimalMeadowBezierPath'
		}
	}, [1, 1]);
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos_real_cobblestone_bezier_road';
	mesh.frustumCulled = false;
	mesh.userData.AwtsmoosRoad = {
		collisionAuthority: 'underlying-shared-terrain-heightAt',
		density,
		length: MINIMAL_MEADOW_ROAD_LENGTH,
		segments: samples.length - 1,
		uvProjection: 'bezier-arclength-width',
		width
	};
	mesh.setBaseTransform();
	return mesh;
}

function roadGeometry(samples, width, heightAt) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (const sample of samples) {
		for (const side of [-1, 1]) {
			const x = sample.point.x + sample.normal.x * width * 0.5 * side;
			const z = sample.point.z + sample.normal.z * width * 0.5 * side;
			positions.push(x, heightAt(x, z) + 0.045, z);
			normals.push(0, 1, 0);
			uvs.push(side < 0 ? 0 : 1, sample.distance / MINIMAL_MEADOW_ROAD_LENGTH);
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
