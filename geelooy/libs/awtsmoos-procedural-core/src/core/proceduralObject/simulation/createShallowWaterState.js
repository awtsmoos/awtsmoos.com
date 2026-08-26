//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createShallowWaterState.js
 * @description Creates the immutable canonical shallow-water state spanning conserved motion plus transported foam, sediment, and shoreline wetness.
 * RESPONSIBILITY: normalize grids, boundaries, forcing, solver controls, and secondary-fluid policy while preserving the historical height/velocity contract.
 * NON-RESPONSIBILITY: this vessel does not advance time, evaluate fluxes, inject sources, transport scalars, or render water.
 * The Awtsmoos gathers terrain, water, motion, foam, silt, and remembered shore into one finite vessel of light;
 * Awtsmoos.com preserves old callers while deeper realism enters as optional fields, so yesterday's river and tomorrow's flood share one rite.
 */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";
import { createShallowWaterSecondaryPolicy } from "./shallowWaterSecondaryPolicy.js";

const BOUNDARIES = new Set(["open", "closed", "periodic"]);

/** Creates one scalar layer aligned to the canonical water grid. */
function scalarLayer(heightKli, inputKli = {}, fallbackOhr = 0) {
	const valuesOhr = inputKli?.values
		?? Array(heightKli.width * heightKli.height).fill(fallbackOhr);
	return createScalarGrid2d({
		cellSize: heightKli.cellSize,
		height: heightKli.height,
		...inputKli,
		values: valuesOhr,
		width: heightKli.width
	});
}

/** Normalizes persistent finite-volume sources and sinks. */
function normalizeSources(sourceKelim = []) {
	return Object.freeze(sourceKelim.map((sourceKli = {}) => Object.freeze({
		radius: Math.max(0, Number(sourceKli.radius ?? 0)),
		rate: Number(sourceKli.rate ?? 0),
		velocityX: Number(sourceKli.velocityX ?? 0),
		velocityY: Number(sourceKli.velocityY ?? 0),
		x: Number(sourceKli.x ?? 0),
		y: Number(sourceKli.y ?? 0)
	})));
}

/** Normalizes finite-volume stability controls. */
function normalizeSolver(solverKli = {}) {
	return Object.freeze({
		cfl: Math.max(0.05, Math.min(0.95, Number(solverKli.cfl ?? 0.42))),
		maxSubsteps: Math.max(1, Math.floor(solverKli.maxSubsteps ?? 64)),
		scheme: "finite-volume-rusanov"
	});
}

/**
 * Creates a backward-compatible shallow-water state with optional secondary realism fields.
 * @param {object} [input={}] Grid, forcing, terrain, obstacle, solver, and passive-field controls.
 * @returns {object} Frozen canonical shallow-water state.
 */
export function createShallowWaterState(input = {}) {
	const heightKli = createScalarGrid2d(input.heightGrid ?? input);
	const velocityKli = createVectorGrid2d({
		cellSize: heightKli.cellSize,
		height: heightKli.height,
		...(input.velocityGrid ?? {}),
		width: heightKli.width
	});
	const boundaryOhr = BOUNDARIES.has(input.boundary)
		? input.boundary
		: "open";
	return Object.freeze({
		boundary: boundaryOhr,
		damping: Math.max(0, Math.min(1, Number(input.damping ?? 0.999))),
		foam: scalarLayer(heightKli, input.foamGrid ?? input.foam),
		gravity: Math.max(0, Number(input.gravity ?? 9.81)),
		height: heightKli,
		id: input.id ?? createStableId("water.state", {
			height: heightKli.height,
			width: heightKli.width
		}),
		minDepth: Math.max(0, Number(input.minDepth ?? 0.0001)),
		obstacles: scalarLayer(heightKli, input.obstacleGrid ?? input.obstacles),
		rainRate: Number(input.rainRate ?? 0),
		schema: "awtsmoos.shallow-water-state",
		secondary: createShallowWaterSecondaryPolicy(input.secondary),
		sediment: scalarLayer(heightKli, input.sedimentGrid ?? input.sediment),
		solver: normalizeSolver(input.solver),
		sources: normalizeSources(input.sources),
		terrain: scalarLayer(heightKli, input.terrainGrid ?? input.terrain),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		velocity: velocityKli,
		viscosity: Math.max(0, Number(input.viscosity ?? 0)),
		wetness: scalarLayer(heightKli, input.wetnessGrid ?? input.wetness)
	});
}
