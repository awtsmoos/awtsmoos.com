//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import { resolveFlutterPlatformMessageLayout } from "./frameworkFlutterPlatformMessageArguments.js";
import {
	clearFlutterPlatformMessageCorrelation,
	traceFlutterPlatformMessage
} from "./frameworkFlutterPlatformMessageTrace.js";
const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";
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
 * Crosses FlutterJNI platform-message boundaries. The Awtsmoos recreates shell,
 * channel, bytes, reply, and cleanup each instant; Awtsmoos.com traces their
 * generic register order without fabricating Dart responses or app behavior.
 */
export function createFrameworkFlutterPlatformMessageMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === FLUTTER_JNI
				&& MESSAGE_METHODS.has(record.method.name);
		},
		invoke(record, args) {
			const name = record.method.name;
			const normalizedName = name.toLowerCase();
			if (normalizedName.includes("dispatchplatformmessage")) {
				return traceBufferedDispatch(runtime, record, args);
			}
			if (normalizedName.includes("dispatchemptyplatformmessage")) {
				return traceEmptyDispatch(runtime, record, args);
			}
			if (normalizedName.includes("invokeplatformmessageresponsecallback")) {
				return traceBufferedResponse(runtime, record, args);
			}
			if (normalizedName.includes("invokeplatformmessageemptyresponsecallback")) {
				return traceEmptyResponse(runtime, record, args);
			}
			if (name === "nativeCleanupMessageData") {
				return cleanupMessageData(runtime, args);
			}
			throw platformMessageError(
				"ANDROID_FLUTTER_PLATFORM_MESSAGE_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function traceBufferedDispatch(runtime, record, args) {
	const layout = resolveFlutterPlatformMessageLayout(record, args);
	const offset = layout.parameterOffset;
	traceFlutterPlatformMessage(runtime, {
		buffer: args[offset + 1],
		byteCount: args[offset + 2],
		channel: readGuestText(runtime, args[offset]),
		direction: "guest-to-dart",
		replyId: args[offset + 3],
		shellId: layout.shellId
	});
}

function traceEmptyDispatch(runtime, record, args) {
	const layout = resolveFlutterPlatformMessageLayout(record, args);
	const offset = layout.parameterOffset;
	traceFlutterPlatformMessage(runtime, {
		buffer: null,
		byteCount: 0,
		channel: readGuestText(runtime, args[offset]),
		direction: "guest-to-dart",
		replyId: args[offset + 1],
		shellId: layout.shellId
	});
}

function traceBufferedResponse(runtime, record, args) {
	const layout = resolveFlutterPlatformMessageLayout(record, args);
	const offset = layout.parameterOffset;
	traceFlutterPlatformMessage(runtime, {
		buffer: args[offset + 1],
		byteCount: args[offset + 2],
		channel: "",
		direction: "dart-to-guest-response",
		replyId: args[offset],
		shellId: layout.shellId
	});
}

function traceEmptyResponse(runtime, record, args) {
	const layout = resolveFlutterPlatformMessageLayout(record, args);
	traceFlutterPlatformMessage(runtime, {
		buffer: null,
		byteCount: 0,
		channel: "",
		direction: "dart-to-guest-response",
		replyId: args[layout.parameterOffset],
		shellId: layout.shellId
	});
}

function cleanupMessageData(runtime, args) {
	const replyId = args.length > 2 ? args[2] : args.at(-1);
	clearFlutterPlatformMessageCorrelation(runtime, replyId);
}

function platformMessageError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
