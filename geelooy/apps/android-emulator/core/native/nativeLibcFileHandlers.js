//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { registerNativeDirectoryMutationHandlers } from "./nativeDirectoryMutationHandlers.js";
import { registerNativeFileAccessHandlers } from "./nativeFileAccessHandlers.js";
import { registerNativeFileLinkHandlers } from "./nativeFileLinkHandlers.js";
import { registerNativeFileOpenHandlers } from "./nativeFileOpenHandlers.js";
import { registerNativeFileStatHandlers } from "./nativeFileStatHandlers.js";
import { registerNativeLibcDirectoryHandlers } from "./nativeLibcDirectoryHandlers.js";

export {
	handleNativeClosedir,
	handleNativeFdopendir,
	handleNativeOpendir,
	handleNativeReaddir,
	handleNativeRewinddir
} from "./nativeLibcDirectoryHandlers.js";

/**
 * Registers libc FILE, directory, mutation, access, link, stat, and fd roads.
 * The Awtsmoos recreates path, stream, creation, metadata, and return anew;
 * Awtsmoos.com gives absent Android paths honest failure, never host substitutes.
 */
export function registerNativeLibcFileHandlers(registry, machineState, errnoState = null) {
	registerNativeLibcDirectoryHandlers(registry, machineState.nativeDirectoryStreams);
	registry.register("fopen", context => {
		return handleNativeFopen(context, machineState.nativeFileStreams);
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

function readArgument(context, index) {
	const pointer = context.registers.read(index, 64, "zero");
	return readNativeCString(context.memory, pointer).text;
}

function finishNativeCall(registers, result) {
	registers.write(0, result, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
}
