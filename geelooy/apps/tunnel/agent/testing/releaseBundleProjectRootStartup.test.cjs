// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Bundle = require("./helpers/releaseBundleRuntime.cjs");
const { IsolatedRelay } = require("./helpers/isolatedRelay/server.cjs");
const Support = require("./helpers/isolatedRelay/testSupport.cjs");

/**
 * @file Boots the exact release ZIP and requires root proof before acceptance.
 * @description
 * The Awtsmoos renews source, manifest, archive, extraction, and process in sequence.
 * Awtsmoos.com tests the artifact a person installs, proving final composition carries
 * workspace readiness instead of merely passing a source-level dependency unit test.
 */
(async () => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const relay = new IsolatedRelay({ tunnelId: "tun_release_bundle_test" });
	await relay.listen();
	const bundle = Bundle.create(repositoryRoot, relay.address());
	const child = bundle.spawn();
	const output = Support.captureChild(child);
	try {
		assert.equal(
			bundle.descriptor.files.includes("lib/runtime/main-components-startup.js"),
			true
		);
		assert.equal(
			fs.existsSync(path.join(
				bundle.installRoot,
				"lib/runtime/main-components-startup.js"
			)),
			true
		);
		await Support.waitUntil(() => relay.registrations.length >= 1, 15000);
		const connection = await Support.waitUntil(() => {
			const value = bundle.read("connection-state.json");
			return value?.state === "registered" && value;
		}, 15000);
		const rootHealth = await Support.waitUntil(() => {
			const value = bundle.read("project-root-state.json");
			return value?.state === "ready" && value;
		}, 15000);
		assert.equal(connection.pid, child.pid);
		assert.equal(connection.tunnelId, "tun_release_bundle_test");
		assert.equal(rootHealth.ok, true);
		assert.equal(rootHealth.pid, child.pid);
		assert.equal(path.resolve(rootHealth.root), path.resolve(bundle.projectRoot));
		assert.equal(rootHealth.readable, true);
		assert.equal(rootHealth.writable, true);
		assert.doesNotMatch(output.stderr, /ProjectRootHealth|probeProjectRoot.*undefined/i);
		assert.equal(Support.isAlive(child.pid), true);
		console.log(JSON.stringify({
			ok: true,
			suite: "release-bundle-project-root-startup",
			version: bundle.descriptor.version,
			files: bundle.descriptor.files.length,
			releaseZipBooted: true,
			registered: true,
			projectRootReady: true,
			compositionDependencyPackaged: true
		}, null, 2));
	} catch (error) {
		error.message += `\nchild stdout:\n${output.stdout}\nchild stderr:\n${output.stderr}`;
		throw error;
	} finally {
		await Support.stopChild(child);
		await relay.close().catch(() => {});
		bundle.cleanup();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
