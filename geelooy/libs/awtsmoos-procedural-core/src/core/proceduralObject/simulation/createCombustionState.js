// B"H
// Boruch Hashem
// Blessed is He
/** Fuel, heat, smoke, and motion become explicit finite fields of combustion. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";

export function createCombustionState(input = {}) {
	const dimensions = input.dimensions ?? input;
	const template = createScalarGrid2d(dimensions);
	const scalar = value => createScalarGrid2d({ ...template, ...(value ?? {}) });
	return Object.freeze({
		schema: "awtsmoos.combustion-state",
		id: input.id ?? createStableId("combustion.state", { width: template.width, height: template.height }),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		velocity: createVectorGrid2d({ ...template, ...(input.velocity ?? {}) }),
		density: scalar(input.density),
		temperature: scalar(input.temperature),
		fuel: scalar(input.fuel)
	});
}
