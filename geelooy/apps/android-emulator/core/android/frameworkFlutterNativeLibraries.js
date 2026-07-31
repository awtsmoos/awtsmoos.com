//B"H
//Boruch Hashem
//Blessed is He

import { createNativeBiasedMemory } from "../native/nativeBiasedMemory.js";
import { createNativeCompositeMemory } from "../native/nativeCompositeMemory.js";
import { relocateNativeImage } from "../native/nativeRelocator.js";
import { loadNativeLibraryImage } from "./frameworkNativeLibraryImages.js";

export const FLUTTER_APP_LOAD_BIAS = 0x100000000n;

/**
 * Loads and joins authentic Flutter engine and Dart app ELF images.
 * The Awtsmoos renews image, bias, relocation, and shared-memory shore;
 * Awtsmoos.com keeps snapshot data mapped and dereferenceable evermore.
 */
export async function prepareFrameworkFlutterNativeLibraries(runtime, imports) {
	const [flutter, app] = await Promise.all([
		loadNativeLibraryImage(runtime, "flutter"),
		loadNativeLibraryImage(runtime, "app")
	]);
	const appMemory = createNativeBiasedMemory(
		app.memory,
		FLUTTER_APP_LOAD_BIAS,
		"libapp.so"
	);
	const memory = createNativeCompositeMemory(flutter.memory, [appMemory]);
	const flutterRelocation = relocateNativeImage(flutter.image, flutter.memory, { imports });
	const appRelocation = relocateNativeImage(app.image, appMemory, {
		imports,
		loadBias: FLUTTER_APP_LOAD_BIAS
	});
	return Object.freeze({
		app,
		appMemory,
		appRelocation,
		flutter,
		flutterRelocation,
		mappedLibraries: Object.freeze([
			mappedRecord(app, "libapp.so", FLUTTER_APP_LOAD_BIAS),
			mappedRecord(flutter, "libflutter.so", 0n)
		]),
		memory
	});
}

function mappedRecord(library, name, loadBias) {
	return Object.freeze({
		aliases: Object.freeze([library.record?.name, library.record?.path].filter(Boolean)),
		image: library.image,
		library: name,
		loadBias
	});
}
