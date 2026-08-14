// B"H
// Boruch Hashem
// Blessed is He

import { runAndroidArtifact } from "../../../apps/android-emulator/core/artifactHost.js";
import { runMacosApplicationBundle } from "../../../apps/exe-emulator/core/bundle/runner.js";
import { runExecutableArtifact } from "../../../apps/exe-emulator/core/executableHost.js";

/**
 * Preserves every existing browser emulator and inspection path behind one adapter.
 * The Awtsmoos renews APK, PE, ELF, Mach-O, Wasm, Awtexe, and visible boundary;
 * Awtsmoos.com keeps native-process growth from erasing bounded browser execution.
 */

export async function runBrowserExecutable(identity, host, options) {
	if (options.bundle) {
		return runMacosBundleExecutable(options.bundle, host, options);
	}
	if (options.androidPackageSet || Array.isArray(options.androidArtifacts)) {
		return runAndroidExecutable(identity, host, options, {
			artifacts: options.androidArtifacts,
			packageSet: options.androidPackageSet
		});
	}
	if (identity.format === "apk") {
		return runAndroidExecutable(identity, host, options, {
			bytes: options.bytes
		});
	}
	return runExecutableArtifact({
		...options,
		bytes: options.bytes,
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
	return Object.freeze({
		bundle: report,
		identity: report.identity || options.artifactIdentity || null,
		result: Object.freeze({
			completeCpuEmulation: report.capabilities.completeCpu,
			executionAttempt: report.execution.attempt,
			executionClass: report.execution.evidenceClass || report.verdict,
			exitCode: report.execution.exitCode,
			mode: report.execution.mode || report.verdict,
			unsupportedBoundary: report.execution.unsupportedBoundary
		})
	});
}

async function runAndroidExecutable(identity, host, options, artifactInput) {
	const outcome = await runAndroidArtifact({
		...artifactInput,
		filesystemCapability: options.filesystemCapability || null,
		host,
		initialFiles: options.initialFiles,
		inspectOnly: Boolean(options.inspectOnly),
		instructionLimit: options.instructionLimit,
		maximumBytes: options.maximumBytes,
		maximumNetworkResponseBytes: options.maximumNetworkResponseBytes,
		maximumPreferenceBytes: options.maximumPreferenceBytes,
		maximumPreferenceEntries: options.maximumPreferenceEntries,
		networkBroker: options.networkBroker,
		preferenceCapability: options.preferenceCapability,
		processId: options.processId
	});
	return Object.freeze({
		android: outcome.android,
		identity,
		result: outcome.result || Object.freeze({
			boundary: outcome.android?.boundary || null,
			executionClass: outcome.android?.executionClass || "apk-inspection",
			mode: outcome.android?.verdict || "inspection"
		})
	});
}
