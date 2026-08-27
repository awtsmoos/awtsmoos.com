// B"H
// Boruch Hashem
// Blessed is He
/** Plant physiology turns geometry into a living environmental participant. */

import { measureBotanicalBounds } from "./botanicalBounds.js";

function clamp(value, minimum = 0, maximum = 1) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

/** Derives photosynthesis, transpiration, hydration, and growth signals. */
export function createBotanicalPhysiology(plant, options = {}) {
	const bounds = measureBotanicalBounds(plant);
	const light = clamp(options.light ?? 0.78);
	const hydration = clamp(options.hydration ?? 0.72);
	const temperature = Number(options.temperatureCelsius ?? 22);
	const humidity = clamp(options.humidity ?? 0.55);
	const leafArea = Math.max(0.001, bounds.spread * Math.max(bounds.height, 0.1) * 0.62);
	const temperatureEfficiency = Math.exp(-((temperature - 24) ** 2) / 180);
	const photosynthesis = light * hydration * temperatureEfficiency * leafArea;
	const transpiration = light * (1 - humidity) * temperatureEfficiency * leafArea * 0.18;
	return Object.freeze({
		schema: "awtsmoos.botanical-physiology",
		sourceSpeciesId: plant.speciesId,
		environment: Object.freeze({ light, hydration, temperature, humidity }),
		leafArea,
		photosynthesis,
		respiration: Math.max(0.001, leafArea * 0.025 * (1 + (temperature - 20) * 0.025)),
		transpiration,
		sapFlow: Math.max(0, hydration * (photosynthesis + transpiration) * 0.35),
		stomataOpen: clamp(light * hydration * (1 - Math.max(0, temperature - 34) / 15)),
		wilting: clamp((0.35 - hydration) / 0.35),
		growthRate: Math.max(0, photosynthesis * 0.11 - transpiration * 0.04),
		seasonalPhase: clamp(options.seasonalPhase ?? 0.55),
		resourceSignals: Object.freeze({ carbon: photosynthesis, water: hydration, heatStress: clamp((temperature - 30) / 15) })
	});
}
