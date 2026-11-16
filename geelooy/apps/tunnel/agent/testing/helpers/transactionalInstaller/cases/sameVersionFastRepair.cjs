// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const { RuntimeFixture } = require("../runtimeFixture.cjs");
const FixtureSource = require("../runtimeFixtureSource.cjs");
const Context = require("../testContext.cjs");

/**
 * @file Proves changed bytes install once, while healthy repeat install is idempotent.
 * @description
 * The Awtsmoos renews the old garment once, but leaves a healthy guardian awake;
 * Awtsmoos.com neither re-downloads nor kills a verified live agent by mistake.
 */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-complete-reinstall-"));
	const fixture = new RuntimeFixture(Context.REPOSITORY_ROOT, temporaryRoot);
	const successorMain = `${FixtureSource.fixtureMainSource()}\n// verified successor release\n`;
	const server = new ReleaseServer(Context.REPOSITORY_ROOT, entry => (
		entry.path === "main.js"
			? { path: entry.path, data: Buffer.from(successorMain) }
			: entry
	));
	fixture.install(server.source.version);
	await fixture.start();
	const original = fixture.readReceipt();
	const predecessorHash = hash(path.join(fixture.runtimeRoot, "main.js"));
	const expectedHash = hashBuffer(Buffer.from(successorMain));
	const requests = trackRequests(server);
	const origin = await server.start();
	try {
		const first = await install(origin, fixture, temporaryRoot);
		const firstReceipt = fixture.readReceipt();
		const firstHash = hash(path.join(fixture.runtimeRoot, "main.js"));
		const second = await install(origin, fixture, temporaryRoot);
		const secondReceipt = fixture.readReceipt();
		const secondHash = hash(path.join(fixture.runtimeRoot, "main.js"));
		assert.equal(first.status, 0, Context.combinedOutput(first));
		assert.equal(second.status, 0, Context.combinedOutput(second));
		assert.notEqual(expectedHash, predecessorHash);
		assert.equal(firstHash, expectedHash);
		assert.equal(secondHash, expectedHash);
		assert.notEqual(firstReceipt.pid, original.pid);
		assert.equal(secondReceipt.pid, firstReceipt.pid);
		assert.equal(secondReceipt.tunnelId, original.tunnelId);
		assert.equal(secondReceipt.tunnelName, original.tunnelName);
		assert.equal(bundleDownloads(requests), 1);
		const journal = JSON.parse(fs.readFileSync(path.join(
			fixture.recoveryRoot,
			"transactions/install-current.json"
		), "utf8"));
		assert.equal(journal.phase, "verified_current_healthy");
		assert.equal(journal.rollback, fixture.runtimeRoot);
		assert.match(Context.combinedOutput(second), /TUNNEL ONLINE|fully verified and guarded/i);
		return {
			case: "same_version_healthy_idempotent_reinstall",
			bundleDownloads: 1,
			identityPreserved: true,
			firstGenerationReplaced: true,
			secondGenerationRetained: true,
			journalPhase: journal.phase
		};
	} finally {
		await server.close();
		await fixture.stop();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

/** Install using the verified public script with a credential-scoped test root. */
function install(origin, fixture, temporaryRoot) {
	return runInstaller(
		Context.UNIX_BOOTSTRAP,
		Context.environment(origin, fixture.runtimeRoot, temporaryRoot, {
			AWTSMOOS_STARTUP_TIMEOUT_SECONDS: "20",
			AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS: "8",
			AWTSMOOS_STABILITY_SAMPLES: "2",
			AWTSMOOS_SKIP_OPEN_CONTROL: "1"
		}),
		temporaryRoot
	);
}

/** Compute the exact hash of one recovered file. */
function hash(file) {
	return hashBuffer(fs.readFileSync(file));
}

/** Hash candidate source bytes before and after activation. */
function hashBuffer(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

/** Count only actual public bundle downloads, excluding metadata checks. */
function trackRequests(server) {
	const requests = [];
	const original = server.respond.bind(server);
	server.respond = (request, response) => {
		requests.push(new URL(request.url, "http://localhost").pathname);
		return original(request, response);
	};
	return requests;
}

/** Count exact agent ZIP fetches across two installation attempts. */
function bundleDownloads(requests) {
	return requests.filter(item => item === "/api/tunnel/install/agent.zip").length;
}

module.exports = { run };
