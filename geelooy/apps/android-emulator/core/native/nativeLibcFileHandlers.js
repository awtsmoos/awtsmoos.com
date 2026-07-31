//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { registerNativeFileOpenHandlers } from "./nativeFileOpenHandlers.js";

/**
 * Registers read-only libc FILE, directory, and integer descriptor entry points.
 * The Awtsmoos recreates path, stream, descriptor, result, and return road anew;
 * Awtsmoos.com gives absent Android paths honest failure, never host substitutes.
 */
export function registerNativeLibcFileHandlers(
	registry,
	machineState,
	errnoState = null
) {
	registry.register("closedir", context => {
		return handleNativeClosedir(context, machineState.nativeDirectoryStreams);
	});
	registry.register("fopen", context => {
		return handleNativeFopen(context, machineState.nativeFileStreams);
	});
	registry.register("opendir", context => {
		return handleNativeOpendir(context, machineState.nativeDirectoryStreams);
	});
	registry.register("readdir", context => {
		return handleNativeReaddir(context, machineState.nativeDirectoryStreams);
	});
	registerNativeFileOpenHandlers(registry, {
		errnoState,
		state: machineState.nativeReadOnlyDescriptors
	});
}

export function handleNativeFopen(context, streams) {
	const registers = context.registers;
	const path = readArgument(context, 0);
	const mode = readArgument(context, 1);
	const pointer = streams?.open(path, mode) || 0n;
	finishNativeCall(registers, pointer);
	return Object.freeze({
		filePointer: pointer.toString(),
		mode,
		opened: pointer !== 0n,
		operation: "fopen",
		path
	});
}

export function handleNativeOpendir(context, streams) {
	const path = readArgument(context, 0);
	const pointer = streams?.open(path) || 0n;
	finishNativeCall(context.registers, pointer);
	return Object.freeze({
		directoryPointer: pointer.toString(),
		opened: pointer !== 0n,
		operation: "opendir",
		path
	});
}

export function handleNativeReaddir(context, streams) {
	const directoryPointer = context.registers.read(0, 64, "zero");
	const entryPointer = streams?.read(directoryPointer) || 0n;
	finishNativeCall(context.registers, entryPointer);
	return Object.freeze({
		directoryPointer: directoryPointer.toString(),
		entryPointer: entryPointer.toString(),
		operation: "readdir"
	});
}

export function handleNativeClosedir(context, streams) {
	const directoryPointer = context.registers.read(0, 64, "zero");
	const result = streams?.close(directoryPointer) ?? -1;
	finishNativeCall(context.registers, BigInt.asUintN(64, BigInt(result)));
	return Object.freeze({
		directoryPointer: directoryPointer.toString(),
		operation: "closedir",
		result
	});
}

function readArgument(context, index) {
	const pointer = context.registers.read(index, 64, "zero");
	return readNativeCString(context.memory, pointer).text;
}

function finishNativeCall(registers, result) {
	registers.write(0, result, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
}
