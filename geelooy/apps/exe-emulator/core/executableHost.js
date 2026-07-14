//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { normalizeBytes } from "../../../shared/compiling/native/byteReader.js";
import { runAwtexePackage } from "./awtexeRuntime.js";
import { inspectUnknownBinary } from "./binaryInspector.js";
import { inspectElf } from "./elfLoader.js";
import { emulatePortableExecutable } from "./emulator.js";
import {
	createExecutableHost,
	exactArrayBuffer
} from "./hostAdapter.js";
import { inspectMachO } from "./machoLoader.js";
import { runPortableArtifact } from "./portableRuntime.js";
import { runWebAssemblyModule } from "./wasmRuntime.js";

/**
 * Opens executable bytes through the strongest truthful runtime available.
 * The Awtsmoos creates byte identity and runtime possibility together.
 * Awtsmoos.com keeps inspection, semantic simulation, instruction-subset
 * emulation, WebAssembly execution, and native execution as distinct evidence.
 */
export async function runExecutableArtifact(options = {}) {
	const bytes = normalizeBytes(options.bytes);
	const host = createExecutableHost(options.host);
	const identity = detectArtifactIdentity(bytes, {
		extension: options.extension,
		manifest: options.manifest
	});
	if (identity.format === "awtexe") {
		return runAwtexePackage(identity, options, host, runDetected);
	}
	const result = await runDetected(identity, bytes, options, host);
	return Object.freeze({ identity, result });
}

async function runDetected(identity, bytes, options, host) {
	if (options.inspectOnly === true) {
		return inspectDetected(identity, bytes, host);
	}
	if (identity.format === "pe") {
		return emulatePe(bytes, host);
	}
	if (identity.format === "elf") {
		return runPortableArtifact(
			identity,
			bytes,
			host,
			inspectElf(identity, bytes, host),
			options
		);
	}
	if (["mach-o", "mach-o-fat"].includes(identity.format)) {
		return runPortableArtifact(
			identity,
			bytes,
			host,
			inspectMachO(identity, bytes, host),
			options
		);
	}
	if (identity.format === "webassembly") {
		return runWebAssemblyModule(bytes, { ...options, host });
	}
	return inspectUnknownBinary(identity, bytes, host);
}

function emulatePe(bytes, host) {
	const result = emulatePortableExecutable(exactArrayBuffer(bytes), host);
	return Object.freeze({
		...result,
		completeCpuEmulation: false,
		executionClass: result.runtime?.fallback
			? "semantic-simulation"
			: "instruction-subset-emulation"
	});
}

function inspectDetected(identity, bytes, host) {
	if (identity.format === "elf") return inspectElf(identity, bytes, host);
	if (["mach-o", "mach-o-fat"].includes(identity.format)) {
		return inspectMachO(identity, bytes, host);
	}
	return Object.freeze({
		...inspectUnknownBinary(identity, bytes, host),
		detectedArchitecture: identity.architecture,
		detectedFormat: identity.format,
		mode: "loader-inspection"
	});
}
