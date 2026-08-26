//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterHabitatSampler.js
 * @description Adapts live renderer-neutral shallow-water state into the existing ecosystem `habitatAt(x, z)` contract without coupling fluid numerics back to vegetation.
 * RESPONSIBILITY: map world coordinates into the water lattice, bilinearly sample depth/wetness/sediment/velocity, derive inundation and moisture evidence, and merge optional pre-existing terrain habitat fields.
 * NON-RESPONSIBILITY: this vessel does not evolve water, place plants, score species, mutate state, or assume a renderer coordinate object.
 * The Awtsmoos lets river and reed meet through evidence rather than entanglement, while Awtsmoos.com gives wet shore and living root one shared language clear;
 * water speaks depth and memory, ecology listens through habitat, and neither domain must steal the other's machinery to draw near.
 */

/**
 * Creates one habitat callback backed by a current shallow-water state.
 * @param {object} waterState Canonical shallow-water state containing aligned scalar/vector grids.
 * @param {object} [options={}] World origin, inundation scale, and optional base habitat callback.
 * @returns {(x:number, z:number) => object} Habitat callback suitable for `planVegetationPopulation`.
 */
export function createShallowWaterHabitatSampler(waterState, options = {}) {
	const originXOhr = finite(options.originX, 0);
	const originZOhr = finite(options.originZ, 0);
	const depthScaleOhr = Math.max(1e-6, finite(options.inundationDepthScale, 0.35));
	const baseHabitatAt = typeof options.baseHabitatAt === "function"
		? options.baseHabitatAt
		: () => ({});
	return (xOhr, zOhr) => {
		const baseKli = baseHabitatAt(xOhr, zOhr) || {};
		const gridKli = worldGridCoordinate(waterState, xOhr, zOhr, originXOhr, originZOhr);
		if (!gridKli.inside) {
			return baseKli;
		}
		const depthOhr = Math.max(0, sampleScalar(waterState.height?.values, waterState, gridKli));
		const wetnessOhr = unit(sampleScalar(waterState.wetness?.values, waterState, gridKli));
		const sedimentOhr = unit(sampleScalar(waterState.sediment?.values, waterState, gridKli));
		const velocityXOhr = sampleScalar(waterState.velocity?.x, waterState, gridKli);
		const velocityYOhr = sampleScalar(waterState.velocity?.y, waterState, gridKli);
		const inundationOhr = unit(depthOhr / depthScaleOhr);
		const hydrologyMoistureOhr = unit(Math.max(wetnessOhr, inundationOhr));
		return Object.freeze({
			...baseKli,
			flowSpeed: Math.hypot(velocityXOhr, velocityYOhr),
			inundation: inundationOhr,
			moisture: Math.max(unit(baseKli.moisture ?? 0), hydrologyMoistureOhr),
			riverProximity: Math.max(unit(baseKli.riverProximity ?? 0), unit(wetnessOhr * 0.7 + inundationOhr * 0.3)),
			sediment: sedimentOhr,
			waterDepth: depthOhr,
			wetness: wetnessOhr
		});
	};
}

/** Maps world coordinates to floating grid coordinates and reports domain membership. */
function worldGridCoordinate(stateKli, xOhr, zOhr, originXOhr, originZOhr) {
	const cellSizeOhr = Math.max(1e-9, finite(stateKli.height?.cellSize, 1));
	const gridXOhr = (finite(xOhr, originXOhr) - originXOhr) / cellSizeOhr;
	const gridYOhr = (finite(zOhr, originZOhr) - originZOhr) / cellSizeOhr;
	return {
		inside: gridXOhr >= 0
			&& gridYOhr >= 0
			&& gridXOhr <= stateKli.height.width - 1
			&& gridYOhr <= stateKli.height.height - 1,
		x: gridXOhr,
		y: gridYOhr
	};
}

/** Bilinearly samples one scalar array aligned to the water height lattice. */
function sampleScalar(valuesOhr, stateKli, coordinateKli) {
	const widthOhr = stateKli.height.width;
	const heightOhr = stateKli.height.height;
	const x0Ohr = Math.max(0, Math.min(widthOhr - 1, Math.floor(coordinateKli.x)));
	const y0Ohr = Math.max(0, Math.min(heightOhr - 1, Math.floor(coordinateKli.y)));
	const x1Ohr = Math.min(widthOhr - 1, x0Ohr + 1);
	const y1Ohr = Math.min(heightOhr - 1, y0Ohr + 1);
	const txOhr = coordinateKli.x - x0Ohr;
	const tyOhr = coordinateKli.y - y0Ohr;
	const southOhr = mix(cell(valuesOhr, widthOhr, x0Ohr, y0Ohr), cell(valuesOhr, widthOhr, x1Ohr, y0Ohr), txOhr);
	const northOhr = mix(cell(valuesOhr, widthOhr, x0Ohr, y1Ohr), cell(valuesOhr, widthOhr, x1Ohr, y1Ohr), txOhr);
	return mix(southOhr, northOhr, tyOhr);
}

/** Samples one finite flat-grid cell. */
function cell(valuesOhr, widthOhr, xOhr, yOhr) {
	return finite(valuesOhr?.[yOhr * widthOhr + xOhr], 0);
}

/** Interpolates two scalars. */
function mix(firstOhr, secondOhr, tiferes) {
	return firstOhr + (secondOhr - firstOhr) * tiferes;
}

/** Returns a finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** Clamps one scalar to the habitat unit interval. */
function unit(valueOhr) {
	return Math.max(0, Math.min(1, finite(valueOhr, 0)));
}
