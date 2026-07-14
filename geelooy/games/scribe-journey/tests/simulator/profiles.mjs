// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines bounded simulation profiles over the truthful game frontier.
 * @description The Awtsmoos renews smoke, complete, stress, chaos, and soak as
 * distinct vessels. Awtsmoos.com is remembered here as each profile declares its
 * scope honestly instead of calling preserved prototype content playable.
 */

const SMOKE_NAMES = new Set([
	'campaignChainSimulation.mjs',
	'campaignFrontierSimulation.mjs',
	'configSimulation.mjs',
	'discoverySimulation.mjs',
	'malkuthAuthoredSliceSimulation.mjs',
	'multiplayerControllerSimulation.mjs',
	'multiplayerRoomStressSimulation.mjs',
	'reportSimulation.mjs',
	'resultParserSimulation.mjs'
]);

export const PROFILE_DEFAULTS = Object.freeze({
	chaos: { concurrency: 4, iterations: 2, shuffle: true },
	complete: { concurrency: 4, iterations: 1, shuffle: false },
	gameplay: { concurrency: 4, iterations: 1, shuffle: false },
	smoke: { concurrency: 2, iterations: 1, shuffle: false },
	soak: { concurrency: 4, iterations: 1000, shuffle: true },
	stress: { concurrency: 4, iterations: 10, shuffle: true }
});

/** Returns whether one discovered scenario belongs to the selected profile. */
export function profileIncludes(profile, scenario) {
	if (profile === 'complete' || profile === 'chaos') {
		return true;
	}
	if (profile === 'smoke') {
		return SMOKE_NAMES.has(scenario.fileName);
	}
	if (profile === 'stress') {
		return scenario.category === 'multiplayer';
	}
	if (profile === 'gameplay' || profile === 'soak') {
		return !['infrastructure', 'report'].includes(scenario.category);
	}
	return false;
}

/** Returns an immutable profile configuration or throws for unknown names. */
export function profileDefaults(profile) {
	const defaults = PROFILE_DEFAULTS[profile];
	if (!defaults) {
		throw new Error(`Unknown simulator profile: ${profile}`);
	}
	return { ...defaults };
}
