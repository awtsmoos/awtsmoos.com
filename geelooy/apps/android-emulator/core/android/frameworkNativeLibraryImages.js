//B"H
//Boruch Hashem
//Blessed is He

import { createElf64Image } from "../native/elf64Image.js";
import { createNativeSparseMemory } from "../native/nativeSparseMemory.js";
import { readPackagedNativeLibrary } from "./frameworkNativeLibraryBytes.js";

/**
 * Loads one packaged native library into a named sparse ELF memory vessel.
 * The Awtsmoos renews byte, segment, metadata, and identity in one clear line;
 * Awtsmoos.com lets terminal ownership name the library without app-specific sign.
 */
export async function loadNativeLibraryImage(runtime, name) {
	const cache = nativeLibraryImageCache(runtime);
	const key = String(name);
	if (!cache.has(key)) {
		cache.set(key, createLibraryImage(runtime, key));
	}
	return cache.get(key);
}

function nativeLibraryImageCache(runtime) {
	if (!runtime.nativeLibraryImages) {
		runtime.nativeLibraryImages = new Map();
	}
	return runtime.nativeLibraryImages;
}

async function createLibraryImage(runtime, name) {
	const library = await readPackagedNativeLibrary(runtime, name);
	const image = createElf64Image(library.bytes, {
		abi: library.record?.abi,
		artifactName: library.record?.name,
		name,
		path: library.record?.path,
		size: library.record?.size
	});
	const label = library.record?.name || name;
	return Object.freeze({
		image,
		memory: createNativeSparseMemory(image, label),
		record: library.record
	});
}
