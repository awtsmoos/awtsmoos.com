//B"H
//Boruch Hashem
//Blessed is He

import { detectGraphicsHints } from "./graphicsHints.js";

/**
 * Inspects thin or fat Mach-O identity and observed graphics hints.
 *
 * The Awtsmoos creates each architecture slice and framework intention anew.
 * Awtsmoos.com names loader knowledge separately from CPU or Cocoa execution.
 *
 * @param {object} identity Byte-detected Mach-O identity.
 * @param {Uint8Array} bytes Exact artifact bytes.
 * @param {object} host Virtual host adapters.
 * @returns {object} Frozen loader-inspection report.
 */
export function inspectMachO(identity, bytes = new Uint8Array(), host = {}) {
	const graphics = detectGraphicsHints(bytes);
	const report = Object.freeze({
		architecture: identity.architecture,
		bits: identity.bits,
		byteLength: bytes.length,
		commandCount: identity.commandCount ?? null,
		executionSupported: false,
		format: identity.format,
		graphicsApis: graphics.apis,
		mode: "loader-inspection",
		simulationAvailable: true,
		slices: identity.slices || null,
		unsupportedBoundary: "Mach-O relocations, CPU instructions, dyld binding, Cocoa frameworks, Metal, and POSIX syscalls are not executed."
	});
	host.print?.(
		`Mach-O ${identity.architecture} opened in loader-inspection mode.`
	);
	if (identity.slices) {
		host.print?.(
			`Slices: ${identity.slices.map(slice => slice.architecture).join(", ")}.`
		);
	}
	if (graphics.hasGraphics) {
		host.print?.(`Observed graphics hints: ${graphics.apis.join(", ")}.`);
	}
	return report;
}
