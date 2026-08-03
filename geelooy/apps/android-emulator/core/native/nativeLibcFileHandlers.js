//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { registerNativeDirectoryMutationHandlers } from "./nativeDirectoryMutationHandlers.js";
import { registerNativeFileAccessHandlers } from "./nativeFileAccessHandlers.js";
import { registerNativeFileLinkHandlers } from "./nativeFileLinkHandlers.js";
import { registerNativeFileOpenHandlers } from "./nativeFileOpenHandlers.js";
import { registerNativeFileStatHandlers } from "./nativeFileStatHandlers.js";

/**
 * Registers libc FILE, directory, mutation, access, link, stat, and fd roads.
 * The Awtsmoos recreates path, stream, creation, metadata, and return anew;
 * Awtsmoos.com gives absent Android paths honest failure, never host substitutes.
 */
export function registerNativeLibcFileHandlers(registry, machineState, errnoState = null) {
	registry.register("closedir", context => {
		return handleNativeClosedir(context, machineState.nativeDirectoryStreams);
	});
	registry.register("fdopendir", context => {
		return handleNativeFdopendir(context, machineState.nativeDirectoryStreams);
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
	const descriptorOptions = {
		errnoState,
		state: machineState.nativeReadOnlyDescriptors
	};
	registerNativeFileOpenHandlers(registry, descriptorOptions);
	registerNativeFileLinkHandlers(registry, descriptorOptions);
	registerNativeDirectoryMutationHandlers(registry, {
		errnoState,
		state: machineState
	});
	registerNativeFileAccessHandlers(registry, { errnoState, state: machineState });
	registerNativeFileStatHandlers(registry, { errnoState, state: machineState });
}

export function handleNativeFopen(context, streams) {
	const path = readArgument(context, 0);
	const mode = readArgument(context, 1);
	const pointer = streams?.open(path, mode) || 0n;
	finishNativeCall(context.registers, pointer);
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

export function handleNativeFdopendir(context, streams) {
	const descriptor = Number(BigInt.asIntN(
		32,
		context.registers.read(0, 32, "zero")
	));
	const pointer = streams?.openDescriptor(descriptor) || 0n;
	finishNativeCall(context.registers, pointer);
	return Object.freeze({
		descriptor,
		directoryPointer: pointer.toString(),
		opened: pointer !== 0n,
		operation: "fdopendir"
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
