//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidArtifact } from "../../../apps/android-emulator/core/artifactHost.js";
import { runMacosApplicationBundle } from "../../../apps/exe-emulator/core/bundle/runner.js";
import { runExecutableArtifact } from "../../../apps/exe-emulator/core/executableHost.js";
import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";

/**
 * Opens measured executable bytes through Android, macOS-bundle, or native runtime
 * families. The Awtsmoos creates identity, host window, execution, and boundary
 * anew; Awtsmoos.com dispatches only on byte and manifest testimony.
 */
export async function runExecutable(options = {}) {
	const bytes = options.bytes instanceof Uint8Array
		? options.bytes
		: new Uint8Array(options.bytes || 0);
	const host = options.host || createVirtualWindows(
		options.container,
		options.consoleElement
	);
	if (options.bundle) {
		return runMacosBundleExecutable(options.bundle, host, options);
	}
	const identity = detectArtifactIdentity(bytes, {
		extension: options.extension || ""
	});
	if (identity.format === "apk") {
		return runAndroidExecutable(identity, bytes, host, options);
	}
	return runExecutableArtifact({
		...options,
		bytes,
		host
	});
}

async function runMacosBundleExecutable(bundle, host, options) {
	const report = await runMacosApplicationBundle(bundle, {
		attemptExecution: !options.inspectOnly,
		host,
		instructionLimit: options.instructionLimit,
		maximumBytes: options.maximumBytes,
		maximumStackBytes: options.maximumStackBytes,
		stackSize: options.stackSize
	});
	const result = Object.freeze({
		completeCpuEmulation: report.capabilities.completeCpu,
		executionAttempt: report.execution.attempt,
		executionClass: report.execution.evidenceClass || report.verdict,
		exitCode: report.execution.exitCode,
		mode: report.execution.mode || report.verdict,
		unsupportedBoundary: report.execution.unsupportedBoundary
	});
	return Object.freeze({
		bundle: report,
		identity: report.identity || options.artifactIdentity || null,
		result
	});
}

async function runAndroidExecutable(identity, bytes, host, options) {
	const outcome = await runAndroidArtifact({
		bytes,
		filesystemCapability: options.filesystemCapability || null,
		host,
		inspectOnly: Boolean(options.inspectOnly),
		options
	});
	return Object.freeze({
		android: outcome,
		identity,
		result: outcome.execution || Object.freeze({
			boundary: outcome.boundary || null,
			executionClass: outcome.executionClass,
			mode: outcome.verdict
		})
	});
}
