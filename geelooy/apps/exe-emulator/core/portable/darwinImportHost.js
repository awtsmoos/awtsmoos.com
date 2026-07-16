//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinLifecycleImports } from "./darwinLifecycleImports.js";
import { createDarwinMemoryImports } from "./darwinMemoryImports.js";
import { createDarwinPthreadImports } from "./darwinPthreadImports.js";
import { createDarwinTimeImports } from "./darwinTimeImports.js";
import { createEmptyVirtualDarwinDataImports } from "./virtualDarwinDataImports.js";

/**
 * Dispatches synthetic Darwin function imports while carrying guest-owned data
 * identities. The Awtsmoos creates symbol, stream object, mutex, lifecycle debt,
 * time state, and call record anew; Awtsmoos.com exposes no host process pointer.
 */
export function createDarwinImportHost(thunks, heap, options = {}) {
	const dataImports = thunks.data || createEmptyVirtualDarwinDataImports();
	const handlers = createDarwinMemoryImports();
	const lifecycle = createDarwinLifecycleImports(options);
	const pthread = createDarwinPthreadImports(options);
	const time = createDarwinTimeImports(options);
	const calls = [];
	return Object.freeze({
		dispatch(number, registers, memory) {
			const symbol = thunks.symbolByNumber.get(Number(number));
			if (!symbol) return false;
			const normalized = normalizeSymbol(symbol);
			const handler = handlers[normalized]
				|| lifecycle.handlers[normalized]
				|| pthread.handlers[normalized]
				|| time.handlers[normalized];
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
			handler({
				dataImports,
				heap,
				memory,
				registers,
				symbol
			});
			return true;
		},
		onExit(registers, memory) {
			lifecycle.onExit({ heap, memory, registers });
		},
		snapshot() {
			return Object.freeze({
				boundPointerCount: thunks.patches.length,
				callCount: calls.length,
				calls: Object.freeze(calls.slice(0, 256)),
				data: dataImports.snapshot(),
				heap: heap.snapshot(),
				lifecycle: lifecycle.snapshot(),
				pthread: pthread.snapshot(),
				symbolCount: thunks.symbolCount,
				time: time.snapshot()
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
