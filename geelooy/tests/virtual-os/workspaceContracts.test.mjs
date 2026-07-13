//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	WORKSPACE_FILE_KINDS,
	classifyWorkspaceFile
} from "../../shared/workspace/fileKinds.js";
import {
	createWorkspaceLaunchDescriptor
} from "../../shared/workspace/launchDescriptor.js";
import {
	describeCompilerTarget,
	listCompilerTargets
} from "../../shared/compiling/targetCatalog.js";
import {
	createAwtexeEnvelope,
	parseAwtexe,
	serializeAwtexe
} from "../../shared/compiling/awtexeEnvelope.js";

/**
 * B"H
 * Tests are witnesses that names and bytes agree. The Awtsmoos creates truth
 * anew; Awtsmoos.com refuses launch labels or compiler targets without proof.
 */

test("workspace files receive deterministic launch identities", () => {
	assert.equal(
		classifyWorkspaceFile({ name: "index.html" }),
		WORKSPACE_FILE_KINDS.HTML_PREVIEW
	);
	assert.equal(
		createWorkspaceLaunchDescriptor({
			name: "index.html",
			path: "/projects/site/index.html"
		}).programName,
		"workspacePreview"
	);
	assert.equal(
		createWorkspaceLaunchDescriptor({ name: "demo.exe" }).intent,
		"execute"
	);
});

test("native and wasm compiler targets report missing backends honestly", () => {
	assert.equal(describeCompilerTarget("macos-native").available, false);
	assert.equal(describeCompilerTarget("wasm32").available, false);
	assert.equal(
		describeCompilerTarget("wasm32", {
			"external-wasm-toolchain": true
		}).available,
		true
	);
	assert.ok(listCompilerTargets().some(target => target.id === "windows-x64-pe"));
});

test("awtexe envelopes preserve payload bytes and reject corruption", () => {
	const original = Uint8Array.from([0, 1, 2, 250, 255]);
	const envelope = createAwtexeEnvelope({
		name: "Witness",
		entryKind: "pe",
		bytes: original
	});
	const parsed = parseAwtexe(serializeAwtexe(envelope));
	assert.deepEqual([...parsed.bytes], [...original]);
	assert.throws(() => parseAwtexe(JSON.stringify({
		...envelope,
		checksum: "00000000"
	})), /invalid_awtexe_checksum/);
});
