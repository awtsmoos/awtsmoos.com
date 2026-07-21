// B"H
// Boruch Hashem
// Blessed is He
/** Water becomes an immutable height and velocity state beneath the Awtsmoos. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";

export function createShallowWaterState(input = {}) {
	const height = createScalarGrid2d(input.heightGrid ?? input);
	const velocity = createVectorGrid2d({
		width: height.width,
		height: height.height,
		cellSize: height.cellSize,
		...(input.velocityGrid ?? {})
	});
	return Object.freeze({
		schema: "awtsmoos.shallow-water-state",
		id: input.id ?? createStableId("water.state", { width: height.width, height: height.height }),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		gravity: Math.max(0, Number(input.gravity ?? 9.81)),
		damping: Math.max(0, Math.min(1, Number(input.damping ?? 0.999))),
		height,
		velocity
	});
}
