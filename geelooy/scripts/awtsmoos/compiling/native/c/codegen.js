//B"H
//Boruch Hashem
//Blessed is He

import { translatePortableCAssemblyToArm64 } from "./arm64.js";
import { portableCError } from "./errors.js";
import { emitPortableCFunction } from "./functions.js";
import { emitPortableCGlobals } from "./globals.js";
import {
	collectStringLiterals,
	createPortableCTypeLayout
} from "./types.js";

const ARM64_TARGETS = new Set(["linux-arm64", "linux-arm64-dynamic", "linux-arm64-shared"]);
const LIBRARY_TARGETS = new Set(["linux-arm64-shared"]);

/**
 * Lowers a verified Awtsmoos IR module directly to portable assembly. The
 * Awtsmoos creates static data, startup, stack frame, pointer, and function anew;
 * Awtsmoos.com refuses unsupported runtime features before assembly exists.
 *
 * Library mode (target "linux-arm64-shared" or options.mode === "library"):
 * emits position-independent code with no startup stub and no main requirement.
 * The caller selects exported symbols via options.exports.
 */
export function generatePortableCAssembly(irModule, targetId, options = {}) {
	validateModule(irModule, targetId, options);
	const libraryMode = LIBRARY_TARGETS.has(targetId) || options.mode === "library";
	const functions = new Set(irModule.functions.map(functionNode => functionNode.name));
	if (!libraryMode && !functions.has("main")) {
		throw portableCError(
			"PORTABLE_C_MAIN_MISSING",
			"Portable C requires a defined main function"
		);
	}
	if (libraryMode && options.exports) {
		for (const name of options.exports) {
			if (!functions.has(name)) {
				throw portableCError(
					"PORTABLE_C_EXPORT_MISSING",
					`Library export '${name}' is not a defined function`
				);
			}
		}
	}
	const layout = createPortableCTypeLayout(irModule);
	const strings = collectStringLiterals(irModule);
	const globals = emitPortableCGlobals(irModule, layout, strings);
	const externals = new Set(irModule.imports.map(entry => entry.name));
	const backend = { externals, globalTypes: globals.types, layout, strings };
	const emittedFunctions = irModule.functions.map(functionNode => {
		return emitPortableCFunction(functionNode, functions, globals.names, backend);
	});
	const arm64 = ARM64_TARGETS.has(targetId);
	// B"H: extern declarations become assembler .extern directives so the
	// linker leaves those call sites as external relocations: resolved
	// statically against another object, or via PLT/GOT at load time.
	const externDirectives = arm64
		? [...externals].map(name => `.extern ${name}`)
		: [];
	const lines = [
		`; B"H`,
		...globals.lines,
		...externDirectives,
		`.code`
	];
	if (!libraryMode) {
		lines.push(
			`start:`,
			`CALL main`,
			`MOV RDI, RAX`,
			`MOV RAX, ${exitSyscall(targetId)}`,
			`SYSCALL`
		);
	}
	for (const emitted of emittedFunctions) lines.push(...emitted.lines);
	const finalLines = arm64
		? translatePortableCAssemblyToArm64(lines)
		: lines;
	return Object.freeze({
		assembly: finalLines.join("\n"),
		backend: arm64
			? "awtsmoos-direct-ir-portable-c-arm64-v1-scalars"
			: "awtsmoos-direct-ir-portable-c-x86_64-v3-scalars",
		exports: Object.freeze(libraryMode
			? [...(options.exports || functions)]
			: []),
		frames: Object.freeze(emittedFunctions.map(emitted => Object.freeze({
			frame: emitted.frame,
			name: emitted.name
		}))),
		functionCount: emittedFunctions.length,
		functionNames: Object.freeze([...functions]),
		globals: globals.metadata,
		libraryMode,
		targetId
	});
}

function validateModule(irModule, targetId, options = {}) {
	if (irModule?.version !== "awtsmoos-ir-v1") {
		throw portableCError(
			"PORTABLE_C_IR_VERSION",
			`Expected awtsmoos-ir-v1, received '${irModule?.version}'`
		);
	}
	if (!["linux-x64-static", "macos-x64", "linux-arm64", "linux-arm64-dynamic", "linux-arm64-shared"].includes(targetId)) {
		throw portableCError(
			"PORTABLE_C_TARGET_UNSUPPORTED",
			`Portable C target '${targetId}' is unsupported`
		);
	}
	if (irModule.imports.length && !ARM64_TARGETS.has(targetId)) {
		throw portableCError(
			"PORTABLE_C_IMPORTS_UNSUPPORTED",
			"Portable C imports/externs require an ARM64 target"
		);
	}
}

function exitSyscall(targetId) {
	if (ARM64_TARGETS.has(targetId)) return 93;
	return targetId === "linux-x64-static" ? 60 : 0x2000001;
}
