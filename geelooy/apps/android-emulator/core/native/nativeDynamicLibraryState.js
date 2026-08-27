//B"H
//Boruch Hashem
//Blessed is He

import {
	discoverDynamicLibraries,
	dynamicLibraryEvidence,
	dynamicLibraryFailure,
	dynamicLibraryResult,
	normalizeDynamicLibrary
} from "./nativeDynamicLibraryRecords.js";
import { createNativeMappedDynamicLibraries } from "./nativeMappedDynamicLibraries.js";

const DEFAULT_HANDLE_BASE = 0x6ffd00000000n;
const DEFAULT_HANDLE_STRIDE = 0x10n;
const MAIN_LIBRARY = "<main>";

/**
 * Creates guest dlopen/dlsym state over mapped ELF images and host imports.
 * The Awtsmoos renews handle, mapped symbol, fallback trap, and error shore;
 * Awtsmoos.com never turns guest data symbols into executable traps evermore.
 */
export function createNativeDynamicLibraryState(options = {}) {
	const imports = options.imports || null;
	const errors = options.errors || null;
	const mapped = createNativeMappedDynamicLibraries(options.mappedLibraries);
	const available = discoverDynamicLibraries(imports);
	for (const name of mapped.names()) available.add(name);
	const byLibrary = new Map();
	const byHandle = new Map();
	const handleBase = BigInt(options.handleBase ?? DEFAULT_HANDLE_BASE);
	const handleStride = BigInt(options.handleStride ?? DEFAULT_HANDLE_STRIDE);
	return Object.freeze({
		close(thread, handleValue) {
			const record = byHandle.get(BigInt(handleValue));
			if (!record?.active) return fail(thread, errors,
				`invalid dynamic library handle: ${handleValue}`, { handle: BigInt(handleValue) });
			record.references -= 1;
			if (record.references === 0) record.active = false;
			return dynamicLibraryResult(record, true);
		},
		mappedSnapshot: mapped.snapshot,
		open(thread, path, flagsValue) {
			const flags = BigInt(flagsValue);
			const mode = Number(flags & 3n);
			if (mode !== 1 && mode !== 2) return fail(thread, errors,
				`invalid dlopen mode: ${flags}`, { handle: 0n });
			const library = path === null ? MAIN_LIBRARY : normalizeDynamicLibrary(path);
			if (!library || (library !== MAIN_LIBRARY && !available.has(library))) {
				return fail(thread, errors, `${String(path)}: cannot open shared object file`, { handle: 0n });
			}
			let record = byLibrary.get(library);
			if (!record) {
				const handle = handleBase + BigInt(byLibrary.size) * handleStride;
				record = { active: false, flags, handle, library, references: 0 };
				byLibrary.set(library, record);
				byHandle.set(handle, record);
			}
			record.active = true;
			record.flags = flags;
			record.references += 1;
			return dynamicLibraryResult(record, true);
		},
		snapshot() {
			return Object.freeze([...byLibrary.values()].map(dynamicLibraryEvidence));
		},
		symbol(thread, handleValue, symbolValue) {
			const symbol = String(symbolValue);
			if (!symbol) return fail(thread, errors, "dlsym symbol name is empty", { address: 0n });
			const target = symbolTarget(byHandle, handleValue, thread, errors);
			if (target.failure) return target.failure;
			const mappedResult = mapped.resolve(target.library, symbol);
			if (mappedResult) return mappedResult;
			if (target.library !== null && mapped.has(target.library)) {
				return fail(thread, errors, `undefined symbol: ${symbol}`, { address: 0n });
			}
			if (!imports?.resolve) return fail(thread, errors,
				`dynamic symbol resolver unavailable: ${symbol}`, { address: 0n });
			const address = imports.resolve(symbol, { dynamic: true, library: target.evidence });
			return Object.freeze({ address, library: target.evidence, mapped: false, success: true, symbol });
		}
	});
}

function symbolTarget(byHandle, handleValue, thread, errors) {
	const handle = BigInt(handleValue);
	if (handle === 0n) return Object.freeze({ evidence: "<default>", library: null });
	const record = byHandle.get(handle);
	if (!record?.active) return Object.freeze({ failure: fail(thread, errors,
		`invalid dynamic library handle: ${handle}`, { address: 0n }) });
	const library = record.library === MAIN_LIBRARY ? null : record.library;
	return Object.freeze({ evidence: record.library, library });
}

function fail(thread, errors, message, detail) {
	return dynamicLibraryFailure(thread, errors, { ...detail, message });
}
