// B"H
// Boruch Hashem
// Blessed is He
/** An explosion is finite energy declared before it moves smoke, heat, and debris. */

import { createStableId } from "../foundation/artifacts/createStableId.js";

export function createExplosionEvent(input = {}) {
	const center = Object.freeze([...(input.center ?? [0, 0, 0])].map(Number));
	const radius = Math.max(1e-9, Number(input.radius ?? 1));
	const energy = Math.max(0, Number(input.energy ?? 1));
	return Object.freeze({
		schema: "awtsmoos.explosion-event",
		id: input.id ?? createStableId("explosion", { center, radius, energy, seed: input.seed ?? 1 }),
		center,
		radius,
		energy,
		heat: Math.max(0, Number(input.heat ?? energy)),
		smoke: Math.max(0, Number(input.smoke ?? energy * 0.25)),
		particleImpulse: Math.max(0, Number(input.particleImpulse ?? energy)),
		time: Number(input.time ?? 0)
	});
}
