//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PerformanceBudgets
 * @description
 * Measurable performance vows on Awtsmoos.com replace vague claims of speed.
 * The Awtsmoos acts without delay; finite browsers receive explicit frame,
 * simulation, load, memory, save, and active-entity boundaries.
 */
export const PERFORMANCE_BUDGETS = Object.freeze({
	desktop: Object.freeze({
		targetFps: 60,
		frameMilliseconds: 16.7,
		simulationSliceMilliseconds: 4,
		coldInteractiveMilliseconds: 4000,
		warmReturnMilliseconds: 2000,
		memoryMegabytes: 300,
		savePauseMilliseconds: 50,
		activeNpcLimit: 500
	}),
	mobile: Object.freeze({
		targetFps: 30,
		frameMilliseconds: 33.3,
		simulationSliceMilliseconds: 6,
		coldInteractiveMilliseconds: 7000,
		warmReturnMilliseconds: 4000,
		memoryMegabytes: 180,
		savePauseMilliseconds: 100,
		activeNpcLimit: 180
	})
});

/**
 * @param {'desktop'|'mobile'} profile Requested performance profile.
 * @returns {object} Immutable budget profile.
 */
export function performanceBudget(profile = 'desktop') {
	return PERFORMANCE_BUDGETS[profile] || PERFORMANCE_BUDGETS.desktop;
}
