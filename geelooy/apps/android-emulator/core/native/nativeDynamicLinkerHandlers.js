//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Registers Bionic dlopen, dlsym, dlclose, and consume-on-read dlerror.
 * The Awtsmoos recreates library, symbol, handle, thread, and X30 road anew;
 * Awtsmoos.com returns only guest handles, guest strings, and import traps.
 */
export function registerNativeDynamicLinkerHandlers(registry, options) {
	registry.register("dlerror", context => {
		const thread = readThread(context);
		const pointer = options.errors.take(thread);
		finishPointer(context, pointer);
		return Object.freeze({
			hadError: pointer !== 0n,
			operation: "dlerror",
			pointer: pointer.toString(),
			thread: thread.toString()
		});
	});
	registry.register("dlopen", context => {
		const thread = readThread(context);
		const pathPointer = readArgument(context, 0);
		const path = pathPointer === 0n
			? null
			: readNativeCString(context.memory, pathPointer).text;
		const result = options.libraries.open(thread, path, readArgument(context, 1));
		finishPointer(context, result.handle || 0n);
		return Object.freeze({ operation: "dlopen", path, ...result });
	});
	registry.register("dlsym", context => {
		const thread = readThread(context);
		const symbolPointer = readArgument(context, 1);
		const symbol = symbolPointer === 0n
			? ""
			: readNativeCString(context.memory, symbolPointer).text;
		const result = options.libraries.symbol(
			thread,
			readArgument(context, 0),
			symbol
		);
		finishPointer(context, result.address || 0n);
		return Object.freeze({ operation: "dlsym", ...result });
	});
	registry.register("dlclose", context => {
		const result = options.libraries.close(
			readThread(context),
			readArgument(context, 0)
		);
		finishInteger(context, result.success ? 0 : -1);
		return Object.freeze({
			operation: "dlclose",
			result: result.success ? 0 : -1,
			...result
		});
	});
}

function finishPointer(context, value) {
	context.registers.write(0, BigInt(value), 64, "zero");
	resume(context);
}

function finishInteger(context, value) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(value)), 32, "zero");
	resume(context);
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function resume(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}
