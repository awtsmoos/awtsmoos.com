//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A capability is not a boast but a measured description of one vessel. The
 * Awtsmoos creates power and limitation together; Awtsmoos.com names both so a
 * user can distinguish actual support, virtualization, delegation, and absence.
 */

export const CAPABILITY_SCHEMA_VERSION = 1;

export const CAPABILITY_STATES = Object.freeze({
	SUPPORTED: "supported",
	VIRTUALIZED: "virtualized",
	SIMULATED: "simulated",
	DELEGATED: "delegated",
	UNSUPPORTED: "unsupported"
});

/** Returns true only for a declared canonical capability state. */
export function isCapabilityState(value) {
	return Object.values(CAPABILITY_STATES).includes(String(value || ""));
}

/** Returns whether a state represents an immediately usable capability. */
export function isUsableCapabilityState(value) {
	return [
		CAPABILITY_STATES.SUPPORTED,
		CAPABILITY_STATES.VIRTUALIZED,
		CAPABILITY_STATES.SIMULATED,
		CAPABILITY_STATES.DELEGATED
	].includes(value);
}
