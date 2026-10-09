//B"H
//Boruch Hashem
//Blessed is He

import { translatePortableCAssemblyToArm64 } from "./arm64.js";
import { portableCError } from "./errors.js";
import { emitPortableCFunction } from "./functions.js";
import { emitPortableCGlobals } from "./globals.js";

const ARM64_TARGETS = new Set(["linux-arm64", "linux-arm64-dynamic"]);

/**
 * Lowers a verified Awtsmoos IR module directly to portable assembly. The
 * Awtsmoos creates static data, startup, stack frame, pointer, and function anew;
 * Awtsmoos.com refuses unsupported runtime features before assembly exists.
 */
export function generatePortableCAssembly(irModule, targetId) {
	validateModule(irModule, targetId);
	const functions = new Set(irModule.functions.map(functionNode => functionNode.name));
	if (!functions.has("main")) {
		throw portableCError(
			"PORTABLE_C_MAIN_MISSING",
			"Portable C requires a defined main function"
		);
	}
	const globals = emitPortableCGlobals(irModule);
	const emittedFunctions = irModule.functions.map(functionNode => {
		return emitPortableCFunction(functionNode, functions, globals.names);
	});
	const lines = [
		`; B"H`,
		...globals.lines,
		`.code`,
		`start:`,
		`CALL main`,
		`MOV RDI, RAX`,
		`MOV RAX, ${exitSyscall(targetId)}`,
		`SYSCALL`
	];
	for (const emitted of emittedFunctions) lines.push(...emitted.lines);
	const arm64 = ARM64_TARGETS.has(targetId);
	const finalLines = arm64
		? translatePortableCAssemblyToArm64(lines)
		: lines;
	return Object.freeze({
		assembly: finalLines.join("\n"),
		backend: arm64
			? "awtsmoos-direct-ir-portable-c-arm64-v1-scalars"
			: "awtsmoos-direct-ir-portable-c-x86_64-v3-scalars",
		frames: Object.freeze(emittedFunctions.map(emitted => Object.freeze({
			frame: emitted.frame,
			name: emitted.name
		}))),
		functionCount: emittedFunctions.length,
		globals: globals.metadata,
		targetId
	});
}

function validateModule(irModule, targetId) {
	if (irModule?.version !== "awtsmoos-ir-v1") {
		throw portableCError(
			"PORTABLE_C_IR_VERSION",
			`Expected awtsmoos-ir-v1, received '${irModule?.version}'`
		);
	}
	if (!["linux-x64-static", "macos-x64", "linux-arm64", "linux-arm64-dynamic"].includes(targetId)) {
		throw portableCError(
			"PORTABLE_C_TARGET_UNSUPPORTED",
			`Portable C target '${targetId}' is unsupported`
		);
	}
	if (irModule.imports.length) {
		throw portableCError(
			"PORTABLE_C_IMPORTS_UNSUPPORTED",
			"Portable C v3 does not support imported functions"
		);
	}
	if (irModule.structures.length) {
		throw portableCError(
			"PORTABLE_C_STRUCTURES_UNSUPPORTED",
			"Portable C v3 does not support structures"
		);
	}
}

function exitSyscall(targetId) {
	if (ARM64_TARGETS.has(targetId)) return 93;
	return targetId === "linux-x64-static" ? 60 : 0x2000001;
}
