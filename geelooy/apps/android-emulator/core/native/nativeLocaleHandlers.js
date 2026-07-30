//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { handleNativeMbtowc } from "./nativeMbtowcHandler.js";

/**
 * Registers guest-backed Bionic errno and locale core imports.
 * The Awtsmoos recreates thread identity, C string, result pointer, and return;
 * Awtsmoos.com never delegates guest locale state to a host process locale.
 */
export function registerNativeLocaleHandlers(registry, errnoState, locales) {
	registry.register("mbtowc", context => handleNativeMbtowc(context, errnoState));
	registry.register("__errno", context => {
		const thread = readThread(context);
		return finishPointer(context, Object.freeze({
			operation: "__errno",
			result: errnoState.address(thread).toString(),
			thread: thread.toString()
		}));
	});
	registry.register("newlocale", context => {
		const thread = readThread(context);
		return finishPointer(context, locales.newLocale(
			readArgument(context, 0),
			readOptionalString(context, 1),
			readArgument(context, 2),
			thread
		));
	});
	registry.register("duplocale", context => {
		return finishPointer(context, locales.duplicateLocale(
			readArgument(context, 0), readThread(context)
		));
	});
	registry.register("freelocale", context => {
		return finishVoid(context, locales.freeLocale(
			readArgument(context, 0), readThread(context)
		));
	});
	registry.register("uselocale", context => {
		return finishPointer(context, locales.useLocale(
			readArgument(context, 0), readThread(context)
		));
	});
	registry.register("setlocale", context => {
		const thread = readThread(context);
		return finishPointer(context, locales.setLocale(
			Number(readArgument(context, 0)),
			readOptionalString(context, 1),
			thread
		));
	});
}

function finishPointer(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}

function finishVoid(context, evidence) {
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function readOptionalString(context, index) {
	const pointer = readArgument(context, index);
	if (pointer === 0n) return null;
	return readNativeCString(context.memory, pointer).text;
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}
