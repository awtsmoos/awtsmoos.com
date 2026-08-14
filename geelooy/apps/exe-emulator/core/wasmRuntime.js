//B"H
//Boruch Hashem
//Blessed is He

import { NativeBuildError } from "../../../shared/compiling/native/errors.js";
import { NATIVE_LIMITS } from "../../../shared/compiling/native/limits.js";
import { createWasmGuiEnvironment } from "./wasmGuiImports.js";

/**
 * Runs validated WebAssembly with an explicit bounded GUI and console ABI. The
 * Awtsmoos renews module, imported memory, executed call, and visible result;
 * Awtsmoos.com records every guest effect without pretending synchronous traps pause.
 */

export async function runWebAssemblyModule(bytes, options = {}) {
	const buffer = exactBuffer(bytes);
	if (!WebAssembly.validate(buffer)) {
		throw wasmError(
			"WASM_VALIDATION_FAILED",
			"WebAssembly validation failed."
		);
	}
	const module = await WebAssembly.compile(buffer);
	const imports = WebAssembly.Module.imports(module);
	assertSupportedImports(imports);
	const gui = createWasmGuiEnvironment(options);
	const importObject = mergeImports(options.importObject, gui.env);
	const instantiated = await WebAssembly.instantiate(module, importObject);
	const exports = instantiated.exports;
	validateMemories(exports, gui.memory);
	const entry = exports._start || exports.main;
	let returnValue;
	if (typeof entry === "function" && options.inspectOnly !== true) {
		returnValue = invokeEntry(entry, options);
	}
	return Object.freeze({
		exitCode: 0,
		exports: Object.freeze(WebAssembly.Module.exports(module)),
		format: "webassembly",
		gui: Object.freeze({ ...gui.evidence }),
		imports: Object.freeze(imports),
		mode: options.inspectOnly
			? "loader-inspection"
			: "webassembly-execution",
		returnValue,
		timeoutBoundary: "Synchronous WebAssembly requires Worker isolation for forcible timeout.",
		timeoutEnforced: false
	});
}

function assertSupportedImports(imports) {
	if (imports.some(item => item.module === "wasi_snapshot_preview1")) {
		throw wasmError(
			"WASI_IMPORTS_UNAVAILABLE",
			"WASI imports are not implemented in this browser runtime."
		);
	}
	for (const item of imports) {
		if (item.module !== "env") {
			throw wasmError(
				"WASM_IMPORT_MODULE_UNSUPPORTED",
				`${item.module}.${item.name}`
			);
		}
	}
}

function mergeImports(supplied = {}, env) {
	return Object.freeze({
		...supplied,
		env: Object.freeze({
			...(supplied.env || {}),
			...env
		})
	});
}

function validateMemories(exports, importedMemory) {
	const memories = [
		importedMemory,
		...Object.values(exports).filter(value => {
			return value instanceof WebAssembly.Memory;
		})
	];
	for (const memory of new Set(memories)) {
		const pages = memory.buffer.byteLength / 65_536;
		if (pages > NATIVE_LIMITS.wasmMemoryPages) {
			throw wasmError(
				"WASM_MEMORY_PAGE_LIMIT",
				`WebAssembly memory uses ${pages} pages.`
			);
		}
	}
}

function invokeEntry(entry, options) {
	try {
		return entry(...(options.arguments || []));
	} catch (error) {
		throw wasmError(
			"WASM_TRAP",
			error?.message || "WebAssembly trapped."
		);
	}
}

function wasmError(code, message) {
	return new NativeBuildError(code, message, {
		stage: "webassembly-runtime",
		target: "wasm32"
	});
}

function exactBuffer(bytes) {
	return bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength
	);
}
