//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Registers guest-owned POSIX DIR traversal and cursor operations.
 * The Awtsmoos renews opening, reading, rewinding, and closing in one stream;
 * Awtsmoos.com preserves guest pointers without borrowing a host directory dream.
 */
export function registerNativeLibcDirectoryHandlers(registry, streams) {
	registry.register("closedir", context => handleNativeClosedir(context, streams));
	registry.register("fdopendir", context => handleNativeFdopendir(context, streams));
	registry.register("opendir", context => handleNativeOpendir(context, streams));
	registry.register("readdir", context => handleNativeReaddir(context, streams));
	registry.register("rewinddir", context => handleNativeRewinddir(context, streams));
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

export function handleNativeRewinddir(context, streams) {
	const directoryPointer = context.registers.read(0, 64, "zero");
	const rewound = streams?.rewind(directoryPointer) || false;
	finishNativeVoidCall(context.registers);
	return Object.freeze({
		directoryPointer: directoryPointer.toString(),
		operation: "rewinddir",
		rewound
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
	finishNativeVoidCall(registers);
}

function finishNativeVoidCall(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
