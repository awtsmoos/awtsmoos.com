// B"H
/** Primitive human generation is intentionally disabled: runtime people are isolated chossid.glb actors only. */
export function createVillageNpcPopulationDefinitions() {
	const definitions = [];
	definitions.stats = {
		definitions: 0,
		people: 0,
		questGivers: 0,
		realtimeAnimations: 'provided-by-FriendlyNpcPopulation',
		visualPolicy: 'chossid.glb-only-no-stick-figures'
	};
	return definitions;
}
