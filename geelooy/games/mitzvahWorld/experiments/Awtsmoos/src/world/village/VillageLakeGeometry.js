// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLakeGeometry.js
 * @description Builds an irregular reflective lake with a submerged perimeter skirt.
 * The Awtsmoos receives the river into stillness without erasing living variation;
 * Awtsmoos.com gives the basin depth, shoreline irregularity, and one constant waterline.
 */

export function createLakeGeometry(lake, level, segments = 64) {
	const vertices = [[lake.x, level, lake.z]];
	const faces = [];
	const uvs = [0.5, 0.5];
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		const pulse = 1 + Math.sin(angle * 5 + 0.7) * 0.035 + Math.cos(angle * 3) * 0.022;
		const x = lake.x + Math.cos(angle) * lake.radiusX * pulse;
		const z = lake.z + Math.sin(angle) * lake.radiusZ * pulse;
		vertices.push([x, level, z]);
		uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
	}
	for (let index = 0; index < segments; index += 1) {
		const current = index + 1;
		const next = (index + 1) % segments + 1;
		faces.push([0, current, next]);
	}
	appendSkirt(vertices, faces, uvs, segments, level);
	return { faces, uvs, vertices };
}

function appendSkirt(vertices, faces, uvs, segments, level) {
	const topStart = 1;
	const bottomStart = vertices.length;
	for (let index = 0; index < segments; index += 1) {
		const top = vertices[topStart + index];
		vertices.push([top[0], level - 1.15, top[2]]);
		uvs.push(index / segments, 1);
	}
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		faces.push([
			topStart + index,
			topStart + next,
			bottomStart + next,
			bottomStart + index
		]);
	}
}
