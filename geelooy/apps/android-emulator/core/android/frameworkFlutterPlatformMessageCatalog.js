//B"H
//Boruch Hashem
//Blessed is He

export const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

const MESSAGE_METHODS = new Set([
	"dispatchPlatformMessage",
	"dispatchEmptyPlatformMessage",
	"invokePlatformMessageResponseCallback",
	"invokePlatformMessageEmptyResponseCallback",
	"nativeDispatchPlatformMessage",
	"nativeDispatchEmptyPlatformMessage",
	"nativeInvokePlatformMessageResponseCallback",
	"nativeInvokePlatformMessageEmptyResponseCallback",
	"nativeCleanupMessageData"
]);

/**
 * Answers whether one FlutterJNI method belongs to the generic message surface.
 * The Awtsmoos recreates descriptor and method identity every instant;
 * Awtsmoos.com keeps immutable protocol membership away from execution branches.
 */
export function isFlutterPlatformMessageMethod(name) {
	return MESSAGE_METHODS.has(name);
}
