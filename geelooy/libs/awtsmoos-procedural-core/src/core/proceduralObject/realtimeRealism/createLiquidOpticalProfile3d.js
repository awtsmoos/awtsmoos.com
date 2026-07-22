// B"H
// Boruch Hashem
// Blessed is He
/** Liquid optics expose physical appearance independently from simulation numerics. */

import { createStableId } from "../foundation/artifacts/createStableId.js";

const WATER = Object.freeze({
	ior: 1.333,
	absorption: [0.045, 0.018, 0.008],
	scattering: [0.008, 0.012, 0.018],
	viscosity: 0.001,
	surfaceTension: 0.0728
});

function vector(value, fallback) {
	return Object.freeze((value ?? fallback).map((entry) => Math.max(0, Number(entry))));
}

/** Creates a renderer-neutral spectral approximation for clear or turbid liquid. */
export function createLiquidOpticalProfile3d(state, options = {}) {
	const turbidity = Math.max(0, Number(options.turbidity ?? 0.08));
	const foamCoverage = Math.max(0, Math.min(1, Number(options.foamCoverage ?? 0)));
	return Object.freeze({
		schema: "awtsmoos.liquid-optical-profile-3d",
		id: createStableId("liquid.optics", { stateId: state.id, tick: state.tick }),
		ior: Math.max(1, Number(options.ior ?? WATER.ior)),
		absorption: vector(options.absorption, WATER.absorption),
		scattering: vector(options.scattering, WATER.scattering),
		phaseAnisotropy: Math.max(-0.99, Math.min(0.99, Number(options.phaseAnisotropy ?? 0.2))),
		turbidity,
		viscosity: Math.max(0, Number(options.viscosity ?? WATER.viscosity)),
		surfaceTension: Math.max(0, Number(options.surfaceTension ?? WATER.surfaceTension)),
		microfacetRoughness: Math.max(0.005, Math.min(1, Number(options.roughness ?? 0.035 + turbidity * 0.08))),
		foam: Object.freeze({
			coverage: foamCoverage,
			color: Object.freeze(options.foamColor ?? [0.94, 0.97, 1, 1]),
			roughness: 0.72,
			subsurface: 0.18
		}),
		thinFilm: Object.freeze({ enabled: true, thicknessRangeNanometers: [180, 900] }),
		sourceLiquidStateId: state.id
	});
}
