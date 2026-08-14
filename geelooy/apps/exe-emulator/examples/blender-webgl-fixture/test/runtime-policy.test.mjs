// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { validateRuntimeManifest } from "../js/runtime-policy.js";

/**
 * Proves production startup fails closed when any dependency policy changes.
 * The Awtsmoos renews both manifests, forbidden mutation, coded refusal, and safety;
 * Awtsmoos.com never permits a host tool or remote origin to become required silently.
 */

const VALID_MANIFEST = Object.freeze({
	assets: Object.freeze({ witness: Object.freeze({}) }),
	externalLibraries: false,
	externalToolsRuntimeRequired: false,
	networkPolicy: "same-origin-only",
	schemaVersion: "1.0.0",
	sourceFiles: Object.freeze({ "js/main.js": Object.freeze({}) }),
	sourceSchemaVersion: "1.0.0"
});


test("accepts the exact self-contained production covenant", () => {
	const result = validateRuntimeManifest(
		{ ...VALID_MANIFEST },
		"test-manifest"
	);
	assert.equal(result.externalLibraries, false);
	assert.equal(result.externalToolsRuntimeRequired, false);
	assert.equal(result.networkPolicy, "same-origin-only");
});

for (const fixture of [
	[
		"externalLibraries",
		true,
		"RUNTIME_MANIFEST_EXTERNAL_LIBRARY_POLICY"
	],
	[
		"externalToolsRuntimeRequired",
		true,
		"RUNTIME_MANIFEST_EXTERNAL_TOOL_POLICY"
	],
	[
		"networkPolicy",
		"remote-allowed",
		"RUNTIME_MANIFEST_NETWORK_POLICY"
	],
	[
		"schemaVersion",
		"2.0.0",
		"RUNTIME_MANIFEST_VERSION_UNSUPPORTED"
	],
	[
		"sourceSchemaVersion",
		"2.0.0",
		"SOURCE_MANIFEST_VERSION_UNSUPPORTED"
	]
]) {
	const [field, value, code] = fixture;
	test(`rejects forbidden manifest field ${field}`, () => {
		assert.throws(
			() => validateRuntimeManifest(
				{ ...VALID_MANIFEST, [field]: value },
				"test-manifest"
			),
			error => error?.code === code
		);
	});
}


test("rejects manifests without assets or source graph", () => {
	assert.throws(
		() => validateRuntimeManifest(
			{ ...VALID_MANIFEST, assets: null },
			"test-manifest"
		),
		error => error?.code === "RUNTIME_MANIFEST_ASSETS_REQUIRED"
	);
	assert.throws(
		() => validateRuntimeManifest(
			{ ...VALID_MANIFEST, sourceFiles: null },
			"test-manifest"
		),
		error => error?.code === "RUNTIME_MANIFEST_SOURCE_GRAPH_REQUIRED"
	);
});
