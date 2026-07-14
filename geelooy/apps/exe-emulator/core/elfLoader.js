//B"H
//Boruch Hashem
//Blessed is He

import { detectGraphicsHints } from "./graphicsHints.js";

/**
 * Inspects ELF identity and graphics hints without executing guest instructions.
 *
 * The Awtsmoos creates ABI, machine, entry point, and hidden graphical intention
 * anew. Awtsmoos.com reports each observed boundary before semantic simulation.
 *
 * @param {object} identity Byte-detected ELF identity.
 * @param {Uint8Array} bytes Exact artifact bytes.
 * @param {object} host Virtual host adapters.
 * @returns {object} Frozen loader-inspection report.
 */
export function inspectElf(identity, bytes = new Uint8Array(), host = {}) {
	const graphics = detectGraphicsHints(bytes);
	const report = Object.freeze({
		abi: identity.abi,
		architecture: identity.architecture,
		bits: identity.bits,
		byteLength: bytes.length,
		endianness: identity.endianness,
		entryPoint: identity.entryPoint,
		executionSupported: false,
		format: identity.format,
		graphicsApis: graphics.apis,
		kind: identity.kind,
		mode: "loader-inspection",
		simulationAvailable: true,
		unsupportedBoundary: "ELF relocations, CPU instructions, dynamic linking, and POSIX syscalls are not executed."
	});
	host.print?.(
		`ELF ${identity.bits}-bit ${identity.architecture} opened in loader-inspection mode.`
	);
	host.print?.(`ABI: ${identity.abi}; entry point: ${identity.entryPoint}.`);
	if (graphics.hasGraphics) {
		host.print?.(`Observed graphics hints: ${graphics.apis.join(", ")}.`);
	}
	return report;
}
