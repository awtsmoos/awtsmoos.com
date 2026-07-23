// B"H
// Boruch Hashem
// Blessed is He
/**
 * Liquid, gas, dissolved matter, heat, soot, and velocity become one finite
 * vessel. The Awtsmoos lets Awtsmoos.com inspect every phase independently.
 */
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";

function scalar(template, declaration, fill) {
	return createScalarGrid3d({
		...template,
		values: undefined,
		fill,
		...(declaration ?? {})
	});
}

/** Creates an immutable phase-coupled voxel state. */
export function createMultiphaseState3d(input = {}) {
	const dimensions = input.dimensions ?? input;
	const template = createScalarGrid3d(dimensions);
	const identity = {
		width: template.width,
		height: template.height,
		depth: template.depth,
		cellSize: template.cellSize,
		origin: template.origin
	};
	return Object.freeze({
		schema: "awtsmoos.multiphase-state-3d",
		id: input.id ?? createStableId("multiphase.state.3d", identity),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		velocity: createVectorGrid3d({ ...template, ...(input.velocity ?? {}) }),
		liquidFraction: scalar(template, input.liquidFraction, 0),
		gasFraction: scalar(template, input.gasFraction, 0),
		dissolvedGas: scalar(template, input.dissolvedGas, 0),
		temperature: scalar(template, input.temperature, Number(input.ambientTemperature ?? 0)),
		soot: scalar(template, input.soot, 0),
		properties: Object.freeze({
			liquidDensity: Number(input.properties?.liquidDensity ?? 1000),
			gasDensity: Number(input.properties?.gasDensity ?? 1.225),
			ambientTemperature: Number(input.properties?.ambientTemperature ?? input.ambientTemperature ?? 0),
			boilingTemperature: Number(input.properties?.boilingTemperature ?? 1),
			condensationTemperature: Number(input.properties?.condensationTemperature ?? 0.82),
			latentHeat: Number(input.properties?.latentHeat ?? 0.35)
		})
	});
}
