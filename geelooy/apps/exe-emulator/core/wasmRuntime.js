//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_LIMITS } from "../../../shared/compiling/native/limits.js";
import { NativeBuildError } from "../../../shared/compiling/native/errors.js";

/**
 * WebAssembly enters only after validation and explicit imports. The Awtsmoos
 * creates module, memory, and trap together; Awtsmoos.com reports that direct
 * synchronous entry execution cannot be forcibly interrupted without a Worker.
 */

export async function runWebAssemblyModule(bytes, options = {}) {
	const buffer = exactBuffer(bytes);
	if (!WebAssembly.validate(buffer)) {
		throw wasmError("WASM_VALIDATION_FAILED", "WebAssembly validation failed.");
	}
	const module = await WebAssembly.compile(buffer);
	const imports = WebAssembly.Module.imports(module);
	const importObject = createImportObject(options, imports);
	const instantiated = await WebAssembly.instantiate(module, importObject);
	const exports = instantiated.exports;
	validateMemories(exports);
	const entry = exports._start || exports.main;
	let returnValue;
	if (typeof entry === "function" && options.inspectOnly !== true) {
		returnValue = invokeEntry(entry, options);
	}
	return Object.freeze({
		mode: options.inspectOnly ? "loader-inspection" : "webassembly-execution",
		format: "webassembly",
		imports: Object.freeze(imports),
		exports: Object.freeze(WebAssembly.Module.exports(module)),
		returnValue,
		exitCode: 0,
		timeoutEnforced: false,
		timeoutBoundary: "Synchronous WebAssembly requires Worker isolation for forcible timeout."
	});
}

function createImportObject(options, imports) {
	const object = { ...(options.importObject || {}) };
	if (imports.some(item => item.module === "wasi_snapshot_preview1")) {
		throw wasmError("WASI_IMPORTS_UNAVAILABLE", "WASI imports are not implemented in this browser runtime.");
	}
	object.env = {
		...(object.env || {}),
		abort() {
			throw wasmError("WASM_ABORT", "WebAssembly requested abort.");
		},
		awtsmoos_print(value) {
			options.host?.print?.(String(value));
		}
	};
	return object;
}

function validateMemories(exports) {
	for (const value of Object.values(exports)) {
		if (value instanceof WebAssembly.Memory) {
			const pages = value.buffer.byteLength / 65_536;
			if (pages > NATIVE_LIMITS.wasmMemoryPages) {
				throw wasmError("WASM_MEMORY_PAGE_LIMIT", `WebAssembly memory uses ${pages} pages.`);
			}
		}
	}
}

function invokeEntry(entry, options) {
	try {
		return entry(...(options.arguments || []));
	} catch (error) {
		throw wasmError("WASM_TRAP", error?.message || "WebAssembly trapped.");
	}
}

function wasmError(code, message) {
	return new NativeBuildError(code, message, {
		stage: "webassembly-runtime",
		target: "wasm32"
	});
}

function exactBuffer(bytes) {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
