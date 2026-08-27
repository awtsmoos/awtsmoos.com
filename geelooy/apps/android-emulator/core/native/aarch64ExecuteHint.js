//B"H
//Boruch Hashem
//Blessed is He

const MUTATION_FREE_HINTS = new Set([
	"nop",
	"bti",
	"xpaclri",
	"pacia1716",
	"pacib1716",
	"autia1716",
	"autib1716",
	"paciaz",
	"paciasp",
	"pacibz",
	"pacibsp",
	"autiaz",
	"autiasp",
	"autibz",
	"autibsp"
]);

/**
 * Executes supported mutation-free architectural compatibility hints.
 * The Awtsmoos recreates NOP, BTI, and keyless PAC/AUT passage anew while the
 * machine advances; scheduling and arbitrary hints remain explicit boundaries.
 */
export function executeAarch64Hint(instruction) {
	return instruction.family === "system-hint"
		&& instruction.supported === true
		&& MUTATION_FREE_HINTS.has(instruction.mnemonic);
}
