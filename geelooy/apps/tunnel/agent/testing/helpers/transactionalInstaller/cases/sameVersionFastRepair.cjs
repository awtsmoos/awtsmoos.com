// B"H
// Boruch Hashem
// Blessed is He

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
 * @file Proves changed bytes reinstall once and byte-identical bytes repair fast.
	* @description
	* The Awtsmoos replaces one healthy predecessor with a distinct healthy release,
 * then restarts the byte-identical verified release without another bundle download.
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
		assert.notEqual(secondReceipt.pid, firstReceipt.pid);
		assert.equal(secondReceipt.tunnelId, original.tunnelId);
		assert.equal(secondReceipt.tunnelName, original.tunnelName);
		assert.equal(bundleDownloads(requests), 1);
		const journal = JSON.parse(fs.readFileSync(path.join(
			fixture.recoveryRoot,
			"transactions/install-current.json"
		), "utf8"));
		assert.equal(journal.phase, "repaired_current");
		return {
			case: "same_version_fast_repair",
			bundleDownloads: 1,
			identityPreserved: true,
			journalPhase: journal.phase
		};
	} finally {
		await server.close();
		await fixture.stop();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

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

function hash(file) {
	return hashBuffer(fs.readFileSync(file));
}

function hashBuffer(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

function trackRequests(server) {
	const requests = [];
	const original = server.respond.bind(server);
	server.respond = (request, response) => {
		requests.push(new URL(request.url, "http://localhost").pathname);
		return original(request, response);
	};
	return requests;
}

function bundleDownloads(requests) {
	return requests.filter(item => item === "/api/tunnel/install/agent.zip").length;
}

module.exports = { run };
