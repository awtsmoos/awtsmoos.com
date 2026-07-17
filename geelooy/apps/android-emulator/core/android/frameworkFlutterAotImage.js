//B"H
//Boruch Hashem
//Blessed is He

import { DART_AOT_SYMBOLS } from "../native/elf64Constants.js";
import { snapshotElf64Image } from "../native/elf64Image.js";
import { relocateNativeImage } from "../native/nativeRelocator.js";
import {
	aarch64TraceHistogram,
	traceAarch64Instructions
} from "../native/aarch64Trace.js";
import { safeFlutterText } from "./frameworkFlutterJniEvents.js";
import { requireFlutterEngine } from "./frameworkFlutterNativeState.js";
import { loadNativeLibraryImage } from "./frameworkNativeLibraryImages.js";

/**
 * Prepares authentic Flutter engine and Dart AOT images without claiming
 * execution. The Awtsmoos recreates snapshot, relocation, JNI doorway, and
 * trace anew; Awtsmoos.com advances only when guest bytes provide evidence.
 */
export async function prepareFlutterAotLaunch(runtime, args) {
	const engineId = args[0];
	const engine = requireFlutterEngine(runtime, engineId);
	const appLibraryName = requestedAppLibrary(runtime, args[4]);
	const [flutterLibrary, appLibrary] = await Promise.all([
		loadNativeLibraryImage(runtime, "flutter"),
		loadNativeLibraryImage(runtime, appLibraryName)
	]);
	const snapshotSymbols = readSnapshotSymbols(appLibrary.image);
	const nativeBootstrap = prepareFlutterNativeBootstrap(flutterLibrary);
	const report = Object.freeze({
		appImage: snapshotElf64Image(appLibrary.image),
		bundlePath: safeFlutterText(runtime, args[2]),
		entryPoint: safeFlutterText(runtime, args[3]) || "main",
		flutterImage: snapshotElf64Image(flutterLibrary.image),
		nativeBootstrap,
		snapshotSymbols
	});
	engine.aotLaunch = report;
	engine.runningDart = false;
	throw flutterAotError(
		"ANDROID_FLUTTER_AARCH64_JNI_EXECUTION_REQUIRED",
		`${nativeBootstrap.jniOnLoad.start}:${report.entryPoint}`
	);
}

function prepareFlutterNativeBootstrap(library) {
	const relocation = relocateNativeImage(library.image, library.memory);
	const symbol = library.image.findSymbol("JNI_OnLoad");
	if (!symbol) {
		throw flutterAotError("ANDROID_FLUTTER_JNI_ONLOAD_MISSING");
	}
	const instructions = traceAarch64Instructions(
		library.memory,
		symbol.value,
		64
	);
	return Object.freeze({
		instructionFamilies: aarch64TraceHistogram(instructions),
		jniOnLoad: Object.freeze({
			size: symbol.size.toString(),
			start: symbol.value.toString()
		}),
		relocation,
		trace: instructions
	});
}

function requestedAppLibrary(runtime, value) {
	const path = safeFlutterText(runtime, value);
	if (!path) return "app";
	const fileName = path.split("/").pop() || path;
	const match = /^lib(.+)\.so$/.exec(fileName);
	if (!match) {
		throw flutterAotError("ANDROID_FLUTTER_AOT_LIBRARY_PATH", path);
	}
	return match[1];
}

function readSnapshotSymbols(image) {
	const result = {};
	for (const name of DART_AOT_SYMBOLS) {
		const symbol = image.findSymbol(name);
		if (!symbol) {
			throw flutterAotError("ANDROID_FLUTTER_AOT_SYMBOL_MISSING", name);
		}
		result[name] = Object.freeze({
			size: symbol.size.toString(),
			value: symbol.value.toString()
		});
	}
	return Object.freeze(result);
}

function flutterAotError(code, detail = "") {
	const message = detail ? `${code}:${detail}` : code;
	const error = new Error(message);
	error.code = code;
	error.detail = detail;
	return error;
}
