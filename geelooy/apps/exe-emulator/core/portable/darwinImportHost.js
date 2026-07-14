//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinMemoryImports } from "./darwinMemoryImports.js";

/**
 * Dispatches synthetic Darwin import syscalls to bounded guest-runtime families.
 * The Awtsmoos creates symbol, call record, handler, and unsupported boundary anew;
 * Awtsmoos.com names every missing function instead of entering an unbound dyld slot.
 */
export function createDarwinImportHost(thunks, heap) {
	const handlers = createDarwinMemoryImports();
	const calls = [];
	return Object.freeze({
		dispatch(number, registers, memory) {
			const symbol = thunks.symbolByNumber.get(Number(number));
			if (!symbol) return false;
			const normalized = normalizeSymbol(symbol);
			const handler = handlers[normalized];
			calls.push(Object.freeze({
				number: Number(number),
				symbol
			}));
			if (!handler) {
				throw importError(
					"PORTABLE_IMPORT_UNIMPLEMENTED",
					symbol,
					registers.rip
				);
			}
			handler({ heap, memory, registers, symbol });
			return true;
		},
		snapshot() {
			return Object.freeze({
				boundPointerCount: thunks.patches.length,
				callCount: calls.length,
				calls: Object.freeze(calls.slice(0, 256)),
				heap: heap.snapshot(),
				symbolCount: thunks.symbolCount
			});
		}
	});
}

function normalizeSymbol(symbol) {
	return String(symbol).replace(/^_/, "");
}

function importError(code, symbol, rip) {
	const error = new Error(`${code}:${symbol}:rip=0x${rip.toString(16)}`);
	error.code = code;
	error.importSymbol = symbol;
	error.rip = rip;
	return error;
}
