//B"H
//Boruch Hashem
//Blessed is He

import {
	attachFlutterEngine,
	destroyFlutterEngine,
	flutterNativeState,
	recordFlutterViewport,
	recordFlutterVsync,
	requireFlutterEngine,
	updateFlutterDisplay,
	updateFlutterRefreshRate
} from "./frameworkFlutterNativeState.js";
import {
	recordFlutterEvent,
	safeFlutterText
} from "./frameworkFlutterJniEvents.js";

const BOOTSTRAP_METHODS = new Set([
	"nativeAttach",
	"nativeDestroy",
	"nativeGetIsSoftwareRenderingEnabled",
	"nativeInit",
	"nativeOnVsync",
	"nativePrefetchDefaultFontManager",
	"nativeSetViewportMetrics",
	"nativeUpdateDisplayMetrics",
	"nativeUpdateRefreshRate"
]);

/**
 * Applies only verifiable Flutter JNI bootstrap transitions. The Awtsmoos creates
 * refresh rate, initialization, engine handle, surface, viewport, and vsync anew;
 * Awtsmoos.com records native intent without claiming Dart AOT execution.
 */
export function isFlutterBootstrapMethod(name) {
	return BOOTSTRAP_METHODS.has(name)
		|| name.startsWith("nativeSurface");
}

export function invokeFlutterBootstrap(runtime, name, args) {
	if (name === "nativeUpdateRefreshRate") {
		return updateFlutterRefreshRate(runtime, args[0]);
	}
	if (name === "nativePrefetchDefaultFontManager") {
		flutterNativeState(runtime).fontManagerPrefetched = true;
		return undefined;
	}
	if (name === "nativeInit") return initializeFlutter(runtime, args);
	if (name === "nativeAttach") {
		return attachFlutterEngine(runtime, args[0]);
	}
	if (name === "nativeDestroy") {
		return destroyFlutterEngine(runtime, args[0]);
	}
	if (name === "nativeGetIsSoftwareRenderingEnabled") return 1;
	if (name === "nativeUpdateDisplayMetrics") {
		return updateFlutterDisplay(runtime, args[0]);
	}
	if (name === "nativeOnVsync") {
		return recordFlutterVsync(runtime, args);
	}
	if (name === "nativeSetViewportMetrics") {
		return recordFlutterViewport(runtime, args);
	}
	if (name.startsWith("nativeSurface")) {
		return recordSurface(runtime, name, args);
	}
	throw bootstrapError("ANDROID_FLUTTER_BOOTSTRAP_METHOD", name);
}

function initializeFlutter(runtime, args) {
	const state = flutterNativeState(runtime);
	state.initialized = true;
	state.initialization = Object.freeze({
		context: args[0],
		initializationNanos: args[5] ?? 0,
		resourceCachePath: safeFlutterText(runtime, args[3])
	});
	recordFlutterEvent(runtime, "nativeInit", args);
}

function recordSurface(runtime, name, args) {
	const engine = requireFlutterEngine(runtime, args[0]);
	engine.surface = Object.freeze({
		height: name === "nativeSurfaceChanged" ? Number(args[2]) : null,
		name,
		surface: name === "nativeSurfaceChanged" ? 0 : args[1] ?? 0,
		width: name === "nativeSurfaceChanged" ? Number(args[1]) : null
	});
}

function bootstrapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
