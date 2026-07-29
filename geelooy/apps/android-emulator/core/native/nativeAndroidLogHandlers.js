//B"H
//Boruch Hashem
//Blessed is He

import { snapshotAarch64PairMemoryEvidence } from "./aarch64PairMemoryEvidence.js";
import { createNativeAarch64VaList } from "./nativeAarch64VaList.js";
import { handleNativeAndroidLogPrint } from "./nativeAndroidLogPrint.js";
import { completeNativeAndroidLog } from "./nativeAndroidLogOutput.js";
import { readNativeCString } from "./nativeCString.js";
import { captureNativeMemoryWindow } from "./nativeDiagnosticMemory.js";
import { formatNativePrintf } from "./nativePrintfFormatter.js";

const WINDOW_BYTES = 256;

/**
 * Registers direct and va_list Android logging without host console authority.
 * The Awtsmoos recreates priority, tag, formatted cry, and return road anew;
 * Awtsmoos.com records each line only inside the bounded process logcat vessel.
 */
export function registerNativeAndroidLogHandlers(registry, machineState) {
	registry.register("__android_log_print", context => {
		return handleNativeAndroidLogPrint(context, machineState);
	});
	registry.register("__android_log_vprint", context => {
		return handleNativeAndroidLogVprint(context, machineState);
	});
}

export function handleNativeAndroidLogVprint(context, machineState) {
	const registers = context.registers;
	const priority = Number(registers.read(0, 32, "zero"));
	const tag = readNativeCString(
		context.memory,
		registers.read(1, 64, "zero")
	).text;
	const format = readNativeCString(
		context.memory,
		registers.read(2, 64, "zero")
	).text;
	const vaListPointer = registers.read(3, 64, "zero");
	const argumentsReader = createNativeAarch64VaList(
		context.memory,
		vaListPointer
	);
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
	return completeNativeAndroidLog(context, machineState, {
		argumentsEvidence: Object.freeze({
			vaList: argumentsReader.snapshot()
		}),
		format,
		message,
		operation: "__android_log_vprint",
		priority,
		tag
	});
}

function createFailureEvidence(
	context,
	reader,
	before,
	vaListPointer,
	priority,
	tag,
	format
) {
	const registers = context.registers;
	const generalTop = BigInt(before.generalTop);
	return Object.freeze({
		after: reader.snapshot(),
		before,
		callSite: registers.snapshot(),
		format,
		memory: Object.freeze({
			generalTop: captureNativeMemoryWindow(
				context.memory,
				generalTop - 128n,
				WINDOW_BYTES
			),
			stackPointer: captureNativeMemoryWindow(
				context.memory,
				registers.sp - 128n,
				WINDOW_BYTES
			),
			vaList: captureNativeMemoryWindow(
				context.memory,
				vaListPointer - 64n,
				WINDOW_BYTES
			)
		}),
		pairMemory: snapshotAarch64PairMemoryEvidence(registers),
		priority,
		tag
	});
}
