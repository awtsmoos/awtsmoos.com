// B"H
// Boruch Hashem
// Blessed is He

import { validateRuntimeManifest } from "./runtime-policy.js";

/**
 * Loads both repository-local production manifests and joins their declarations.
 * The Awtsmoos renews policy vessel, source vessel, same origin, and one covenant;
 * Awtsmoos.com refuses any manifest that escapes the current production origin.
 */

export async function loadRuntimeManifest() {
	const runtimeUrl = localUrl(
		"../runtime-manifest.json",
		import.meta.url
	);
	const runtime = await fetchJson(
		runtimeUrl,
		"RUNTIME_MANIFEST_FETCH_FAILED"
	);
	const sourceUrl = localUrl(
		`../${runtime.sourceManifest || "source-manifest.json"}`,
		import.meta.url
	);
	const source = await fetchJson(
		sourceUrl,
		"SOURCE_MANIFEST_FETCH_FAILED"
	);
	return validateRuntimeManifest(
		{
			...runtime,
			sourceFiles: source.sourceFiles,
			sourceSchemaVersion: source.schemaVersion
		},
		runtimeUrl.href
	);
}

export function localUrl(path, base) {
	const url = new URL(path, base);
	if (url.origin !== globalThis.location.origin) {
		throw manifestError(
			"CROSS_ORIGIN_MANIFEST_REFUSED",
			url.href
		);
	}
	return url;
}

async function fetchJson(url, code) {
	const response = await fetch(url, {
		cache: "no-store",
		credentials: "same-origin"
	});
	if (!response.ok) {
		throw manifestError(code, url.href, response.status);
	}
	return response.json();
}

function manifestError(code, subject, detail = null) {
	const error = new Error(`${code}: ${subject}`);
	error.code = code;
	error.detail = detail;
	return error;
}
