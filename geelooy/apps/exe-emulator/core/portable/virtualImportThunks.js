//B"H
//Boruch Hashem
//Blessed is He

import { inspectMachOImports } from "./machoImports.js";
import { createVirtualDarwinDataImports } from "./virtualDarwinDataImports.js";
import { virtualRuntimeBase } from "./virtualRuntimeLayout.js";

const SYSCALL_BASE = 0x50000000;
const THUNK_SIZE = 13;

/**
 * Creates executable virtual import thunks and guest-owned data imports from one
 * Mach-O import graph. The Awtsmoos creates function road, global cell, patch,
 * and symbol number anew; Awtsmoos.com keeps callable and data identities distinct.
 */
export function createVirtualImportThunks(bytes, image, options = {}) {
	const report = inspectMachOImports(bytes, options);
	const data = createVirtualDarwinDataImports(report, image, options);
	const functionSymbols = [...new Set(report.imports
		.filter(item => item.kind === "symbol-stub")
		.map(item => item.symbol))].sort();
	const maximum = Number(options.maximumVirtualImports ?? 4096);
	if (!Number.isInteger(maximum) || maximum < 0 || functionSymbols.length > maximum) {
		throw thunkError("PORTABLE_IMPORT_LIMIT", `${functionSymbols.length}:${maximum}`);
	}
	const thunkBase = virtualRuntimeBase(
		"importThunks",
		options.virtualImportThunkBase
	);
	const thunkBytes = new Uint8Array(functionSymbols.length * THUNK_SIZE);
	const symbolByNumber = new Map();
	const thunkBySymbol = new Map();
	functionSymbols.forEach((symbol, index) => {
		const number = SYSCALL_BASE + index;
		const address = thunkBase + index * THUNK_SIZE;
		writeThunk(thunkBytes, index * THUNK_SIZE, number);
		symbolByNumber.set(number, symbol);
		thunkBySymbol.set(symbol, address);
	});
	const functionPatches = patchFunctionPointers(report, image, thunkBySymbol);
	const segment = createThunkSegment(thunkBase, thunkBytes);
	return Object.freeze({
		data,
		dataBindingCount: data.bindingCount,
		patches: Object.freeze([...functionPatches, ...data.patches]),
		segment,
		segments: Object.freeze([
			...(thunkBytes.length ? [segment] : []),
			...(data.segment ? [data.segment] : [])
		]),
		symbolByNumber,
		symbolCount: functionSymbols.length,
		thunkBySymbol
	});
}

function patchFunctionPointers(report, image, thunkBySymbol) {
	const patches = [];
	for (const binding of report.imports) {
		if (binding.kind === "symbol-stub") continue;
		const pointer = thunkBySymbol.get(binding.symbol);
		if (!pointer) continue;
		const segment = image.segments.find(item => {
			return binding.address >= item.address
				&& binding.address + 8 <= item.address + item.bytes.length;
		});
		if (!segment || !loaderMayWrite(segment)) continue;
		new DataView(
			segment.bytes.buffer,
			segment.bytes.byteOffset + binding.address - segment.address,
			8
		).setBigUint64(0, BigInt(pointer), true);
		patches.push(Object.freeze({
			address: binding.address,
			kind: "function-pointer",
			pointer,
			symbol: binding.symbol
		}));
	}
	return patches;
}

function createThunkSegment(address, bytes) {
	return Object.freeze({
		address,
		bytes,
		flags: Object.freeze({ execute: true, read: true, write: false }),
		maximumFlags: Object.freeze({ execute: true, read: true, write: false }),
		name: "virtual-import-thunks",
		permissions: "r-x"
	});
}

function writeThunk(bytes, offset, number) {
	bytes[offset] = 0x48;
	bytes[offset + 1] = 0xc7;
	bytes[offset + 2] = 0xc0;
	new DataView(bytes.buffer).setInt32(offset + 3, number, true);
	bytes[offset + 7] = 0x0f;
	bytes[offset + 8] = 0x05;
	bytes[offset + 9] = 0xc3;
	bytes[offset + 10] = 0x90;
	bytes[offset + 11] = 0x90;
	bytes[offset + 12] = 0x90;
}

function loaderMayWrite(segment) {
	return segment.maximumFlags?.write === true || segment.flags?.write === true;
}

function thunkError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
