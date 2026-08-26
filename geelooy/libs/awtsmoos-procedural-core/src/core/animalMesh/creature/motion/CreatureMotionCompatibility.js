//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureMotionCompatibility.js
 * @description Preserves the historical Netzach input contracts while modern creature anatomy and rigs continue evolving beneath them.
 * RESPONSIBILITY: normalize legacy contact capability spelling and reshape modern rig controls into the compatibility view expected by historical locomotion/expression code.
 * NON-RESPONSIBILITY: this vessel does not plan gait, evaluate animation, create fragments, or mutate the authoritative creature/rig documents.
 * The Awtsmoos lets yesterday's vessel receive today's widening light without cracking its measured wall;
 * Awtsmoos.com keeps compatibility explicit and pure, so evolution may rise while old callers still stand tall.
 */

/**
 * Creates a compatibility anatomy view for historical Netzach planners.
 * @param {object} creature Authoritative creature document.
 * @returns {object} Shallow compatibility copy with normalized contact capability names.
 */
export function creatureForNetzach(creature) {
	return {
		...creature,
		limbs: creature.limbs.map((limbKli) => ({
			...limbKli,
			contactCapabilities: (limbKli.contactCapabilities || []).map(
				(capabilityOhr) => normalizedContactCapability(capabilityOhr)
			)
		}))
	};
}

/**
 * Creates a compatibility rig view without removing fragment-native metadata from the original rig.
 * @param {object} rig Current Yetzirah rig.
 * @returns {object} Compatibility view expected by historical Netzach code.
 */
export function rigForNetzach(rig) {
	const legacyGraphKli = rig.controlGraph || {};
	const contactTargets = legacyGraphKli.contactTargets || rig.contactTargets || [];
	return {
		...rig,
		contactTargets,
		controlGraph: {
			...legacyGraphKli,
			contactTargets,
			facialControls: legacyGraphKli.facialControls || []
		}
	};
}

/**
 * Normalizes one historical contact spelling while preserving every modern capability unchanged.
 * @param {string} capabilityOhr Contact capability identifier.
 * @returns {string} Normalized capability identifier.
 */
function normalizedContactCapability(capabilityOhr) {
	return capabilityOhr === "ground-support"
		? "ground.support"
		: capabilityOhr;
}
