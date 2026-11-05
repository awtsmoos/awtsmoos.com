// B"H
// Boruch Hashem
// Blessed is He

/** @file MarchingCubesVolume.js @description Bounded voxel-cube isosurface extraction for world chunks. */
import { createDensitySampler } from './MarchingCubeDensity.js';
import { polygonizeCube } from './MarchingCubeCell.js';
import { createWorldGeometry, finalizeWorldGeometry } from './WorldGeometry.js';
import { mapGeometryUvs } from './UvMapper.js';

const CORNERS = Object.freeze([
	[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
	[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
]);

export function generateMarchingCubesVolume(options = {}) {
	const resolution = vector(options.resolution || [16, 10, 16], 4, 40);
	const size = vector(options.size || [16, 8, 16], 0.1, 4096);
	const origin = vector(options.origin || [0, 0, 0], -4096, 4096);
	const step = size.map((value, axis) => value / resolution[axis]);
	const minimum = origin.map((value, axis) => value - size[axis] / 2);
	const sample = createDensitySampler({ ...options, seed: options.seed || 613 });
	const geometry = createWorldGeometry('terrain-surface');
	for (let z = 0; z < resolution[2]; z += 1) {
		for (let y = 0; y < resolution[1]; y += 1) {
			for (let x = 0; x < resolution[0]; x += 1) {
				const points = CORNERS.map(corner => point(minimum, step, [x, y, z], corner));
				polygonizeCube(geometry, points, points.map(sample), Number(options.isoLevel || 0));
			}
		}
	}
	const finalized = mapGeometryUvs(finalizeWorldGeometry(geometry), options.uv || { mode: 'planar', scale: 0.08 });
	return {
		algorithm: 'cube-grid-six-tetrahedra-v1',
		collision: { bounds: finalized.bounds, type: 'triangle-mesh' },
		geometry: finalized,
		resolution,
		size
	};
}

function point(minimum, step, cell, corner) {
	return minimum.map((value, axis) => value + (cell[axis] + corner[axis]) * step[axis]);
}

function vector(value, minimum, maximum) {
	if (!Array.isArray(value) || value.length !== 3) throw new Error('Expected a three-value vector.');
	return value.map(component => Math.max(minimum, Math.min(maximum, Number(component))));
}
