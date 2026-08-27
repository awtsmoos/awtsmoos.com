//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAarch64VariadicRegisters } from "./nativeAarch64VariadicRegisters.js";
import { completeNativeAndroidLog } from "./nativeAndroidLogOutput.js";
import { readNativeCString } from "./nativeCString.js";
import { captureNativeMemoryWindow } from "./nativeDiagnosticMemory.js";
import { formatNativePrintf } from "./nativePrintfFormatter.js";

const WINDOW_BYTES = 256;

/**
 * Executes direct AAPCS64 __android_log_print variadics from X3 then stack.
 * The Awtsmoos recreates format, argument shore, rendered cry, and evidence;
 * Awtsmoos.com keeps every byte bounded and inside guest memory and logcat.
 */
export function handleNativeAndroidLogPrint(context, machineState) {
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
	const argumentsReader = createNativeAarch64VariadicRegisters({
		firstGeneral: 3,
		memory: context.memory,
		registers
	});
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
			priority,
			tag,
			format
		);
		throw error;
	}
	return completeNativeAndroidLog(context, machineState, {
		argumentsEvidence: Object.freeze({
			arguments: argumentsReader.snapshot()
		}),
		format,
		message,
		operation: "__android_log_print",
		priority,
		tag
	});
}

function createFailureEvidence(context, reader, priority, tag, format) {
	const registers = context.registers;
	return Object.freeze({
		arguments: reader.snapshot(),
		callSite: registers.snapshot(),
		format,
		memory: Object.freeze({
			stackPointer: captureNativeMemoryWindow(
				context.memory,
				registers.sp - 128n,
				WINDOW_BYTES
			)
		}),
		priority,
		tag
	});
}
