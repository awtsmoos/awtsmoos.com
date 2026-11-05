// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFoamBatchGeometry.js
 * @description Batches lake shore and river-bank foam into one animated GPU vessel.
 * The Awtsmoos writes bright signs where water meets stone; Awtsmoos.com joins basin edge
 * and rushing banks without particles, extra textures, or multiplied transparent submissions.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createAnimatedWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';

export function createFoamBatchDefinition(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	const geometry = { faces: [], uvs: [], vertices: [] };
	appendLakeFoam(geometry, villageLandmarks().lake, profile.lakeLevel, 32);
	appendRiverFoam(geometry, profile);
	return {
		alphaMode: 'BLEND',
		color: '#e8fbff',
		doubleSided: true,
		...geometry,
		id: 'Awtsmoos_connected_water_foam_batch',
		mapRepeat: [12, 1],
		noEdge: true,
		opacity: 0.72,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			...createAnimatedWaterTexturePolicy({
				primaryUrl: TEXTURE_URLS.water.bright,
				waterVariant: 'foam'
			}),
			alpha: 0.72,
			role: 'connected-water-foam'
		},
		textureUrl: TEXTURE_URLS.water.bright,
		transparent: true,
		userData: {
			family: 'connected-water-foam',
			staticBatch: true,
			waterVariant: 'foam'
		}
	};
}

function appendLakeFoam(output, lake, level, segments) {
	for (let index = 0; index <= segments; index += 1) {
		const ratio = index / segments;
		const angle = ratio * Math.PI * 2;
		const cosine = Math.cos(angle);
		const sine = Math.sin(angle);
		appendPair(
			output,
			[lake.x + cosine * (lake.radiusX - 0.3), level + 0.035, lake.z + sine * (lake.radiusZ - 0.3)],
			[lake.x + cosine * (lake.radiusX + 0.65), level + 0.025, lake.z + sine * (lake.radiusZ + 0.65)],
			ratio
		);
	}
}

function appendRiverFoam(output, profile) {
	for (const side of [-1, 1]) {
		let previous = null;
		for (let index = 0; index < profile.points.length; index += 2) {
			const point = profile.points[index];
			const edge = bank(point, side, point.width - 0.12);
			const outer = bank(point, side, point.width + 0.38);
			if (previous) appendQuad(output, previous.edge, previous.outer, outer, edge, point.t);
			previous = { edge, outer };
		}
	}
}

function bank(point, side, distance) {
	return [
		point.x + point.normal.x * distance * side,
		point.y + 0.035,
		point.z + point.normal.z * distance * side
	];
}

function appendPair(output, inner, outer, ratio) {
	if (output.vertices.length >= 2) {
		const start = output.vertices.length - 2;
		output.faces.push([start, start + 1, start + 3, start + 2]);
	}
	output.vertices.push(inner, outer);
	output.uvs.push(ratio, 0, ratio, 1);
}

function appendQuad(output, a, b, c, d, ratio) {
	const start = output.vertices.length;
	output.vertices.push(a, b, c, d);
	output.faces.push([start, start + 1, start + 2, start + 3]);
	output.uvs.push(ratio, 0, ratio, 1, ratio + 0.1, 1, ratio + 0.1, 0);
}
