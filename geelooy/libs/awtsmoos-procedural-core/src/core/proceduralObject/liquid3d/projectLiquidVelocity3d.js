// B"H
// Boruch Hashem
// Blessed is He
/** Liquid pressure candidates are accepted only when measured divergence truly falls. */

import { projectVelocity3d } from "../simulation3d/projectVelocity3d.js";
import { measureGridDivergenceL1 } from "./measureLiquidState3d.js";

function iterationCandidates(options) {
	const requested = Math.max(1, Math.floor(options.pressureIterations ?? 32));
	const values = options.pressureIterationCandidates ?? [
		Math.max(4, Math.floor(requested / 2)),
		requested,
		requested * 2
	];
	return [...new Set(values.map(value => Math.max(1, Math.floor(value))))]
		.sort((left, right) => left - right);
}

export function projectLiquidVelocity3d(velocityGrid, options = {}) {
	const divergenceBefore = measureGridDivergenceL1(velocityGrid);
	let bestGrid = velocityGrid;
	let bestDivergence = divergenceBefore;
	let acceptedIterations = 0;
	for (const iterations of iterationCandidates(options)) {
		const candidate = projectVelocity3d(velocityGrid, iterations);
		const divergence = measureGridDivergenceL1(candidate);
		if (divergence < bestDivergence) {
			bestGrid = candidate;
			bestDivergence = divergence;
			acceptedIterations = iterations;
		}
	}
	return Object.freeze({
		velocityGrid: bestGrid,
		divergenceBefore,
		divergenceAfter: bestDivergence,
		projectionAccepted: acceptedIterations > 0,
		acceptedIterations
	});
}
