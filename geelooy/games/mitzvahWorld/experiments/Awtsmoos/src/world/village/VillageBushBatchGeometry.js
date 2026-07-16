// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const BUSH_COLORS = Object.freeze(['#356b3b', '#417f49', '#5d8c4f']);
const BUSH_COUNT = 24;

/**
 * Compresses the village shrub ring into three finite faceted batches. Each
 * bush keeps three overlapping leafy lobes, while twenty-one draw calls and
 * thousands of wasted triangles dissolve before reaching the renderer.
 */
export function createBushBatchDefinitions(groundSampler) {
	const batches = BUSH_COLORS.map(emptyGeometry);
	for (let index = 0; index < BUSH_COUNT; index += 1) {
		const center = bushCenter(index, groundSampler);
		const radius = 0.75 + index % 3 * 0.15;
		appendBush(batches[index % batches.length], center, radius, index);
	}
	return batches.map((geometry, index) => batchDefinition(
		geometry,
		index,
		BUSH_COLORS[index]
	));
}

export function bushBatchStats(definitions) {
	return definitions.reduce((summary, definition) => {
		summary.batches += 1;
		summary.instances += definition.userData?.instances || 0;
		summary.triangles += definition.faces.length;
		return summary;
	}, { batches: 0, instances: 0, triangles: 0 });
}

function bushCenter(index, groundSampler) {
	const angle = index / BUSH_COUNT * Math.PI * 2;
	const radialDistance = 18 + index % 4 * 6.2;
	const x = Math.cos(angle) * radialDistance;
	const z = Math.sin(angle) * radialDistance * 0.72 + 3;
	return {
		x,
		y: villageGroundHeight(groundSampler, x, z) + 0.7,
		z
	};
}

function appendBush(geometry, center, radius, seed) {
	appendOctahedron(geometry, center, radius);
	appendOctahedron(geometry, {
		x: center.x + radius * 0.42,
		y: center.y + radius * 0.18,
		z: center.z - radius * 0.18
	}, radius * (0.68 + seed % 2 * 0.05));
	appendOctahedron(geometry, {
		x: center.x - radius * 0.34,
		y: center.y + radius * 0.12,
		z: center.z + radius * 0.28
	}, radius * (0.62 + seed % 3 * 0.04));
}

function appendOctahedron(geometry, center, radius) {
	const start = geometry.vertices.length;
	geometry.vertices.push(
		[center.x, center.y + radius, center.z],
		[center.x + radius, center.y, center.z],
		[center.x, center.y, center.z + radius],
		[center.x - radius, center.y, center.z],
		[center.x, center.y, center.z - radius],
		[center.x, center.y - radius * 0.72, center.z]
	);
	for (const face of [
		[0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4],
		[5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]
	]) {
		geometry.faces.push(face.map((value) => start + value));
	}
}

function batchDefinition(geometry, index, color) {
	return {
		id: `Awtsmoos_living_bush_batch_${index}`,
		shape: 'manual',
		...geometry,
		color,
		textureUrl: TEXTURE_URLS.leaves.leaf1,
		mapRepeat: [2, 2],
		doubleSided: false,
		backfaceCull: true,
		solid: false,
		noEdge: true,
		userData: {
			staticBatch: true,
			family: 'village-bushes',
			instances: BUSH_COUNT / BUSH_COLORS.length,
			AwtsmoosLod: { className: 'vegetation' }
		},
		texturePolicy: {
			role: 'leaf-bush',
			publicFirebase: true,
			realMaterialRequired: true,
			shader: 'leaf-cluster-alpha-wind'
		}
	};
}

function emptyGeometry() {
	return { vertices: [], faces: [] };
}
