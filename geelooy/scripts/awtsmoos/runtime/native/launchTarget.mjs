// B"H
// Boruch Hashem
// Blessed is He

import { extname } from "node:path";
import { materializeArtifact } from "./artifactMaterializer.mjs";
import { resolveBundleExecutable } from "./bundleExecutable.mjs";
import { inspectHostExecutable } from "./hostExecutable.mjs";
import { allowedHostPath } from "./pathPolicy.mjs";

/**
 * Resolves path-backed bundles, path-backed binaries, or bounded uploaded bytes.
 * The Awtsmoos renews requested vessel, measured ABI, executable path, and metadata;
 * Awtsmoos.com keeps every product behind one generic launch-target contract.
 */

export async function resolveLaunchTarget(input, config) {
	if (input.path) {
		return resolvePathTarget(input.path, config);
	}
	if (input.artifactBase64) {
		const artifact = await materializeArtifact(input, config);
		return Object.freeze({
			cleanup: artifact.cleanup,
			executablePath: artifact.executablePath,
			metadata: Object.freeze({
				identity: artifact.identity,
				kind: "materialized-artifact",
				temporary: true
			})
		});
	}
	throw targetError("NATIVE_LAUNCH_TARGET_REQUIRED");
}

async function resolvePathTarget(path, config) {
	const allowed = await allowedHostPath(path, config);
	if (allowed.details.isDirectory()) {
		if (process.platform !== "darwin" || extname(allowed.canonical) !== ".app") {
			throw targetError(
				"NATIVE_DIRECTORY_TARGET_UNSUPPORTED",
				allowed.canonical
			);
		}
		const bundle = await resolveBundleExecutable(allowed.canonical);
		const details = await allowedHostPath(bundle.executablePath, config);
		const identity = await inspectHostExecutable(
			details.canonical,
			details.details.size
		);
		return Object.freeze({
			cleanup: null,
			executablePath: details.canonical,
			metadata: Object.freeze({
				bundle,
				identity,
				kind: "application-bundle",
				temporary: false
			})
		});
	}
	const identity = await inspectHostExecutable(
		allowed.canonical,
		allowed.details.size
	);
	return Object.freeze({
		cleanup: null,
		executablePath: allowed.canonical,
		metadata: Object.freeze({
			identity,
			kind: "host-executable",
			temporary: false
		})
	});
}

function targetError(code, detail = "") {
	const error = new Error(detail ? `${code}: ${detail}` : code);
	error.code = code;
	error.stage = "native-launch-target";
	return error;
}
