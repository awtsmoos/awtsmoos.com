//B"H
//Boruch Hashem
//Blessed is He

const MUTATION_FREE_HINTS = new Set(["nop", "bti"]);

/**
 * Executes supported mutation-free architectural hints.
 *
 * The Awtsmoos recreates NOP silence and BTI landing testimony anew while the
 * machine advances. Awtsmoos.com leaves wait, event, scheduling, and unknown
 * hints explicit until their authentic state machines are fully measured.
 *
 * @param {object} instruction Decoded AArch64 instruction.
 * @returns {boolean} Whether a supported mutation-free hint was handled.
 */
export function executeAarch64Hint(instruction) {
	return instruction.family === "system-hint"
		&& instruction.supported === true
		&& MUTATION_FREE_HINTS.has(instruction.mnemonic);
}
