// B"H
// Boruch Hashem
// Blessed is He

/** @file MarchingCubeDensity.js @description Deterministic signed density fields for voxel worlds. */
export function createDensitySampler(options = {}) {
	const field = options.field || 'terrain';
	const seed = Number(options.seed || 613);
	if (field === 'sphere') {
		const radius = Number(options.radius || 3);
		return ([x, y, z]) => radius - Math.hypot(x, y, z);
	}
	if (field === 'cavern') {
		return ([x, y, z]) => {
			const shell = Number(options.radius || 4) - Math.hypot(x, y * 0.8, z);
			const cave = Math.sin(x * 1.13 + seed) * Math.cos(z * 0.91 - seed) - y * 0.08;
			return Math.min(shell, -cave + 0.22);
		};
	}
	return ([x, y, z]) => {
		const hills = Math.sin((x + seed) * 0.23) * 1.4 + Math.cos((z - seed) * 0.19) * 1.1;
		const detail = Math.sin((x + z) * 0.71 + seed * 0.01) * 0.28;
		return hills + detail - y;
	};
}
