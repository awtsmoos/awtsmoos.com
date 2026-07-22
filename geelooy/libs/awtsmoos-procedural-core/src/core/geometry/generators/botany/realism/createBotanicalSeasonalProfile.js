// B"H
// Boruch Hashem
// Blessed is He
/** Seasonal physiology coordinates growth, flowering, fruit, and senescence. */

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value)));
}

function smoothPulse(phase, start, peak, end) {
	if (phase <= start || phase >= end) {
		return 0;
	}
	if (phase <= peak) {
		const factor = (phase - start) / Math.max(1e-6, peak - start);
		return factor * factor * (3 - 2 * factor);
	}
	const factor = (end - phase) / Math.max(1e-6, end - peak);
	return factor * factor * (3 - 2 * factor);
}

function season(phase) {
	if (phase < 0.25) {
		return "spring";
	}
	if (phase < 0.5) {
		return "summer";
	}
	if (phase < 0.75) {
		return "autumn";
	}
	return "winter";
}

/** Creates cyclical developmental and resource-allocation signals. */
export function createBotanicalSeasonalProfile(plant, physiology, options = {}) {
	const phase = ((Number(options.phase ?? physiology.seasonalPhase ?? 0.55) % 1) + 1) % 1;
	const evergreen = options.evergreen === true;
	const growth = smoothPulse(phase, 0.02, 0.19, 0.52);
	const flowering = smoothPulse(phase, 0.12, 0.28, 0.48);
	const fruiting = smoothPulse(phase, 0.32, 0.52, 0.72);
	const senescence = evergreen ? 0.08 : smoothPulse(phase, 0.58, 0.72, 0.92);
	const dormancy = evergreen ? 0.12 : smoothPulse(phase, 0.78, 0.94, 1.02);
	const leafRetention = evergreen ? 0.92 : clamp(1 - senescence * 0.82 - dormancy * 0.88);
	const carbon = Math.max(0, physiology.photosynthesis - physiology.respiration);
	const allocationTotal = Math.max(1e-6, growth + flowering + fruiting + 0.45);
	return Object.freeze({
		schema: "awtsmoos.botanical-seasonal-profile",
		sourceSpeciesId: plant.speciesId,
		phase,
		season: season(phase),
		evergreen,
		development: Object.freeze({ growth, flowering, fruiting, senescence, dormancy }),
		leafRetention,
		colorShift: Object.freeze({
			chlorophyll: clamp(leafRetention * (1 - senescence * 0.65)),
			carotenoid: clamp(0.18 + senescence * 0.75),
			anthocyanin: clamp(senescence * 0.48),
			barkDarkening: clamp(0.2 + dormancy * 0.35)
		}),
		resourceAllocation: Object.freeze({
			vegetative: carbon * growth / allocationTotal,
			reproductive: carbon * (flowering + fruiting) / allocationTotal,
			rootStorage: carbon * (0.2 + dormancy * 0.65) / allocationTotal,
			maintenance: carbon * 0.25 / allocationTotal
		}),
		geometrySignals: Object.freeze({
			budScale: 0.2 + growth * 0.8,
			flowerVisibility: flowering,
			fruitScale: fruiting,
			leafDropProbability: clamp(1 - leafRetention)
		})
	});
}
