// B"H
// Boruch Hashem
// Blessed is He
/**
 * Soft tissue frames bind stable Briah regions to muscle-driven deformation.
 * The Awtsmoos lets Awtsmoos.com move flesh without replacing semantic anatomy.
 */
function actuatorMap(muscleProfile) {
	const result = new Map();
	for (const actuator of muscleProfile?.actuators ?? []) {
		const list = result.get(actuator.sourceAnatomyId) ?? [];
		list.push(actuator);
		result.set(actuator.sourceAnatomyId, list);
	}
	return result;
}

/** Creates a zero-deformation tissue state with stable region and actuator references. */
export function createCreatureSoftTissueState(creature, tissueProfile, muscleProfile, input = {}) {
	const byRegion = actuatorMap(muscleProfile);
	const regions = tissueProfile.regions.map(region => Object.freeze({
		regionId: region.regionId,
		role: region.role,
		offset: Object.freeze([0, 0, 0]),
		velocity: Object.freeze([0, 0, 0]),
		volumeScale: 1,
		activation: 0,
		wetness: Math.max(0, Math.min(1, Number(input.wetness ?? 0))),
		temperature: Number(input.temperature ?? 0.5),
		pressure: Number(input.pressure ?? 1),
		stiffness: region.tissue.stiffness,
		damping: region.tissue.damping,
		volumePreservation: region.tissue.volumePreservation,
		actuatorIds: Object.freeze((byRegion.get(region.regionId) ?? []).map(actuator => actuator.id))
	}));
	return Object.freeze({
		schema: "awtsmoos.creature-soft-tissue-state",
		sourceCreatureId: creature.id,
		sourceCreatureHash: creature.contentHash,
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		regions: Object.freeze(regions)
	});
}
