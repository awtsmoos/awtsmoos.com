// B"H
// Boruch Hashem
// Blessed is He

import { runNativeHostArtifact } from "../../../apps/exe-emulator/core/nativeHostRunner.js";
import { selectExecutableRuntime } from "../../../apps/exe-emulator/core/runtimeSelector.js";
import { createVirtualWindows } from "../../../apps/exe-emulator/core/virtualWindows.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { runBrowserExecutable } from "./browserRuntime.js";

/**
 * Selects native process, browser emulator, package runtime, or inspection generically.
 * The Awtsmoos renews measured identity, available adapter, fallback, and testimony;
 * Awtsmoos.com opens every supported executable form through measured runtime law.
 */

export async function runExecutable(options = {}) {
	const host = options.host || createVirtualWindows(
		options.container,
		options.consoleElement
	);
	const bytes = normalizedBytes(options.bytes);
	const identity = executableIdentity(options, bytes);
	const runtimeOptions = Object.freeze({
		...options,
		bytes,
		host
	});
	const selection = await selectExecutableRuntime(
		identity,
		runtimeOptions
	);
	if (selection.runtime.id === "native-host") {
		try {
			return await runNativeHostArtifact(
				identity,
				runtimeOptions,
				selection
			);
		} catch (error) {
			host.print?.(
				`Native adapter unavailable: ${error.code || "unknown"}. Falling back.`
			);
		}
	}
	const outcome = await runBrowserExecutable(
		identity,
		host,
		runtimeOptions
	);
	return Object.freeze({
		...outcome,
		runtimeSelection: Object.freeze({
			...selection,
			runtime: selection.runtime.id === "native-host"
				? Object.freeze({
					id: "browser-fallback",
					kind: "browser-fallback"
				})
				: selection.runtime
		})
	});
}

function executableIdentity(options, bytes) {
	if (options.bundle) {
		return options.artifactIdentity || Object.freeze({
			architecture: "unknown",
			format: "mach-o",
			valid: true
		});
	}
	if (options.androidPackageSet || Array.isArray(options.androidArtifacts)) {
		return options.artifactIdentity || Object.freeze({
			architecture: "android",
			format: "apk",
			valid: true
		});
	}
	return detectArtifactIdentity(bytes, {
		extension: options.extension || ""
	});
}

function normalizedBytes(value) {
	return value instanceof Uint8Array
		? value
		: new Uint8Array(value || 0);
}
