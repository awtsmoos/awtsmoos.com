// B"H
// Boruch Hashem
// Blessed is He
/** Hydration and growth couple vascular life to wind, light, soil, and material response. */

/** Creates a renderer-neutral biomechanics and material coupling artifact. */
export function createBotanicalEnvironmentCoupling(vascularState, biomechanics, input = {}) {
	const byRole = Object.fromEntries(vascularState.organs.map(organ => [organ.role, organ]));
	const averageHydration = vascularState.organs.reduce((sum, organ) => sum + organ.hydration, 0)
		/ Math.max(1, vascularState.organs.length);
	const averageGrowth = vascularState.organs.reduce((sum, organ) => sum + organ.growthAllocation, 0)
		/ Math.max(1, vascularState.organs.length);
	return Object.freeze({
		schema: "awtsmoos.botanical-environment-coupling",
		sourceSpeciesId: vascularState.sourceSpeciesId,
		tick: vascularState.tick,
		averageHydration,
		averageGrowth,
		windModes: Object.freeze(biomechanics.windModes.map(mode => {
			const role = mode.name.includes("bloom") ? "bloom" : "body";
			const hydration = byRole[role]?.hydration ?? averageHydration;
			return Object.freeze({
				...mode,
				frequency: mode.frequency * (0.65 + hydration * 0.55),
				damping: mode.damping * (1.3 - hydration * 0.35),
				amplitude: mode.amplitude * (1.45 - hydration * 0.5)
			});
		})),
		material: Object.freeze({
			translucency: 0.12 + averageHydration * 0.24,
			roughness: 0.72 - averageHydration * 0.2,
			chlorophyll: averageHydration * Number(input.chlorophyllScale ?? 1),
			dryness: 1 - averageHydration,
			growthFlush: Math.min(1, averageGrowth * Number(input.growthColorScale ?? 8))
		}),
		stress: Object.freeze({
			wilting: 1 - averageHydration,
			mechanicalFragility: Math.max(0, 0.6 - averageHydration * 0.45),
			waterStress: Math.max(0, Number(input.waterDemand ?? 0.7) - averageHydration)
		})
	});
}
