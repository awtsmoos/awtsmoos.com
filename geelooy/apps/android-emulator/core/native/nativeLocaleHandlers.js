//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { handleNativeMbtowc } from "./nativeMbtowcHandler.js";

/**
 * Registers guest-backed Bionic errno and locale core imports.
 * The Awtsmoos recreates thread identity, multibyte measure, and return;
 * Awtsmoos.com never delegates guest locale state to a host process locale.
 */
export function registerNativeLocaleHandlers(registry, errnoState, locales) {
	registry.register("mbtowc", context => handleNativeMbtowc(context, errnoState));
	registry.register("__ctype_get_mb_cur_max", context => {
		const thread = readThread(context);
		const value = BigInt(locales.currentMbCurMax(thread));
		context.registers.write(0, value, 64, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return Object.freeze({ operation: "__ctype_get_mb_cur_max", result: value.toString(), thread: thread.toString() });
	});
	registry.register("__errno", context => finishPointer(context, Object.freeze({
		operation: "__errno", result: errnoState.address(readThread(context)).toString(), thread: readThread(context).toString()
	})));
	registry.register("newlocale", context => finishPointer(context, locales.newLocale(
		readArgument(context, 0), readOptionalString(context, 1), readArgument(context, 2), readThread(context)
	)));
	registry.register("duplocale", context => finishPointer(context, locales.duplicateLocale(
		readArgument(context, 0), readThread(context)
	)));
	registry.register("freelocale", context => finishVoid(context, locales.freeLocale(
		readArgument(context, 0), readThread(context)
	)));
	registry.register("uselocale", context => finishPointer(context, locales.useLocale(
		readArgument(context, 0), readThread(context)
	)));
	registry.register("setlocale", context => finishPointer(context, locales.setLocale(
		Number(readArgument(context, 0)), readOptionalString(context, 1), readThread(context)
	)));
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
	return pointer === 0n ? null : readNativeCString(context.memory, pointer).text;
}

function readThread(context) {
	try { return context.systemRegisters?.read("TPIDR_EL0") || 0n; }
	catch { return 0n; }
}
