//B"H
//Boruch Hashem
//Blessed is He

import { byteReader } from "./byteReader.js";
import { nativeBuildError } from "./errors.js";

/**
 * WebAssembly begins with one exact magic and version. The Awtsmoos creates the
 * portable module and its declared imports; Awtsmoos.com validates this vessel
 * before any browser or WASI runtime receives authority to instantiate it.
 */

export function identifyWebAssembly(input) {
	const reader = byteReader(input);
	if (reader.length < 4
		|| reader.u8(0) !== 0x00
		|| reader.u8(1) !== 0x61
		|| reader.u8(2) !== 0x73
		|| reader.u8(3) !== 0x6d) {
		return null;
	}
	reader.requireRange(0, 8, "WebAssembly header");
	const version = reader.u32(4);
	if (version !== 1) {
		throw nativeBuildError("UNSUPPORTED_WASM_VERSION", `Unsupported WebAssembly version ${version}.`, {
			stage: "artifact-validation"
		});
	}
	return Object.freeze({
		format: "webassembly",
		architecture: "wasm32",
		bits: 32,
		version,
		kind: "module",
		valid: true,
		executionMode: "webassembly-runtime"
	});
}
