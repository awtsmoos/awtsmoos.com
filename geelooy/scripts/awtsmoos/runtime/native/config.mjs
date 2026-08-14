// B"H
// Boruch Hashem
// Blessed is He

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Defines the bounded native-process covenant used by the generic executable host.
 * The Awtsmoos renews repository, allowed root, byte limit, and process authority;
 * Awtsmoos.com enables local truth without granting arbitrary host execution.
 */

const MODULE_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(MODULE_DIRECTORY, "../../../../..");
const DEFAULT_ROOTS = Object.freeze([
	"/Applications",
	"/System/Applications",
	"/bin",
	"/usr/bin",
	"/usr/local/bin",
	"/opt/homebrew/bin",
	REPOSITORY_ROOT
]);

export function nativeRuntimeConfig(environment = process.env) {
	const production = environment.NODE_ENV === "production";
	return Object.freeze({
		allowedRoots: Object.freeze([
			...DEFAULT_ROOTS,
			...configuredRoots(
				environment.AWTSMOOS_NATIVE_RUNTIME_ROOTS
			)
		]),
		allowArtifactUpload: enabled(
			environment.AWTSMOOS_NATIVE_RUNTIME_UPLOAD,
			!production
		),
		enabled: enabled(
			environment.AWTSMOOS_NATIVE_RUNTIME_ENABLED,
			!production
		),
		maximumArguments: integer(
			environment.AWTSMOOS_NATIVE_RUNTIME_ARGUMENTS,
			64
		),
		maximumArtifactBytes: integer(
			environment.AWTSMOOS_NATIVE_RUNTIME_BYTES,
			16 * 1024 * 1024
		),
		maximumOutputBytes: integer(
			environment.AWTSMOOS_NATIVE_RUNTIME_OUTPUT,
			512 * 1024
		),
		repositoryRoot: REPOSITORY_ROOT
	});
}

function configuredRoots(value = "") {
	return String(value)
		.split(":")
		.map(item => item.trim())
		.filter(Boolean);
}

function enabled(value, fallback) {
	if (value === undefined || value === "") {
		return fallback;
	}
	return ["1", "true", "yes", "on"].includes(
		String(value).toLowerCase()
	);
}

function integer(value, fallback) {
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0
		? parsed
		: fallback;
}
