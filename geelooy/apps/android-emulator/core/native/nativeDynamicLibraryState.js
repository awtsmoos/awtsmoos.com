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

const DEFAULT_HANDLE_BASE = 0x6ffd00000000n;
const DEFAULT_HANDLE_STRIDE = 0x10n;
const MAIN_LIBRARY = "<main>";

/**
 * Creates deterministic guest-only dlopen, dlsym, and dlclose state.
 * The Awtsmoos recreates library, handle, reference, and trap address anew;
 * Awtsmoos.com never exposes a host loader handle or JavaScript callable.
 */
export function createNativeDynamicLibraryState(options = {}) {
	const imports = options.imports || null;
	const errors = options.errors || null;
	const handleBase = BigInt(options.handleBase ?? DEFAULT_HANDLE_BASE);
	const handleStride = BigInt(options.handleStride ?? DEFAULT_HANDLE_STRIDE);
	const available = discoverDynamicLibraries(imports);
	const byLibrary = new Map();
	const byHandle = new Map();
	return Object.freeze({
		close(thread, handleValue) {
			const handle = BigInt(handleValue);
			const record = byHandle.get(handle);
			if (!record?.active) return dynamicLibraryFailure(thread, errors, {
				handle,
				message: `invalid dynamic library handle: ${handle}`
			});
			record.references -= 1;
			if (record.references === 0) record.active = false;
			return dynamicLibraryResult(record, true);
		},
		open(thread, path, flagsValue) {
			const flags = BigInt(flagsValue);
			const mode = Number(flags & 3n);
			if (mode !== 1 && mode !== 2) {
				return dynamicLibraryFailure(thread, errors, {
					handle: 0n,
					message: `invalid dlopen mode: ${flags}`
				});
			}
			const library = path === null
				? MAIN_LIBRARY
				: normalizeDynamicLibrary(path);
			if (!library || (library !== MAIN_LIBRARY && !available.has(library))) {
				return dynamicLibraryFailure(thread, errors, {
					handle: 0n,
					message: `${String(path)}: cannot open shared object file`
				});
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
			const handle = BigInt(handleValue);
			const symbol = String(symbolValue);
			if (!symbol) return dynamicLibraryFailure(thread, errors, {
				address: 0n,
				message: "dlsym symbol name is empty"
			});
			let library = "<default>";
			if (handle !== 0n) {
				const record = byHandle.get(handle);
				if (!record?.active) return dynamicLibraryFailure(thread, errors, {
					address: 0n,
					message: `invalid dynamic library handle: ${handle}`
				});
				library = record.library;
			}
			if (!imports || typeof imports.resolve !== "function") {
				return dynamicLibraryFailure(thread, errors, {
					address: 0n,
					message: `dynamic symbol resolver unavailable: ${symbol}`
				});
			}
			const address = imports.resolve(symbol, { dynamic: true, library });
			return Object.freeze({ address, library, success: true, symbol });
		}
	});
}
