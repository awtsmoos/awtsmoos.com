// B"H
// Boruch Hashem
// Blessed is He
/** Height and momentum exchange through bounded differences in the water vessel. */

import { createScalarGrid2d, createVectorGrid2d, gridIndex } from "./grid2d.js";
import { createShallowWaterState } from "./createShallowWaterState.js";

function at(values, grid, x, y) {
	const clampedX = Math.max(0, Math.min(grid.width - 1, x));
	const clampedY = Math.max(0, Math.min(grid.height - 1, y));
	return values[gridIndex(grid, clampedX, clampedY)];
}

export function stepShallowWater(state, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const substeps = Math.max(1, Math.floor(options.substeps ?? 1));
	let height = state.height;
	let velocity = state.velocity;
	const dt = deltaTime / substeps;
	for (let step = 0; step < substeps; step += 1) {
		const nextX = [];
		const nextY = [];
		const nextHeight = [];
		for (let y = 0; y < height.height; y += 1) {
			for (let x = 0; x < height.width; x += 1) {
				const index = gridIndex(height, x, y);
				const gradientX = (at(height.values, height, x + 1, y) - at(height.values, height, x - 1, y)) * 0.5 / height.cellSize;
				const gradientY = (at(height.values, height, x, y + 1) - at(height.values, height, x, y - 1)) * 0.5 / height.cellSize;
				const vx = (velocity.x[index] - state.gravity * gradientX * dt) * state.damping;
				const vy = (velocity.y[index] - state.gravity * gradientY * dt) * state.damping;
				const fluxX = at(height.values, height, x + 1, y) * at(velocity.x, velocity, x + 1, y)
					- at(height.values, height, x - 1, y) * at(velocity.x, velocity, x - 1, y);
				const fluxY = at(height.values, height, x, y + 1) * at(velocity.y, velocity, x, y + 1)
					- at(height.values, height, x, y - 1) * at(velocity.y, velocity, x, y - 1);
				nextX.push(vx);
				nextY.push(vy);
				nextHeight.push(Math.max(0, height.values[index] - dt * (fluxX + fluxY) * 0.5 / height.cellSize));
			}
		}
		height = createScalarGrid2d({ ...height, values: nextHeight });
		velocity = createVectorGrid2d({ ...velocity, x: nextX, y: nextY });
	}
	return createShallowWaterState({ ...state, tick: state.tick + 1, time: state.time + deltaTime, heightGrid: height, velocityGrid: velocity });
}
