// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/**
 * Replaces twenty-four shore boxes with one continuous textured lake-edge ribbon.
 * The duplicated closing pair preserves a clean UV seam around the full ellipse.
 */
export function createFoamBatchDefinition(groundSampler) {
	const lake = villageLandmarks().lake;
	const geometry = foamRibbonGeometry(groundSampler, lake, 24);
	return {
		id: 'Awtsmoos_lake_shore_foam_batch',
		shape: 'manual',
		...geometry,
		color: '#dff9ff',
		textureUrl: TEXTURE_URLS.water.bright,
		mapRepeat: [6, 1],
		transparent: true,
		doubleSided: true,
		solid: false,
		noEdge: true,
		texturePolicy: {
			role: 'shore-foam-batch',
			publicFirebase: true,
			realMaterialRequired: true,
			alpha: 0.74
		},
		userData: { staticBatch: true, family: 'lake-shore-foam', instances: 24 }
	};
}

function foamRibbonGeometry(groundSampler, lake, segments) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index <= segments; index += 1) {
		const ratio = index / segments;
		const angle = ratio * Math.PI * 2;
		appendPair(vertices, uvs, groundSampler, lake, angle, ratio);
	}
	for (let index = 0; index < segments; index += 1) {
		const start = index * 2;
		faces.push([start, start + 1, start + 3, start + 2]);
	}
	return { vertices, faces, uvs };
}

function appendPair(vertices, uvs, groundSampler, lake, angle, ratio) {
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	const inner = pointOnEllipse(groundSampler, lake, cosine, sine, 0.78);
	const outer = pointOnEllipse(groundSampler, lake, cosine, sine, 1.42);
	vertices.push(inner, outer);
	uvs.push(ratio, 0, ratio, 1);
}

function pointOnEllipse(groundSampler, lake, cosine, sine, offset) {
	const x = lake.x + cosine * (lake.radiusX + offset);
	const z = lake.z + sine * (lake.radiusZ + offset);
	return [x, villageGroundHeight(groundSampler, x, z) + 0.08, z];
}
