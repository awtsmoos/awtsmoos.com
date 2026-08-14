// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers terrain, water, motion, rain, and walls into one immutable hydrodynamic vessel.
 * Awtsmoos.com preserves the simple height-and-velocity covenant while revealing deeper physics at every cell.
 */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";

const BOUNDARIES = new Set(["open", "closed", "periodic"]);

function scalarLayer(height, input = {}, fallback = 0) {
	const values = input.values ?? Array(height.width * height.height).fill(fallback);
	return createScalarGrid2d({
		width: height.width,
		height: height.height,
		cellSize: height.cellSize,
		...input,
		values
	});
}

function normalizeSources(sources = []) {
	return Object.freeze(sources.map((source = {}) => Object.freeze({
		radius: Math.max(0, Number(source.radius ?? 0)),
		rate: Number(source.rate ?? 0),
		velocityX: Number(source.velocityX ?? 0),
		velocityY: Number(source.velocityY ?? 0),
		x: Number(source.x ?? 0),
		y: Number(source.y ?? 0)
	})));
}

function normalizeSolver(solver = {}) {
	return Object.freeze({
		cfl: Math.max(0.05, Math.min(0.95, Number(solver.cfl ?? 0.42))),
		maxSubsteps: Math.max(1, Math.floor(solver.maxSubsteps ?? 64)),
		scheme: "finite-volume-rusanov"
	});
}

/** Creates a backward-compatible shallow-water state with optional terrain and forcing. */
export function createShallowWaterState(input = {}) {
	const height = createScalarGrid2d(input.heightGrid ?? input);
	const velocity = createVectorGrid2d({
		width: height.width,
		height: height.height,
		cellSize: height.cellSize,
		...(input.velocityGrid ?? {})
	});
	const boundary = BOUNDARIES.has(input.boundary) ? input.boundary : "open";
	return Object.freeze({
		schema: "awtsmoos.shallow-water-state",
		id: input.id ?? createStableId("water.state", { width: height.width, height: height.height }),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		gravity: Math.max(0, Number(input.gravity ?? 9.81)),
		damping: Math.max(0, Math.min(1, Number(input.damping ?? 0.999))),
		viscosity: Math.max(0, Number(input.viscosity ?? 0)),
		minDepth: Math.max(0, Number(input.minDepth ?? 0.0001)),
		rainRate: Number(input.rainRate ?? 0),
		boundary,
		solver: normalizeSolver(input.solver),
		sources: normalizeSources(input.sources),
		height,
		velocity,
		terrain: scalarLayer(height, input.terrainGrid ?? input.terrain),
		obstacles: scalarLayer(height, input.obstacleGrid ?? input.obstacles)
	});
}
