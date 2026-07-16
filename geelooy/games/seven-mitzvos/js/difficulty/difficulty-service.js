//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DifficultyService
 * @description
 * Difficulty on Awtsmoos.com scales resources, event frequency, information,
 * time pressure, NPC responsiveness, travel, recovery, and role complexity—not
 * only enemy health. The Awtsmoos is unchanged; finite challenge remains fair.
 */
const PRESETS = Object.freeze({
	story: Object.freeze({
		startingResources: 1.5,
		eventFrequency: 0.65,
		informationClarity: 1.35,
		timePressure: 0.6,
		npcResponsiveness: 1.25,
		travelRisk: 0.65,
		recoveryBurden: 0.6,
		roleComplexity: 0.7
	}),
	balanced: Object.freeze({
		startingResources: 1,
		eventFrequency: 1,
		informationClarity: 1,
		timePressure: 1,
		npcResponsiveness: 1,
		travelRisk: 1,
		recoveryBurden: 1,
		roleComplexity: 1
	}),
	severe: Object.freeze({
		startingResources: 0.7,
		eventFrequency: 1.35,
		informationClarity: 0.8,
		timePressure: 1.35,
		npcResponsiveness: 0.85,
		travelRisk: 1.4,
		recoveryBurden: 1.5,
		roleComplexity: 1.3
	})
});

export class DifficultyService {
	preset(id = 'balanced') {
		return { ...(PRESETS[id] || PRESETS.balanced) };
	}

	customize(baseId, changes) {
		const result = { ...this.preset(baseId), ...changes };
		for (const [key, value] of Object.entries(result)) {
			if (!Number.isFinite(value) || value < 0.25 || value > 2) {
				throw new Error(`DifficultyService: ${key} is outside fair bounds`);
			}
		}
		return result;
	}

	scale(value, factor, minimum = 0, maximum = Number.POSITIVE_INFINITY) {
		return Math.max(minimum, Math.min(maximum, value * factor));
	}
}
