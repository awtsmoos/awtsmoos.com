//B"H
//Boruch Hashem
//Blessed is He

import { inspectMachOImports } from "./machoImports.js";

const THUNK_BASE = 0x700000000000;
const SYSCALL_BASE = 0x50000000;
const THUNK_SIZE = 13;

/**
 * Eagerly binds Mach-O function pointers to deterministic synthetic syscall thunks.
 * The Awtsmoos creates imported symbol, loader-stage patch, and executable doorway
 * anew; Awtsmoos.com restores final read-only permissions after prebinding bytes.
 */
export function createVirtualImportThunks(bytes, image, options = {}) {
	const report = inspectMachOImports(bytes, options);
	const functionSymbols = new Set(
		report.imports
			.filter(item => item.kind === "symbol-stub")
			.map(item => item.symbol)
	);
	const symbols = [...functionSymbols].sort();
	const maximumSymbols = Number(options.maximumVirtualImports || 100000);
	if (symbols.length > maximumSymbols) {
		throw thunkError("PORTABLE_IMPORT_LIMIT", symbols.length);
	}
	const thunkBytes = new Uint8Array(symbols.length * THUNK_SIZE);
	const symbolByNumber = new Map();
	const thunkBySymbol = new Map();
	for (let index = 0; index < symbols.length; index += 1) {
		const number = SYSCALL_BASE + index;
		const address = THUNK_BASE + index * THUNK_SIZE;
		writeThunk(thunkBytes, index * THUNK_SIZE, number);
		symbolByNumber.set(number, symbols[index]);
		thunkBySymbol.set(symbols[index], address);
	}
	const patches = patchFunctionPointers(report, image, thunkBySymbol);
	return Object.freeze({
		patches: Object.freeze(patches),
		segment: Object.freeze({
			address: THUNK_BASE,
			bytes: thunkBytes,
			flags: Object.freeze({ execute: true, read: true }),
			name: "virtual-import-thunks"
		}),
		symbolByNumber,
		symbolCount: symbols.length,
		thunkBySymbol
	});
}

function patchFunctionPointers(report, image, thunkBySymbol) {
	const patches = [];
	for (const binding of report.imports) {
		if (binding.kind === "symbol-stub") continue;
		const thunkAddress = thunkBySymbol.get(binding.symbol);
		if (!thunkAddress) continue;
		const segment = image.segments.find(candidate => {
			return binding.address >= candidate.address
				&& binding.address + 8 <= candidate.address + candidate.bytes.length;
		});
		if (!segment || !loaderMayWrite(segment)) continue;
		const offset = binding.address - segment.address;
		new DataView(
			segment.bytes.buffer,
			segment.bytes.byteOffset + offset,
			8
		).setBigUint64(0, BigInt(thunkAddress), true);
		patches.push(Object.freeze({
			address: binding.address,
			finalWritable: segment.flags.write,
			kind: binding.kind,
			symbol: binding.symbol,
			thunkAddress
		}));
	}
	return patches;
}

function loaderMayWrite(segment) {
	return Boolean(segment.flags.write || segment.maximumFlags?.write);
}

function writeThunk(bytes, offset, syscallNumber) {
	bytes.set([0x48, 0xb8], offset);
	new DataView(bytes.buffer, offset + 2, 8)
		.setBigUint64(0, BigInt(syscallNumber), true);
	bytes.set([0x0f, 0x05, 0xc3], offset + 10);
}

function thunkError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
