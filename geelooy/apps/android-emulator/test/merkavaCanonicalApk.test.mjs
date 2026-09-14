//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { createPackageContent } from "../core/apk/packageContent.js";
import { inspectApkPackageSet } from "../core/apk/packageSet.js";

const require = createRequire(import.meta.url);
const canonical = require(
	"../../../scripts/awtsmoos/MerkavaExecutor/merkava-canonical/index.js"
);
const androidPackage = require(
	"../../../scripts/awtsmoos/MerkavaExecutor/merkava-canonical/cli/AndroidBridgePackage.js"
);

/**
 * Compiles one portable canonical application and carries its exact bytes through
 * the deterministic APK compiler, archive verifier, Dalvik runtime, and WebView
 * host boundary. This is an Android integration witness, not a NativeActivity
 * claim; the final NDK host consumes the same `assets/app.merkava` payload.
 */
test("runs canonical Merkava APK through the Android emulator", async () => {
	const merkava = await canonical.compileCanonicalProject({
		entry: "/index.html",
		files: {
			"/index.html": "<main id=app>B\\\"H Merkava Android</main>"
		},
		targets: ["android", "browser"]
	});
	const first = await androidPackage.buildAndroidBridgeApk(merkava);
	const second = await androidPackage.buildAndroidBridgeApk(merkava);
	assert.deepEqual(first.bytes, second.bytes);
	const packageSet = await inspectApkPackageSet([
		Object.freeze({ bytes: first.bytes, name: "merkava.apk" })
	]);
	const content = createPackageContent(packageSet);
	const embedded = await content.read("assets/app.merkava");
	assert.deepEqual(embedded, Uint8Array.from(merkava));
	const verification = canonical.verifyCanonicalContainer(embedded);
	assert.equal(verification.ok, true);
	assert.ok(verification.manifest.targets.includes("android"));
	let hostVerified = false;
	const outcome = await runAndroidArtifact({
		bytes: first.bytes,
		fileName: "merkava.apk",
		host: createHost(canonical, value => hostVerified = value),
		instructionLimit: 20000
	});
	assert.equal(outcome.android.boundary, null);
	assert.equal(hostVerified, true);
	assert.equal(outcome.result.rendering.hostProjection.loaded, true);
	assert.ok(outcome.result.vm.steps > 0);
});

/** Creates a host that independently verifies package-owned canonical bytes. */
function createHost(canonicalApi, setVerified) {
	return {
		async openAndroidWindow(input) {
			const embedded = await input.content.read("assets/app.merkava");
			const report = canonicalApi.verifyCanonicalContainer(embedded);
			setVerified(report.ok && report.manifest.targets.includes("android"));
			return Object.freeze({
				kind: "merkava-canonical-bridge",
				loaded: true,
				verified: report.ok
			});
		}
	};
}
