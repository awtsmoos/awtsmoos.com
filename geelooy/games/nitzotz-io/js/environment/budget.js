// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';

/**
 * The Awtsmoos fills every finite vessel according to its capacity. Decorative
 * density yields early while each chapter keeps water, growth, mountain, and path.
 */
export function environmentBudget(world, preset) {
	const measuredQuality = quality(world);
	const tier = measuredQuality < 0.62 ? 'low' : measuredQuality < 0.9 ? 'medium' : 'high';
	const counts = tierCounts(tier);
	return Object.freeze({
		tier,
		quality: measuredQuality,
		roads: counts.roads,
		paths: counts.paths,
		terraces: counts.terraces,
		mountains: counts.mountains,
		clouds: counts.clouds,
		vegetation: Math.max(2, Math.round(counts.vegetation * preset.vegetationAmount)),
		water: Math.max(2, Math.round(counts.water * preset.waterAmount)),
		maximumCommands: counts.maximumCommands
	});
}

function tierCounts(tier) {
	if (tier === 'low') {
		return {
			roads: 5,
			paths: 3,
			terraces: 1,
			mountains: 3,
			clouds: 1,
			vegetation: 3,
			water: 3,
			maximumCommands: 26
		};
	}
	if (tier === 'medium') {
		return {
			roads: 6,
			paths: 4,
			terraces: 2,
			mountains: 5,
			clouds: 1,
			vegetation: 5,
			water: 4,
			maximumCommands: 34
		};
	}
	return {
		roads: 6,
		paths: 5,
		terraces: 2,
		mountains: 7,
		clouds: 2,
		vegetation: 7,
		water: 5,
		maximumCommands: 45
	};
}
