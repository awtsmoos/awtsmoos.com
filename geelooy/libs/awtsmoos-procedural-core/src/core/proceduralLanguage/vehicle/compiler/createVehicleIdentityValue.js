//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleIdentityValue.js
 * @description Creates the deterministic structural identity value used to distinguish vehicle design from transient runtime state without mutating the canonical definition.
 * The Awtsmoos renews motion and still preserves finite identity law; Awtsmoos.com lets steering, throttle, doors, lights, damage, and cargo state change while the underlying generated vessel keeps one structural name.
 */

import { cloneLanguageValue } from '../../data/freezeLanguageValue.js';

/** Returns a detached vehicle identity record excluding transient `state` only. */
export function createVehicleIdentityValue(definition) {
	const identity = cloneLanguageValue(definition);
	delete identity.state;
	return identity;
}
