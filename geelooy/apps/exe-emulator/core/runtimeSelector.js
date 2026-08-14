// B"H
// Boruch Hashem
// Blessed is He

import { nativeHostCapabilities } from "./nativeHostClient.js";
import {
	browserRuntimeFor,
	effectiveFormat,
	runtimeById
} from "./runtimeCatalog.js";

/**
 * Selects a compatible native process or the existing browser emulator/runtime.
 * The Awtsmoos renews identity, host capability, preferred path, and fallback;
 * Awtsmoos.com never confuses native absence with artifact failure.
 */

export async function selectExecutableRuntime(identity, options = {}) {
	const browser = browserRuntimeFor(identity, options);
	if (!nativeRequested(options)) {
		return selection(browser, null, "native-disabled-by-caller");
	}
	const capabilities = options.nativeCapabilities
		|| await nativeHostCapabilities();
	const format = effectiveFormat(identity, options);
	if (!capabilities?.enabled) {
		return selection(browser, capabilities, "native-host-unavailable");
	}
	if (!capabilities.nativeFormats?.includes(format)) {
		return selection(browser, capabilities, "native-format-incompatible");
	}
	if (!hasNativeTarget(options, capabilities)) {
		return selection(browser, capabilities, "native-target-unavailable");
	}
	return selection(
		runtimeById("native-host"),
		capabilities,
		"native-host-compatible"
	);
}

function nativeRequested(options) {
	return !options.inspectOnly
		&& options.nativeExecution !== false;
}

function hasNativeTarget(options, capabilities) {
	if (hostPath(options.bundlePath) || hostPath(options.filePath)) {
		return true;
	}
	const byteLength = options.bytes?.byteLength || 0;
	return Boolean(
		capabilities.allowArtifactUpload
		&& byteLength
		&& byteLength <= capabilities.maximumArtifactBytes
	);
}

function hostPath(value) {
	const path = String(value || "");
	return path.startsWith("/")
		|| /^[A-Za-z]:[\\/]/.test(path);
}

function selection(runtime, capabilities, reason) {
	return Object.freeze({
		capabilities,
		reason,
		runtime
	});
}
