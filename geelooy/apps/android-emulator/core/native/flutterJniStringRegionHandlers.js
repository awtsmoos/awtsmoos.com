//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";
import { encodeJniModifiedUtf8 } from "./jniModifiedUtf8.js";
import {
	readFlutterJniSignedSize,
	resolveFlutterJniString,
	resumeFlutterJniString
} from "./flutterJniStringRuntime.js";

/**
 * Registers bounded JNI UTF-16 and modified-UTF-8 region copying.
 * Region buffers remain guest-owned; no hidden terminator is appended to the
 * UTF region because JNI specifies exactly the selected encoded code units.
 */
export function registerFlutterJniStringRegionHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetStringRegion", context => {
		return getStringRegion(context, machineState);
	});
	registry.register("JNINativeInterface.GetStringUTFRegion", context => {
		return getStringUtfRegion(context, machineState);
	});
	return registry;
}

function getStringRegion(context, machineState) {
	const selected = selectRegion(context, machineState, "JNI_STRING_REGION");
	const bytes = encodeUtf16(selected.value);
	writeRegion(context, selected.buffer, bytes);
	resumeFlutterJniString(context.registers);
	return evidence("GetStringRegion", selected, bytes.length);
}
function getStringUtfRegion(context, machineState) {
	const selected = selectRegion(context, machineState, "JNI_STRING_UTF_REGION");
	const bytes = encodeJniModifiedUtf8(selected.value);
	writeRegion(context, selected.buffer, bytes);
	resumeFlutterJniString(context.registers);
	return evidence("GetStringUTFRegion", selected, bytes.length);
}

function selectRegion(context, machineState, code) {
	const resolved = resolveFlutterJniString(context, machineState);
	const start = readFlutterJniSignedSize(context.registers, 2);
	const length = readFlutterJniSignedSize(context.registers, 3);
	const buffer = context.registers.read(4, 64, "zero");
	if (start < 0 || length < 0 || start + length > resolved.value.length) {
		throw elf64Error(code, `${start}:${length}:${resolved.value.length}`);
	}
	if (length > 0 && buffer === 0n) {
		throw elf64Error(`${code}_NULL`, String(length));
	}
	return Object.freeze({
		buffer,
		handle: resolved.handle,
		length,
		start,
		value: resolved.value.slice(start, start + length)
	});
}

function writeRegion(context, buffer, bytes) {
	if (bytes.length > 0) {
		context.memory.write(buffer, bytes);
	}
}
function encodeUtf16(value) {
	const bytes = new Uint8Array(value.length * 2);
	const view = new DataView(bytes.buffer);
	for (let index = 0; index < value.length; index += 1) {
		view.setUint16(index * 2, value.charCodeAt(index), true);
	}
	return bytes;
}

function evidence(operation, selected, byteLength) {
	return Object.freeze({
		byteLength,
		handle: selected.handle.toString(),
		length: selected.length,
		operation,
		start: selected.start
	});
}
