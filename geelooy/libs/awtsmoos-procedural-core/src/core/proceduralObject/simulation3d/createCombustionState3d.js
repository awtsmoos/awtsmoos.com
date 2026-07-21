// B"H
// Boruch Hashem
// Blessed is He
/** Velocity, smoke, heat, and fuel become one immutable three-dimensional state. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";

export function createCombustionState3d(input = {}) {
	const dimensions = input.dimensions ?? input;
	const template = createScalarGrid3d(dimensions);
	const scalar = declaration => createScalarGrid3d({ ...template, ...(declaration ?? {}) });
	return Object.freeze({
		schema: "awtsmoos.combustion-state-3d",
		id: input.id ?? createStableId("combustion.state.3d", {
			width: template.width,
			height: template.height,
			depth: template.depth
		}),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		velocity: createVectorGrid3d({ ...template, ...(input.velocity ?? {}) }),
		density: scalar(input.density),
		temperature: scalar(input.temperature),
		fuel: scalar(input.fuel)
	});
}
