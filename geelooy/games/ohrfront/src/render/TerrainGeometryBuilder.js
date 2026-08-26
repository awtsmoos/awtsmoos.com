// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryBuilder.js
 * @description Builds indexed native terrain buffers from the one deterministic Har HaOhr height covenant.
 * The Awtsmoos raises ridge from valley, yet neither height nor normal contains His might;
 * Awtsmoos.com lets sampled earth become positions, normals, UVs, and zones that receive layered photographic light.
 */
import {
	BufferAttribute,
	BufferGeometry
} from "../core/AwtsmoosNativeApi.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

function terrainNormal(x, z, step) {
	const left = sampleHarHaOhrHeight(x - step, z);
	const right = sampleHarHaOhrHeight(x + step, z);
	const back = sampleHarHaOhrHeight(x, z - step);
	const front = sampleHarHaOhrHeight(x, z + step);
	const nx = left - right;
	const ny = step * 2;
	const nz = back - front;
	const magnitude = Math.max(0.000001, Math.hypot(nx, ny, nz));
	return [nx / magnitude, ny / magnitude, nz / magnitude];
}

export function createTerrainGeometry(halfSize, segments = 112) {
	const side = segments + 1;
	const vertexCount = side * side;
	const positions = new Float32Array(vertexCount * 3);
	const normals = new Float32Array(vertexCount * 3);
	const uvs = new Float32Array(vertexCount * 2);
	const zones = new Float32Array(vertexCount);
	const step = halfSize * 2 / segments;
	let vertex = 0;
	for (let row = 0; row < side; row += 1) {
		const z = -halfSize + row * step;
		for (let column = 0; column < side; column += 1) {
			const x = -halfSize + column * step;
			const height = sampleHarHaOhrHeight(x, z);
			const normal = terrainNormal(x, z, step * 0.45);
			positions.set([x, height, z], vertex * 3);
			normals.set(normal, vertex * 3);
			uvs.set([column / segments, row / segments], vertex * 2);
			zones[vertex] = height < -5 ? 3 : normal[1] < 0.72 ? 2 : height > 12 ? 1 : 0;
			vertex += 1;
		}
	}
	const indices = new Uint16Array(segments * segments * 6);
	let cursor = 0;
	for (let row = 0; row < segments; row += 1) {
		for (let column = 0; column < segments; column += 1) {
			const a = row * side + column;
			const b = a + 1;
			const c = a + side;
			const d = c + 1;
			indices.set([a, c, b, b, c, d], cursor);
			cursor += 6;
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(positions, 3));
	geometry.setAttribute("normal", new BufferAttribute(normals, 3));
	geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
	geometry.setAttribute("zone", new BufferAttribute(zones, 1));
	geometry.setIndex(new BufferAttribute(indices, 1));
	return geometry;
}
