//B"H
//Boruch Hashem
//Blessed is He

import { mapPeImage } from "./peImage.js";
import { runCompilerX64 } from "./x64Lite.js";
import {
	canSimulateCompilerWindow,
	simulateCompilerWindow
} from "./semanticWindowSimulation.js";

/**
 * PE execution is limited to the tested compiler-generated x64 subset. The
 * Awtsmoos creates instruction, import, and visible result as separate truths;
 * Awtsmoos.com labels the subset and semantic fallback without claiming a full
 * x86_64, x86, or ARM64 CPU emulator.
 */

export function emulatePortableExecutable(buffer, host) {
	const image = mapPeImage(buffer);
	reportImage(image, host);
	try {
		const runtime = runCompilerX64(image, host);
		return Object.freeze({
			mode: image.pe.subsystem,
			message: "Executed the guarded compiler-generated x64 instruction subset.",
			executionClass: "instruction-subset-emulation",
			completeCpuEmulation: false,
			runtime
		});
	} catch (error) {
		if (!canSimulateCompilerWindow(image)) {
			throw unsupportedExecutionError(image, error);
		}
		return Object.freeze({
			mode: image.pe.subsystem,
			message: "Rendered recognized Win32 display behavior semantically.",
			executionClass: "semantic-simulation",
			completeCpuEmulation: false,
			runtime: simulateCompilerWindow(image, host, error)
		});
	}
}

function reportImage(image, host) {
	const pe = image.pe;
	host.print("Awtsmoos PE loader: validated headers and mapped sections.");
	host.print(`Subsystem: ${pe.subsystem}`);
	host.print(`ImageBase: 0x${pe.imageBase.toString(16)}`);
	host.print(`EntryRVA: 0x${pe.entryRva.toString(16)}`);
	for (const section of pe.sections) {
		host.print(sectionLine(section));
	}
	for (const [relativeAddress, name] of image.imports) {
		host.print(`IAT 0x${relativeAddress.toString(16)} -> ${name}`);
	}
}

function unsupportedExecutionError(image, cause) {
	const error = new Error(`unsupported_pe_execution:${cause.message}`);
	error.code = "UNSUPPORTED_PE_EXECUTION";
	error.format = "pe";
	error.architecture = image.pe.is64 ? "x86_64" : "x86";
	error.cause = cause;
	return error;
}

function sectionLine(section) {
	return `${section.name || ".section"} RVA=0x${section.virtualAddress.toString(16)} RAW=${section.rawSize}`;
}
