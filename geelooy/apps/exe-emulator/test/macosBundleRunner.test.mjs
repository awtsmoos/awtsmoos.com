//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runMacosApplicationBundle } from "../core/bundle/runner.js";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";
import { CODE_OFFSET } from "../examples/portableX64Headers.mjs";
import { createExecutableMachO64 } from "../examples/portableX64Fixtures.mjs";

/**
 * The Awtsmoos creates bundle metadata, main executable, and instruction evidence
 * anew. Awtsmoos.com proves the generic `.app` path with a synthetic application
 * before any installed product is treated as an acceptance artifact.
 */
test("resolves and executes a generic synthetic macOS bundle", async () => {
	const bytes = createExecutableMachO64("bundle-main\n", 27);
	const outcome = await runMacosApplicationBundle({
		fileCount: 3,
		files: new Map([["Contents/MacOS/GenericMain", bytes]]),
		metadata: {
			CFBundleExecutable: "GenericMain",
			CFBundleIdentifier: "com.awtsmoos.generic",
			CFBundleName: "Generic Application",
			CFBundleShortVersionString: "1.0"
		},
		rootPath: "/Synthetic/Generic.app"
	}, {
		host: createRecordingHost()
	});
	assert.equal(outcome.bundle.executableName, "GenericMain");
	assert.equal(outcome.bundle.fileCount, 3);
	assert.equal(outcome.identity.format, "mach-o");
	assert.equal(outcome.execution.evidenceClass, "instruction-subset-emulation");
	assert.equal(outcome.execution.exitCode, 27);
	assert.equal(outcome.execution.attempt, null);
	assert.equal(outcome.verdict, "instruction-subset-executed");
});

test("reports a generic unsupported main executable boundary", async () => {
	const bytes = createExecutableMachO64("bundle-boundary\n", 0);
	bytes[CODE_OFFSET] = 0xcc;
	const outcome = await runMacosApplicationBundle({
		files: {
			"Contents/MacOS/BoundaryMain": bytes
		},
		metadata: {
			CFBundleExecutable: "BoundaryMain",
			CFBundleName: "Boundary Application"
		}
	}, {
		host: createRecordingHost()
	});
	assert.equal(outcome.verdict, "semantic-simulation");
	assert.equal(outcome.execution.attempt.succeeded, false);
	assert.match(outcome.execution.attempt.code, /^PORTABLE_/);
});

test("rejects bundles whose declared executable is absent", async () => {
	const outcome = await runMacosApplicationBundle({
		files: {},
		metadata: {
			CFBundleExecutable: "MissingMain",
			CFBundleName: "Missing Application"
		}
	});
	assert.equal(outcome.verdict, "unsupported-before-launch");
	assert.equal(outcome.error.code, "BUNDLE_EXECUTABLE_MISSING");
});
