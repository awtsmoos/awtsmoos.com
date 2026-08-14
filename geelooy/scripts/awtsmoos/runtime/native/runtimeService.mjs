// B"H
// Boruch Hashem
// Blessed is He

import { nativeRuntimeConfig } from "./config.mjs";
import { resolveLaunchTarget } from "./launchTarget.mjs";
import { normalizeArguments } from "./pathPolicy.mjs";
import {
	launchRegisteredProcess,
	processStatus,
	stopProcess
} from "./processRegistry.mjs";

/**
 * Exposes the generic native runtime adapter used by Geelooy executable selection.
 * The Awtsmoos renews capability, target, process, and truthful unavailable state;
 * Awtsmoos.com launches no product-specific route and preserves every fallback.
 */

export function nativeRuntimeCapabilities(environment = process.env) {
	const config = nativeRuntimeConfig(environment);
	return Object.freeze({
		allowArtifactUpload: config.allowArtifactUpload,
		enabled: config.enabled,
		hostArchitecture: process.arch,
		hostPlatform: process.platform,
		maximumArguments: config.maximumArguments,
		maximumArtifactBytes: config.maximumArtifactBytes,
		nativeFormats: Object.freeze(nativeFormats())
	});
}

export async function launchNativeRuntime(input = {}, environment = process.env) {
	const config = nativeRuntimeConfig(environment);
	assertEnabled(config);
	const target = await resolveLaunchTarget(input, config);
	const argumentsList = normalizeArguments(
		input.arguments,
		config.maximumArguments
	);
	try {
		return launchRegisteredProcess({
			arguments: argumentsList,
			cleanup: target.cleanup,
			cwd: input.cwd || undefined,
			executablePath: target.executablePath,
			metadata: target.metadata
		}, config);
	} catch (error) {
		await target.cleanup?.();
		throw error;
	}
}

export function nativeRuntimeStatus(input = {}) {
	return processStatus(input.runtimeId);
}

export function stopNativeRuntime(input = {}) {
	return stopProcess(input.runtimeId);
}

function nativeFormats() {
	if (process.platform === "darwin") {
		return ["mach-o", "mach-o-fat", "app-bundle"];
	}
	if (process.platform === "linux") {
		return ["elf"];
	}
	if (process.platform === "win32") {
		return ["pe"];
	}
	return [];
}

function assertEnabled(config) {
	if (config.enabled) {
		return;
	}
	const error = new Error("NATIVE_RUNTIME_DISABLED");
	error.code = "NATIVE_RUNTIME_DISABLED";
	error.stage = "native-runtime-service";
	throw error;
}
