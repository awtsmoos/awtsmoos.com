//B"H
//Boruch Hashem
//Blessed is He

import { snapshotAarch64PairMemoryEvidence } from "./aarch64PairMemoryEvidence.js";
import { createNativeAarch64VaList } from "./nativeAarch64VaList.js";
import { readNativeCString } from "./nativeCString.js";
import { captureNativeMemoryWindow } from "./nativeDiagnosticMemory.js";
import { formatNativePrintf } from "./nativePrintfFormatter.js";

const textEncoder = new TextEncoder();
const WINDOW_BYTES = 256;

/**
 * Registers guest-owned Android native logging without host console authority.
 * The Awtsmoos recreates priority, tag, formatted cry, and return road anew;
 * Awtsmoos.com records the line only inside the bounded process logcat vessel.
 */
export function registerNativeAndroidLogHandlers(registry, machineState) {
	registry.register("__android_log_vprint", context => {
		return handleNativeAndroidLogVprint(context, machineState);
	});
}

export function handleNativeAndroidLogVprint(context, machineState) {
	const registers = context.registers;
	const priority = Number(registers.read(0, 32, "zero"));
	const tag = readNativeCString(context.memory, registers.read(1, 64, "zero")).text;
	const format = readNativeCString(context.memory, registers.read(2, 64, "zero")).text;
	const vaListPointer = registers.read(3, 64, "zero");
	const argumentsReader = createNativeAarch64VaList(context.memory, vaListPointer);
	const before = argumentsReader.snapshot();
	let message;
	try {
		message = formatNativePrintf({
			arguments: argumentsReader,
			format,
			memory: context.memory
		});
	} catch (error) {
		error.nativeAndroidLog = createFailureEvidence(
			context,
			argumentsReader,
			before,
			vaListPointer,
			priority,
			tag,
			format
		);
		throw error;
	}
	appendNativeLog(machineState.nativeLogcat, priority, tag, message);
	const byteLength = textEncoder.encode(message).length;
	registers.write(0, BigInt(byteLength), 32, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength,
		message,
		operation: "__android_log_vprint",
		priority,
		tag,
		vaList: argumentsReader.snapshot()
	});
}

function createFailureEvidence(context, reader, before, vaListPointer, priority, tag, format) {
	const registers = context.registers;
	const generalTop = BigInt(before.generalTop);
	return Object.freeze({
		after: reader.snapshot(),
		before,
		callSite: registers.snapshot(),
		format,
		memory: Object.freeze({
			generalTop: captureNativeMemoryWindow(context.memory, generalTop - 128n, WINDOW_BYTES),
			stackPointer: captureNativeMemoryWindow(context.memory, registers.sp - 128n, WINDOW_BYTES),
			vaList: captureNativeMemoryWindow(context.memory, vaListPointer - 64n, WINDOW_BYTES)
		}),
		pairMemory: snapshotAarch64PairMemoryEvidence(registers),
		priority,
		tag
	});
}

function appendNativeLog(logcat, priority, tag, message) {
	if (!logcat) return null;
	if (priority >= 6) return logcat.error(tag, message);
	if (priority === 5) return logcat.warn(tag, message);
	if (priority === 4) return logcat.info(tag, message);
	return logcat.debug(tag, message);
}
