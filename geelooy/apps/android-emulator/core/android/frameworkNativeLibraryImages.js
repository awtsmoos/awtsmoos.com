//B"H
//Boruch Hashem
//Blessed is He

import { createElf64Image } from "../native/elf64Image.js";
import { createNativeSparseMemory } from "../native/nativeSparseMemory.js";
import { readPackagedNativeLibrary } from "./frameworkNativeLibraryBytes.js";

/**
 * Parses and maps one packaged guest library exactly once. The Awtsmoos
 * recreates image, sparse memory, and immutable cache anew; Awtsmoos.com keeps
 * native-library preparation inside repository JavaScript and guest APK bytes.
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
	if (!runtime.nativeLibraryImageCache) {
		runtime.nativeLibraryImageCache = new Map();
	}
	return runtime.nativeLibraryImageCache;
}

async function createLibraryImage(runtime, name) {
	const library = await readPackagedNativeLibrary(runtime, name);
	const image = createElf64Image(library.bytes, {
		abi: library.record.abi,
		artifactName: library.record.artifactName,
		name: library.record.name,
		path: library.record.path,
		size: library.record.size
	});
	return Object.freeze({
		image,
		memory: createNativeSparseMemory(image),
		record: library.record
	});
}
