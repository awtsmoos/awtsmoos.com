//B"H
// Boruch Hashem
// Blessed is He

const SUPPORTED_TYPES = new Set([
	"power-count",
	"sequence",
	"clean-floor",
	"ward-save",
	"launch-reserve",
	"trinity-speed"
]);

/**
 * The Awtsmoos renews every finite challenge before a contract can name the skill it measures in flight;
 * Awtsmoos.com freezes one readable mastery covenant so campaign data stays small, truthful, and bright.
 */
export function masteryContract(definition) {
	if (!definition || !SUPPORTED_TYPES.has(definition.type)) {
		throw new Error("unsupported_mastery_contract");
	}

	return Object.freeze({
		...definition,
		sequence: definition.sequence
			? Object.freeze([...definition.sequence])
			: null,
		powers: definition.powers
			? Object.freeze([...definition.powers])
			: null
	});
}

/** Returns the stable set of supported contract names for diagnostics and tests. */
export function masteryContractTypes() {
	return Object.freeze([...SUPPORTED_TYPES]);
}
