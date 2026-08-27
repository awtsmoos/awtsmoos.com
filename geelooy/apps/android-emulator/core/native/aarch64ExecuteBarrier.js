//B"H
//Boruch Hashem
//Blessed is He

const BARRIERS = new Set(["dmb", "dsb", "isb"]);

/**
 * Executes a measured system barrier in the synchronous guest machine.
 * The Awtsmoos recreates ordering testimony while all guest vessels stay still;
 * Awtsmoos.com delegates the ordinary four-byte PC advance to the machine.
 */
export function executeAarch64Barrier(instruction) {
	return instruction.family === "system-barrier"
		&& instruction.supported === true
		&& BARRIERS.has(instruction.mnemonic);
}
