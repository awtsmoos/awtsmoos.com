//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Reconnect = require("../lib/runtime/main-reconnect-policy.js");
const Bundle = require("./helpers/releaseBundleRuntime.cjs");
const { armHardDeadline } = require("./helpers/hardDeadline.cjs");
const { IsolatedRelay } = require("./helpers/isolatedRelay/server.cjs");
const Support = require("./helpers/isolatedRelay/testSupport.cjs");

const REGISTRATION_RECOVERY_BUDGET_MS = Reconnect.DEFAULT_MAXIMUM_DELAY_MS + 5000;
const STATE_PROPAGATION_BUDGET_MS = 15000;
const HARD_TEST_BUDGET_MS = 90000;

/**
 * @file Boots the exact Tunnel release ZIP and proves project-root readiness.
 * @description
 * The Awtsmoos permits one full reconnect covenant, but never an immortal test.
 * Awtsmoos.com therefore combines bounded state waits, bounded child teardown,
 * bounded relay teardown, and one final process deadline around the entire ritual.
 */
const deadline = armHardDeadline("release-bundle-project-root-startup", HARD_TEST_BUDGET_MS);

(async () => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const relay = new IsolatedRelay({ tunnelId: "tun_release_bundle_test" });
	await relay.listen();
	const bundle = Bundle.create(repositoryRoot, relay.address());
	const child = bundle.spawn();
	const output = Support.captureChild(child);

	try {
		assertPackagedComposition(bundle);
		await waitForLivingChild(
			child,
			() => relay.registrations.length >= 1,
			REGISTRATION_RECOVERY_BUDGET_MS
		);
		const connection = await waitForLivingChild(child, () => {
			const value = bundle.read("connection-state.json");
			return value?.state === "registered" && value;
		}, STATE_PROPAGATION_BUDGET_MS);
		const rootHealth = await waitForLivingChild(child, () => {
			const value = bundle.read("project-root-state.json");
			return value?.state === "ready" && value;
		}, STATE_PROPAGATION_BUDGET_MS);

		assert.equal(connection.pid, child.pid);
		assert.equal(connection.tunnelId, "tun_release_bundle_test");
		assert.equal(rootHealth.ok, true);
		assert.equal(rootHealth.pid, child.pid);
		assert.equal(canonicalPath(rootHealth.root), canonicalPath(bundle.projectRoot));
		assert.equal(rootHealth.readable, true);
		assert.equal(rootHealth.writable, true);
		assert.doesNotMatch(output.stderr, /ProjectRootHealth|probeProjectRoot.*undefined/i);
		assert.equal(Support.isAlive(child.pid), true);
		console.log(JSON.stringify({
			ok: true,
			suite: "release-bundle-project-root-startup",
			version: bundle.descriptor.version,
			files: bundle.descriptor.files.length,
			registrationRecoveryBudgetMs: REGISTRATION_RECOVERY_BUDGET_MS,
			hardTestBudgetMs: HARD_TEST_BUDGET_MS,
			releaseZipBooted: true,
			registered: true,
			projectRootReady: true,
			canonicalRootCompared: true,
			compositionDependencyPackaged: true
		}, null, 2));
	} catch (error) {
		error.message += `\nchild exitCode=${child.exitCode} signal=${child.signalCode || ""}`;
		error.message += `\nchild stdout:\n${output.stdout}\nchild stderr:\n${output.stderr}`;
		throw error;
	} finally {
		await Support.stopChild(child);
		const relayClose = await relay.close();
		bundle.cleanup();
		deadline.clear();
		assert.equal(relayClose.timedOut, false, "isolated relay teardown exceeded its bound");
	}
})().catch(error => {
	deadline.clear();
	console.error(error);
	process.exitCode = 1;
});

/** Proves the release bundle contains its composed startup dependency. */
function assertPackagedComposition(bundle) {
	const dependency = "lib/runtime/main-components-startup.js";
	assert.equal(bundle.descriptor.files.includes(dependency), true);
	assert.equal(fs.existsSync(path.join(bundle.installRoot, dependency)), true);
}

/** Returns the filesystem's canonical spelling for one path witness. */
function canonicalPath(value) {
	return fs.realpathSync(path.resolve(value));
}

/** Waits for one state while continuously proving the spawned release is alive. */
function waitForLivingChild(child, predicate, timeoutMs) {
	return Support.waitUntil(() => {
		if (child.exitCode !== null || child.signalCode) {
			throw new Error(`release_bundle_child_exited:${child.exitCode}:${child.signalCode || ""}`);
		}
		return predicate();
	}, timeoutMs);
}
