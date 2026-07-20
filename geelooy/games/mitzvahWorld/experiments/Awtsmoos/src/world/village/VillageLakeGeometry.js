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
	return { faces, uvs, vertices };
}
