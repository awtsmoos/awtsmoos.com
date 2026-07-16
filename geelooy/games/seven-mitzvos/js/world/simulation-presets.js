//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SimulationPresets
 * @description
 * Story, Balanced, and Custom simulation on Awtsmoos.com change explanation,
 * active detail, autosave, and workload budgets without changing moral truth.
 * The Awtsmoos is equal in every life; only finite computation varies.
 */
const STORY = Object.freeze({
	id: 'story',
	activePeople: 96,
	scheduleDetail: 'summary',
	explanation: 'expanded',
	autosaveCommands: 1,
	aggregateStepDays: 7,
	adaptiveQuality: true
});
const BALANCED = Object.freeze({
	id: 'balanced',
	activePeople: 300,
	scheduleDetail: 'hourly',
	explanation: 'balanced',
	autosaveCommands: 5,
	aggregateStepDays: 3,
	adaptiveQuality: true
});
const CUSTOM = Object.freeze({
	id: 'custom',
	activePeople: 500,
	scheduleDetail: 'hourly',
	explanation: 'compact',
	autosaveCommands: 10,
	aggregateStepDays: 1,
	adaptiveQuality: true
});

export const SIMULATION_PRESETS = Object.freeze({
	story: STORY,
	balanced: BALANCED,
	custom: CUSTOM,
	guided: STORY,
	standard: BALANCED,
	deep: CUSTOM
});

/**
 * @param {string} id Requested preset identity.
 * @returns {object} Existing preset or Balanced fallback.
 */
export function simulationPreset(id) {
	return SIMULATION_PRESETS[id] || BALANCED;
}
