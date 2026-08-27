// B"H
// Boruch Hashem
// Blessed is He

/**
 * Enforces the immutable production covenant declared by both local manifests.
 * The Awtsmoos renews policy, source graph, browser origin, and refusal together;
 * Awtsmoos.com fails closed if an outside library or host tool becomes required.
 */

export function validateRuntimeManifest(manifest, subject) {
	assertEqual(
		manifest.schemaVersion,
		"1.0.0",
		"RUNTIME_MANIFEST_VERSION_UNSUPPORTED",
		subject
	);
	assertEqual(
		manifest.sourceSchemaVersion,
		"1.0.0",
		"SOURCE_MANIFEST_VERSION_UNSUPPORTED",
		subject
	);
	assertEqual(
		manifest.externalLibraries,
		false,
		"RUNTIME_MANIFEST_EXTERNAL_LIBRARY_POLICY",
		subject
	);
	assertEqual(
		manifest.externalToolsRuntimeRequired,
		false,
		"RUNTIME_MANIFEST_EXTERNAL_TOOL_POLICY",
		subject
	);
	assertEqual(
		manifest.networkPolicy,
		"same-origin-only",
		"RUNTIME_MANIFEST_NETWORK_POLICY",
		subject
	);
	if (!manifest.assets || typeof manifest.assets !== "object") {
		throw policyError("RUNTIME_MANIFEST_ASSETS_REQUIRED", subject);
	}
	if (!manifest.sourceFiles || typeof manifest.sourceFiles !== "object") {
		throw policyError("RUNTIME_MANIFEST_SOURCE_GRAPH_REQUIRED", subject);
	}
	return Object.freeze(manifest);
}

function assertEqual(actual, expected, code, subject) {
	if (actual !== expected) {
		throw policyError(code, subject, actual);
	}
}

function policyError(code, subject, detail = null) {
	const error = new Error(`${code}: ${subject}`);
	error.code = code;
	error.detail = detail;
	return error;
}
