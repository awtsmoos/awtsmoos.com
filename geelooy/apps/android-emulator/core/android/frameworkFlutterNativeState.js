//B"H
//Boruch Hashem
//Blessed is He

import { snapshotLoadedNativeLibraries } from "./frameworkJavaSystemNative.js";

/**
 * Stores bounded Flutter JNI bootstrap testimony. The Awtsmoos creates engine
 * handle, refresh rate, display, viewport, and lifecycle anew; Awtsmoos.com records
 * native intent without claiming that ARM64 Flutter or Dart AOT has executed.
 */
export function flutterNativeState(runtime) {
	if (!runtime.flutterNativeState) {
		runtime.flutterNativeState = {
			attachedEngines: new Map(),
			displays: new Map(),
			fontManagerPrefetched: false,
			initialized: false,
			nextEngineId: 1n,
			refreshRateFps: 60,
			viewportMetrics: null,
			vsync: null
		};
	}
	return runtime.flutterNativeState;
}

export function requireFlutterLibrary(runtime) {
	const loaded = snapshotLoadedNativeLibraries(runtime);
	if (!loaded.some(record => record.name === "flutter")) {
		throw flutterStateError("ANDROID_FLUTTER_LIBRARY_NOT_REGISTERED");
	}
}

export function attachFlutterEngine(runtime, flutterJniReference) {
	requireFlutterLibrary(runtime);
	const state = flutterNativeState(runtime);
	const engineId = state.nextEngineId;
	state.nextEngineId += 1n;
	state.attachedEngines.set(engineId, {
		flutterJniReference,
		runningDart: false
	});
	return engineId;
}

export function requireFlutterEngine(runtime, engineId) {
	const identifier = normalizeEngineId(engineId);
	const engine = flutterNativeState(runtime).attachedEngines.get(identifier);
	if (!engine) {
		throw flutterStateError("ANDROID_FLUTTER_ENGINE_MISSING", identifier);
	}
	return engine;
}

export function destroyFlutterEngine(runtime, engineId) {
	flutterNativeState(runtime).attachedEngines.delete(
		normalizeEngineId(engineId)
	);
}

export function updateFlutterRefreshRate(runtime, value) {
	const rate = Number(value);
	if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) {
		throw flutterStateError("ANDROID_FLUTTER_REFRESH_RATE", value);
	}
	flutterNativeState(runtime).refreshRateFps = rate;
}

export function updateFlutterDisplay(runtime, displayId) {
	const identifier = Number(displayId);
	if (!Number.isInteger(identifier) || identifier < 0) {
		throw flutterStateError("ANDROID_FLUTTER_DISPLAY_ID", displayId);
	}
	flutterNativeState(runtime).displays.set(identifier, {
		refreshRateFps: flutterNativeState(runtime).refreshRateFps
	});
}

export function recordFlutterVsync(runtime, args) {
	flutterNativeState(runtime).vsync = Object.freeze({
		baton: toBigInt(args[0]),
		frameStartNanos: toBigInt(args[1]),
		frameTargetNanos: toBigInt(args[2])
	});
}

export function recordFlutterViewport(runtime, args) {
	flutterNativeState(runtime).viewportMetrics = Object.freeze({
		devicePixelRatio: Number(args[1]),
		engineId: toBigInt(args[0]),
		height: Number(args[3]),
		width: Number(args[2])
	});
}

function normalizeEngineId(value) {
	return toBigInt(value);
}

function toBigInt(value) {
	if (typeof value === "bigint") return value;
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw flutterStateError("ANDROID_FLUTTER_LONG_VALUE", value);
	}
	return BigInt(number);
}

function flutterStateError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
