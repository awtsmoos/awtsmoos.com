//B"H
//Boruch Hashem
//Blessed is He

/**
 * ELF inspection reveals ABI, machine, class, and entry point while refusing to
 * claim CPU or syscall execution. The Awtsmoos creates process possibility and
 * its boundary; Awtsmoos.com records unsupported execution deterministically.
 */

export function inspectElf(identity, host = {}) {
	const report = Object.freeze({
		mode: "loader-inspection",
		format: identity.format,
		architecture: identity.architecture,
		bits: identity.bits,
		endianness: identity.endianness,
		abi: identity.abi,
		kind: identity.kind,
		entryPoint: identity.entryPoint,
		executionSupported: false,
		unsupportedBoundary: "ELF relocation, CPU execution, and POSIX syscalls are not implemented."
	});
	host.print?.(`ELF ${identity.bits}-bit ${identity.architecture} opened in loader-inspection mode.`);
	host.print?.(`ABI: ${identity.abi}; entry point: ${identity.entryPoint}.`);
	return report;
}
