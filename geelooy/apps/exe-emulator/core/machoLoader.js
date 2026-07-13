//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mach-O inspection reveals architecture and slice boundaries without claiming
 * an instruction engine that does not exist. The Awtsmoos creates the mapped
 * form and the honest boundary; Awtsmoos.com names this loader inspection only.
 */

export function inspectMachO(identity, host = {}) {
	const report = Object.freeze({
		mode: "loader-inspection",
		format: identity.format,
		architecture: identity.architecture,
		bits: identity.bits,
		slices: identity.slices || null,
		commandCount: identity.commandCount ?? null,
		executionSupported: false,
		unsupportedBoundary: "Mach-O CPU execution and relocation processing are not implemented."
	});
	host.print?.(`Mach-O ${identity.architecture} opened in loader-inspection mode.`);
	if (identity.slices) {
		host.print?.(`Slices: ${identity.slices.map(slice => slice.architecture).join(", ")}.`);
	}
	return report;
}
