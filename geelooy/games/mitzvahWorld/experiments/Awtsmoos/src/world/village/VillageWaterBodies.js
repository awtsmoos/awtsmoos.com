// B"H
import { WORLD_MATERIAL_PRESETS } from '../../assets/TextureCatalog.js';
import {
	normalBetween,
	sampleStream,
	villageLandmarks
} from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/** Builds the unchanged lake and stream meshes after the decorative shore systems were split out. */
export function createWaterBodyDefinitions(groundSampler) {
	return [lakeDefinition(groundSampler), streamDefinition(groundSampler)];
}

function lakeDefinition(groundSampler) {
	const lake = villageLandmarks().lake;
	const vertices = [[lake.x, waterY(groundSampler, lake.x, lake.z), lake.z]];
	const faces = [];
	const uvs = [0.5, 0.5];
	for (let index = 0; index < 64; index += 1) {
		const angle = index / 64 * Math.PI * 2;
		const x = lake.x + Math.cos(angle) * lake.radiusX;
		const z = lake.z + Math.sin(angle) * lake.radiusZ;
		vertices.push([x, waterY(groundSampler, x, z), z]);
		uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
	}
	for (let index = 0; index < 64; index += 1) {
		faces.push([0, index + 1, (index + 1) % 64 + 1]);
	}
	return waterManual(
		'Awtsmoos_lake_basin_real_water',
		vertices,
		faces,
		uvs,
		WORLD_MATERIAL_PRESETS.water[1],
		[4.4, 3.4],
		'#78bfe8'
	);
}

function streamDefinition(groundSampler) {
	const points = sampleStream(36);
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index < points.length; index += 1) {
		const current = points[index];
		const next = points[Math.min(index + 1, points.length - 1)];
		const previous = points[Math.max(0, index - 1)];
		const normal = normalBetween(previous, next);
		for (const side of [-1, 1]) {
			const x = current.x + normal.x * current.width * side;
			const z = current.z + normal.z * current.width * side;
			vertices.push([x, waterY(groundSampler, x, z), z]);
			uvs.push(index / 5, side < 0 ? 0 : 1);
		}
	}
	for (let index = 0; index < points.length - 1; index += 1) {
		const start = index * 2;
		faces.push([start, start + 2, start + 3, start + 1]);
	}
	return waterManual(
		'Awtsmoos_flowing_stream_real_water',
		vertices,
		faces,
		uvs,
		WORLD_MATERIAL_PRESETS.water[0],
		[10, 2],
		'#64b9df'
	);
}

function waterManual(id, vertices, faces, uvs, textureUrl, mapRepeat, color) {
	return {
		id,
		shape: 'manual',
		vertices,
		faces,
		uvs,
		color,
		textureUrl,
		mapRepeat,
		transparent: true,
		doubleSided: true,
		solid: false,
		noEdge: true,
		texturePolicy: {
			...waterShaderPolicy(),
			publicFirebase: true,
			realMaterialRequired: true
		}
	};
}

/** Describes the moving-water shader contract consumed by world animation and audits. */
export function waterShaderPolicy() {
	return {
		shader: 'layered-flow-refraction-fresnel-foam',
		flowScroll: [0.018, 0.006],
		refraction: 0.13,
		fresnel: 0.74,
		edgeFoam: 0.42,
		textureDriven: true,
		animated: true
	};
}

function waterY(groundSampler, x, z) {
	return villageGroundHeight(groundSampler, x, z) + 0.16;
}
