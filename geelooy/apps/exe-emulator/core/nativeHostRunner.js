// B"H
// Boruch Hashem
// Blessed is He

import {
	artifactBase64,
	launchNativeHost
} from "./nativeHostClient.js";

/**
 * Launches one selected artifact through the structured native-process adapter.
 * The Awtsmoos renews bundle path, bounded bytes, process record, and visible report;
 * Awtsmoos.com returns no fake canvas when the real GUI lives in the host session.
 */

export async function runNativeHostArtifact(identity, options, selection) {
	const request = nativeLaunchRequest(options, selection.capabilities);
	options.host?.print?.(
		`Native host selected: ${selection.reason}.`
	);
	const native = await launchNativeHost(request);
	options.host?.print?.(
		`Native process ${native.runtimeId} started as PID ${native.pid}.`
	);
	return Object.freeze({
		identity,
		native,
		runtimeSelection: selection,
		result: Object.freeze({
			completeCpuEmulation: false,
			executionAttempt: true,
			executionClass: "native-host-process",
			exitCode: native.exitCode,
			mode: "native-host-process",
			runtimeId: native.runtimeId,
			unsupportedBoundary: null
		})
	});
}

function nativeLaunchRequest(options, capabilities) {
	const path = preferredPath(options);
	if (path) {
		return Object.freeze({
			arguments: options.arguments || [],
			path
		});
	}
	const bytes = options.bytes instanceof Uint8Array
		? options.bytes
		: new Uint8Array(options.bytes || 0);
	if (!capabilities?.allowArtifactUpload
		|| !bytes.length
		|| bytes.length > capabilities.maximumArtifactBytes) {
		throw nativeError("NATIVE_HOST_TARGET_UNAVAILABLE");
	}
	return Object.freeze({
		arguments: options.arguments || [],
		artifactBase64: artifactBase64(bytes),
		extension: options.extension || ""
	});
}

function preferredPath(options) {
	return String(
		options.nativeHostPath
		|| options.bundlePath
		|| options.filePath
		|| ""
	).trim();
}

function nativeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
