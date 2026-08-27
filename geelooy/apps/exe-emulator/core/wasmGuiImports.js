//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_LIMITS } from "../../../shared/compiling/native/limits.js";

/**
 * Reveals a bounded guest-memory GUI ABI for executed WebAssembly imports. The
 * Awtsmoos renews pointer, string, window, pixel, and text; Awtsmoos.com translates
 * only calls the guest truly executed, never names merely discovered in its bytes.
 */

const MAXIMUM_STRING_BYTES = 16 * 1024;

export function createWasmGuiEnvironment(options = {}) {
	const evidence = {
		drawCalls: 0,
		printCalls: 0,
		windowCalls: 0
	};
	const memory = suppliedMemory(options)
		|| new WebAssembly.Memory({
			initial: 1,
			maximum: Math.min(4, NATIVE_LIMITS.wasmMemoryPages)
		});
	return Object.freeze({
		env: Object.freeze({
			abort() {
				const error = new Error("WASM_ABORT");
				error.code = "WASM_ABORT";
				throw error;
			},
			awtsmoos_draw_pixel(x, y, color) {
				evidence.drawCalls += 1;
				options.host?.draw?.({
					color: rgbColor(color),
					type: "pixel",
					x,
					y
				});
			},
			awtsmoos_draw_text(pointer, x, y) {
				evidence.drawCalls += 1;
				options.host?.draw?.({
					text: readString(memory, pointer),
					type: "text",
					x,
					y
				});
			},
			awtsmoos_open_window(titlePointer, bodyPointer) {
				evidence.windowCalls += 1;
				options.host?.openWindow?.(
					readString(memory, titlePointer),
					readString(memory, bodyPointer)
				);
			},
			awtsmoos_print(value) {
				evidence.printCalls += 1;
				options.host?.print?.(String(value));
			},
			memory
		}),
		evidence,
		memory
	});
}

function suppliedMemory(options) {
	const candidate = options.importObject?.env?.memory;
	return candidate instanceof WebAssembly.Memory
		? candidate
		: null;
}

function readString(memory, pointer) {
	const offset = Number(pointer);
	const bytes = new Uint8Array(memory.buffer);
	if (!Number.isInteger(offset) || offset < 0 || offset >= bytes.length) {
		throw memoryError("WASM_STRING_POINTER_RANGE", offset);
	}
	let end = offset;
	const maximum = Math.min(bytes.length, offset + MAXIMUM_STRING_BYTES);
	while (end < maximum && bytes[end] !== 0) {
		end += 1;
	}
	if (end === maximum && bytes[end - 1] !== 0) {
		throw memoryError("WASM_STRING_TERMINATOR_MISSING", offset);
	}
	return new TextDecoder("utf-8", {
		fatal: true
	}).decode(bytes.subarray(offset, end));
}

function rgbColor(value) {
	const number = Number(value) >>> 0;
	return Object.freeze([
		((number >> 16) & 0xff) / 255,
		((number >> 8) & 0xff) / 255,
		(number & 0xff) / 255,
		1
	]);
}

function memoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
