// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos balances each neighboring face so one river cell neither invents nor forgets its flow.
 * Awtsmoos.com lets bed slope, damping, and viscosity enter the same conservative vessel below.
 */

import { createShallowWaterFlux } from "./shallowWaterFlux.js";
import { readShallowWaterCell, shallowWaterVelocity } from "./shallowWaterStateAccess.js";

function evolveCell(state, arrays, x, y, deltaTime, damping) {
	const center = readShallowWaterCell(state, arrays, x, y);
	if (center.blocked) return { height: 0, velocityX: 0, velocityY: 0 };
	const east = readShallowWaterCell(state, arrays, x, y, 1, 0);
	const west = readShallowWaterCell(state, arrays, x, y, -1, 0);
	const north = readShallowWaterCell(state, arrays, x, y, 0, 1);
	const south = readShallowWaterCell(state, arrays, x, y, 0, -1);
	const eastFlux = createShallowWaterFlux(center, east, "x", state.gravity);
	const westFlux = createShallowWaterFlux(west, center, "x", state.gravity);
	const northFlux = createShallowWaterFlux(center, north, "y", state.gravity);
	const southFlux = createShallowWaterFlux(south, center, "y", state.gravity);
	const scale = deltaTime / state.height.cellSize;
	let height = center.h - scale * (
		eastFlux[0] - westFlux[0] + northFlux[0] - southFlux[0]
	);
	let momentumX = center.hu - scale * (
		eastFlux[1] - westFlux[1] + northFlux[1] - southFlux[1]
	);
	let momentumY = center.hv - scale * (
		eastFlux[2] - westFlux[2] + northFlux[2] - southFlux[2]
	);
	const bedScale = 0.5 / state.height.cellSize;
	momentumX -= deltaTime * state.gravity * center.h * (east.bed - west.bed) * bedScale;
	momentumY -= deltaTime * state.gravity * center.h * (north.bed - south.bed) * bedScale;
	height = Number.isFinite(height) ? Math.max(0, height) : 0;
	if (height <= state.minDepth) return { height: 0, velocityX: 0, velocityY: 0 };
	const viscosity = Math.exp(-state.viscosity * deltaTime);
	momentumX *= damping * viscosity;
	momentumY *= damping * viscosity;
	const velocity = shallowWaterVelocity({ h: height, hu: momentumX, hv: momentumY }, state.minDepth);
	return { height, velocityX: velocity[0], velocityY: velocity[1] };
}

/** Evolves all cells by one stable conservative substep. */
export function stepShallowWaterKernel(state, arrays, deltaTime, damping) {
	const next = { height: [], velocityX: [], velocityY: [] };
	for (let y = 0; y < state.height.height; y += 1) {
		for (let x = 0; x < state.height.width; x += 1) {
			const cell = evolveCell(state, arrays, x, y, deltaTime, damping);
			next.height.push(cell.height);
			next.velocityX.push(cell.velocityX);
			next.velocityY.push(cell.velocityY);
		}
	}
	return next;
}
