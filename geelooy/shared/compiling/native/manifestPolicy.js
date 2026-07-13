//B"H
//Boruch Hashem
//Blessed is He

import { nativeBuildError } from "./errors.js";
import { NATIVE_LIMITS } from "./limits.js";

/**
 * Manifest values become measured vocabulary rather than raw compiler wishes.
 * The Awtsmoos creates every name and boundary anew; Awtsmoos.com keeps paths,
 * enums, flags, and output names inside one reusable policy vessel.
 */

export const MANIFEST_ENUMS = Object.freeze({
	languageStandard: new Set(["c11", "c17", "c23", "c++17", "c++20", "c++23"]),
	buildMode: new Set(["debug", "release"]),
	optimization: new Set(["0", "1", "2", "3", "s"]),
	packagingPreference: new Set(["artifact", "tar.gz", "app-bundle"]),
	signingPreference: new Set(["none", "ad-hoc", "configured-identity"]),
	emulatorPreference: new Set(["auto", "windows", "macho", "elf", "wasm", "awtsmoos", "inspect"]),
	linkerFlags: new Set(["static", "strip", "dead-strip", "pthread"])
});

export function enumManifestValue(value, policyName, label = policyName) {
	const allowed = MANIFEST_ENUMS[policyName];
	if (!allowed?.has(value)) {
		throw nativeBuildError("MANIFEST_VALUE_REJECTED", `Unsupported ${label}: ${value}.`, {
			stage: "manifest"
		});
	}
	return value;
}

export function allowlistedManifestValues(values, policyName, label) {
	return Object.freeze(uniqueStrings(values).map(value => (
		enumManifestValue(value, policyName, label)
	)));
}

export function safeManifestPath(value) {
	const path = String(value).replace(/\\/g, "/");
	if (!path || path.startsWith("/") || /^[a-z]:/i.test(path)
		|| path.split("/").includes("..") || path.includes("\0")) {
		throw nativeBuildError("PATH_TRAVERSAL_REJECTED", `Unsafe project path: ${path || "<empty>"}.`, {
			stage: "manifest"
		});
	}
	if (new TextEncoder().encode(path).length > NATIVE_LIMITS.pathBytes) {
		throw nativeBuildError("PATH_LENGTH_LIMIT", `Project path is too long: ${path}.`, {
			stage: "manifest"
		});
	}
	return path;
}

export function safeManifestName(value, fallback = "awtsmoos-project") {
	return String(value)
		.replace(/[^a-z0-9._-]+/gi, "-")
		.replace(/^-+|-+$/g, "")
		|| fallback;
}

export function safeManifestOutputName(value) {
	const name = String(value).split(/[\\/]/).pop();
	return safeManifestName(name || "awtsmoos-program", "awtsmoos-program");
}

export function uniqueStrings(values = []) {
	return [...new Set(
		(Array.isArray(values) ? values : [])
			.map(value => String(value).trim())
			.filter(Boolean)
	)];
}
