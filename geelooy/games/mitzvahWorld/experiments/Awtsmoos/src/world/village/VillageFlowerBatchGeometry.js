// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const FLOWER_COLORS = Object.freeze(['#fff0f6', '#ffd166', '#caa8ff', '#ff8fa3']);

/**
 * Compresses seventy-two flowers into five manual meshes while preserving every planting point.
 * The meadow remains many-colored, yet the renderer receives one stem field and four blossom fields.
 */
export function createFlowerBatchDefinitions(groundSampler) {
	const stemGeometry = emptyGeometry();
	const blossomGeometry = FLOWER_COLORS.map(emptyGeometry);
	for (let index = 0; index < 72; index += 1) {
		const point = flowerPoint(index, groundSampler);
		appendCrossedStem(stemGeometry, point, 0.032, 0.36);
		appendOctahedron(blossomGeometry[index % FLOWER_COLORS.length], {
			x: point.x,
			y: point.y + 0.39,
			z: point.z
		}, 0.095);
	}
	return [stemDefinition(stemGeometry), ...blossomGeometry.map(blossomDefinition)];
}

function flowerPoint(index, groundSampler) {
	const angle = index * 2.399;
	const radius = 14 + (index % 9) * 1.55;
	const x = Math.cos(angle) * radius + Math.sin(index * 0.31) * 2.8;
	const z = Math.sin(angle) * radius * 0.68 + 3;
	return { x, y: villageGroundHeight(groundSampler, x, z), z };
}

function appendCrossedStem(geometry, point, width, height) {
	const bottom = point.y;
	const top = point.y + height;
	appendQuad(geometry, [
		[point.x - width, bottom, point.z],
		[point.x + width, bottom, point.z],
		[point.x + width, top, point.z],
		[point.x - width, top, point.z]
	]);
	appendQuad(geometry, [
		[point.x, bottom, point.z - width],
		[point.x, bottom, point.z + width],
		[point.x, top, point.z + width],
		[point.x, top, point.z - width]
	]);
}

function appendOctahedron(geometry, center, radius) {
	const start = geometry.vertices.length;
	geometry.vertices.push(
		[center.x, center.y + radius, center.z],
		[center.x + radius, center.y, center.z],
		[center.x, center.y, center.z + radius],
		[center.x - radius, center.y, center.z],
		[center.x, center.y, center.z - radius],
		[center.x, center.y - radius, center.z]
	);
	for (const face of [
		[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
		[5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
	]) {
		geometry.faces.push(face.map((index) => index + start));
	}
}

function appendQuad(geometry, vertices) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...vertices);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
}

function stemDefinition(geometry) {
	return batchDefinition('Awtsmoos_flower_stems_batch', geometry, '#2f8f45', TEXTURE_URLS.terrain.grass8, 72);
}

function blossomDefinition(geometry, index) {
	return batchDefinition(
		`Awtsmoos_flower_blossoms_batch_${index}`,
		geometry,
		FLOWER_COLORS[index],
		TEXTURE_URLS.leaves.leaf1,
		18
	);
}

function batchDefinition(id, geometry, color, textureUrl, instances) {
	return {
		id,
		shape: 'manual',
		...geometry,
		color,
		textureUrl,
		doubleSided: true,
		solid: false,
		noEdge: true,
		userData: { staticBatch: true, family: 'flowers', instances }
	};
}

function emptyGeometry() {
	return { vertices: [], faces: [] };
}
