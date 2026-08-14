// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets the river report what its motion means instead of hiding truth inside pixels alone.
 * Awtsmoos.com exposes depth, speed, energy, vorticity, divergence, and foam potential as one inspectable tone.
 */

function sample(values, width, height, x, y) {
	const safeX = Math.max(0, Math.min(width - 1, x));
	const safeY = Math.max(0, Math.min(height - 1, y));
	return values[safeY * width + safeX];
}

/** Builds summary and per-cell diagnostic fields from a shallow-water state. */
export function createShallowWaterDiagnostics(state) {
	const width = state.height.width;
	const height = state.height.height;
	const spacing = state.height.cellSize;
	const divergence = [];
	const vorticity = [];
	const foamPotential = [];
	let totalWater = 0;
	let wetCells = 0;
	let maxDepth = 0;
	let maxSpeed = 0;
	let kineticEnergy = 0;
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = y * width + x;
			const depth = Math.max(0, state.height.values[index]);
			const velocityX = state.velocity.x[index];
			const velocityY = state.velocity.y[index];
			const speed = Math.hypot(velocityX, velocityY);
			const duDx = (sample(state.velocity.x, width, height, x + 1, y) - sample(state.velocity.x, width, height, x - 1, y)) / (2 * spacing);
			const dvDy = (sample(state.velocity.y, width, height, x, y + 1) - sample(state.velocity.y, width, height, x, y - 1)) / (2 * spacing);
			const dvDx = (sample(state.velocity.y, width, height, x + 1, y) - sample(state.velocity.y, width, height, x - 1, y)) / (2 * spacing);
			const duDy = (sample(state.velocity.x, width, height, x, y + 1) - sample(state.velocity.x, width, height, x, y - 1)) / (2 * spacing);
			const localDivergence = duDx + dvDy;
			const localVorticity = dvDx - duDy;
			totalWater += depth * spacing * spacing;
			if (depth > state.minDepth) wetCells += 1;
			maxDepth = Math.max(maxDepth, depth);
			maxSpeed = Math.max(maxSpeed, speed);
			kineticEnergy += 0.5 * depth * speed * speed * spacing * spacing;
			divergence.push(localDivergence);
			vorticity.push(localVorticity);
			foamPotential.push(Math.min(1, Math.abs(localVorticity) * 0.35 + Math.max(0, -localDivergence) * 0.55));
		}
	}
	return Object.freeze({ divergence, foamPotential, kineticEnergy, maxDepth, maxSpeed, totalWater, vorticity, wetCells });
}
