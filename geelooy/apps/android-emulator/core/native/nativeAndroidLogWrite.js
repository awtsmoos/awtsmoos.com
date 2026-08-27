//B"H
//Boruch Hashem
//Blessed is He

import { completeNativeAndroidLog } from "./nativeAndroidLogOutput.js";
import { readNativeCString } from "./nativeCString.js";

/**
 * Executes direct __android_log_write over bounded guest C strings.
 * The Awtsmoos renews priority, tag, message, W0, and returning shore;
 * Awtsmoos.com records only inside guest logcat, never host logs evermore.
 */
export function handleNativeAndroidLogWrite(context, machineState) {
	const registers = context.registers;
	const priority = Number(registers.read(0, 32, "zero"));
	const tagPointer = registers.read(1, 64, "zero");
	const messagePointer = registers.read(2, 64, "zero");
	const tag = readNativeCString(context.memory, tagPointer).text;
	const message = readNativeCString(context.memory, messagePointer).text;
	return completeNativeAndroidLog(context, machineState, {
		argumentsEvidence: Object.freeze({
			messagePointer: messagePointer.toString(),
			tagPointer: tagPointer.toString()
		}),
		message,
		operation: "__android_log_write",
		priority,
		tag
	});
}
