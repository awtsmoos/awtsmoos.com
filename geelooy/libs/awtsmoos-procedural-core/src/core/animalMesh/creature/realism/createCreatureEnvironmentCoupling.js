// B"H
// Boruch Hashem
// Blessed is He
/** Water, air, temperature, and pressure become explicit tissue coupling evidence. */

/** Creates per-region wetness, drag, heat, and pressure transfer settings. */
export function createCreatureEnvironmentCoupling(state, input = {}) {
	const waterLevel = Number(input.waterLevel ?? -Infinity);
	const ambientTemperature = Number(input.ambientTemperature ?? 0.5);
	const wind = input.wind ?? [0, 0, 0];
	const flow = input.flow ?? [0, 0, 0];
	return Object.freeze({
		schema: "awtsmoos.creature-environment-coupling",
		sourceCreatureId: state.sourceCreatureId,
		tick: state.tick,
		regions: Object.freeze(state.regions.map((region, index) => {
			const height = Number(input.regionHeights?.[region.regionId] ?? index / Math.max(1, state.regions.length - 1));
			const submerged = height <= waterLevel;
			const wetness = submerged ? 1 : Math.max(0, region.wetness - Number(input.dryingRate ?? 0.02));
			const mediumVelocity = submerged ? flow : wind;
			return Object.freeze({
				regionId: region.regionId,
				submerged,
				wetness,
				temperature: region.temperature + (ambientTemperature - region.temperature)
					* Number(input.thermalTransfer ?? 0.08),
				pressure: submerged
					? 1 + Math.max(0, waterLevel - height) * Number(input.hydrostaticScale ?? 0.2)
					: 1,
				drag: submerged ? Number(input.waterDrag ?? 0.65) : Number(input.airDrag ?? 0.12),
				mediumVelocity: Object.freeze([...mediumVelocity])
			});
		}))
	});
}
