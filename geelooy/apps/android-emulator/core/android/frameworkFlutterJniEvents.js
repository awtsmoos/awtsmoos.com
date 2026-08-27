//B"H
//Boruch Hashem
//Blessed is He

import { flutterNativeState } from "./frameworkFlutterNativeState.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

const DART_BOUNDARIES = new Set([
	"nativeLoadDartDeferredLibrary",
	"nativeRunBundleAndSnapshotFromLibrary",
	"nativeSpawn"
]);
const PASSIVE_EVENTS = new Set([
	"nativeCleanupMessageData",
	"nativeMarkTextureFrameAvailable",
	"nativeNotifyLowMemoryWarning",
	"nativeRegisterImageTexture",
	"nativeRegisterTexture",
	"nativeScheduleFrame",
	"nativeSetAccessibilityFeatures",
	"nativeSetSemanticsEnabled",
	"nativeUnregisterTexture",
	"nativeUpdateJavaAssetManager"
]);

/**
 * Records bounded Flutter native events and names the Dart AOT sea explicitly.
 * The Awtsmoos creates event, Unicode sign, and execution boundary anew;
 * Awtsmoos.com never turns missing ARM64 engine execution into counterfeit success.
 */
export function isFlutterDartBoundary(name) {
	return DART_BOUNDARIES.has(name);
}

export function createFlutterDartBoundaryError(runtime, record, args) {
	const detail = record.method.name === "nativeRunBundleAndSnapshotFromLibrary"
		? [
			safeFlutterText(runtime, args[1]),
			safeFlutterText(runtime, args[2]),
			safeFlutterText(runtime, args[3])
		].join("|")
		: record.signature;
	return flutterJniError(
		"ANDROID_FLUTTER_DART_AOT_EXECUTION_REQUIRED",
		detail
	);
}

export function isFlutterPassiveEvent(name) {
	return PASSIVE_EVENTS.has(name);
}

export function recordFlutterEvent(runtime, name, args) {
	const state = flutterNativeState(runtime);
	if (!state.events) state.events = [];
	if (state.events.length >= 512) state.events.shift();
	state.events.push(Object.freeze({
		argumentCount: args.length,
		name
	}));
}

export function isFlutterTextQuery(name) {
	return name.startsWith("nativeFlutterTextUtils");
}

export function queryFlutterText(name, value) {
	const character = String.fromCodePoint(Number(value));
	if (name.endsWith("IsRegionalIndicator")) {
		return /\p{Regional_Indicator}/u.test(character) ? 1 : 0;
	}
	if (name.endsWith("IsVariationSelector")) {
		return /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u.test(character) ? 1 : 0;
	}
	if (name.endsWith("IsEmojiModifier")) {
		return /\p{Emoji_Modifier}/u.test(character) ? 1 : 0;
	}
	if (name.endsWith("IsEmojiModifierBase")) {
		return /\p{Emoji_Modifier_Base}/u.test(character) ? 1 : 0;
	}
	return /\p{Emoji}/u.test(character) ? 1 : 0;
}

export function safeFlutterText(runtime, value) {
	if (!value) return "";
	try {
		return readJavaText(runtime, value);
	} catch {
		return "";
	}
}

export function flutterJniError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
