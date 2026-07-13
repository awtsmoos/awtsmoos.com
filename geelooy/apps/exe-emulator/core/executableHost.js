//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { normalizeBytes } from "../../../shared/compiling/native/byteReader.js";
import { inspectUnknownBinary } from "./binaryInspector.js";
import { inspectElf } from "./elfLoader.js";
import { emulatePortableExecutable } from "./emulator.js";
import { inspectMachO } from "./machoLoader.js";
import { runWebAssemblyModule } from "./wasmRuntime.js";

/**
 * The executable host listens to bytes before extensions. The Awtsmoos creates
 * inner form, outer name, and runtime boundary together; Awtsmoos.com rejects
 * mismatches and keeps native, emulated, inspected, and simulated classes apart.
 */

export async function runExecutableArtifact(options = {}) {
	const bytes = normalizeBytes(options.bytes);
	const host = createHost(options.host);
	const identity = detectArtifactIdentity(bytes, {
		extension: options.extension,
		manifest: options.manifest
	});
	if (identity.format === "awtexe") {
		return runAwtexe(identity, options, host);
	}
	const result = await runDetected(identity, bytes, options, host);
	return Object.freeze({ identity, result });
}

async function runDetected(identity, bytes, options, host) {
	if (options.inspectOnly === true) {
		return inspectDetected(identity, bytes, host);
	}
	if (identity.format === "pe") {
		const result = emulatePortableExecutable(exactBuffer(bytes), host);
		return Object.freeze({
			...result,
			executionClass: result.runtime?.fallback
				? "semantic-simulation"
				: "instruction-subset-emulation",
			completeCpuEmulation: false
		});
	}
	if (["mach-o", "mach-o-fat"].includes(identity.format)) {
		return inspectMachO(identity, host);
	}
	if (identity.format === "elf") {
		return inspectElf(identity, host);
	}
	if (identity.format === "webassembly") {
		return runWebAssemblyModule(bytes, { ...options, host });
	}
	return inspectUnknownBinary(identity, bytes, host);
}

function inspectDetected(identity, bytes, host) {
	if (["mach-o", "mach-o-fat"].includes(identity.format)) {
		return inspectMachO(identity, host);
	}
	if (identity.format === "elf") {
		return inspectElf(identity, host);
	}
	return Object.freeze({
		...inspectUnknownBinary(identity, bytes, host),
		mode: "loader-inspection",
		detectedFormat: identity.format,
		detectedArchitecture: identity.architecture
	});
}

async function runAwtexe(identity, options, host) {
	const payloadIdentity = detectArtifactIdentity(identity.payloadBytes, {
		manifest: { format: expectedPayloadFormat(identity.manifest.entryKind) }
	});
	const payloadResult = await runDetected(payloadIdentity, identity.payloadBytes, options, host);
	return Object.freeze({
		identity,
		result: Object.freeze({
			mode: "awtsmoos-simulated-runtime",
			executionClass: "simulated-package",
			manifest: identity.manifest,
			payloadIdentity,
			payloadResult
		})
	});
}

function expectedPayloadFormat(entryKind) {
	if (entryKind === "pe") {
		return "pe";
	}
	if (entryKind === "wasm") {
		return "webassembly";
	}
	throw new Error(`unsupported_awtexe_entry_kind:${entryKind}`);
}

function createHost(host = {}) {
	return Object.freeze({
		print: typeof host.print === "function" ? host.print.bind(host) : () => {},
		openWindow: typeof host.openWindow === "function" ? host.openWindow.bind(host) : () => {},
		draw: typeof host.draw === "function" ? host.draw.bind(host) : undefined
	});
}

function exactBuffer(bytes) {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
